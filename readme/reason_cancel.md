# Reason Cancel API Documentation

## Tổng quan

API quản lý hệ thống lý do hủy (reason cancel) cho ứng dụng Migii HSK, cho phép thu thập phản hồi từ người dùng khi họ hủy dịch vụ hoặc thực hiện các hành động hủy bỏ. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Reason Cancel Management](#reason-cancel-management)
  - [POST /reason-cancel](#post-reason-cancel)
- [Data Transfer Objects](#data-transfer-objects)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)

---

## Reason Cancel Management

### POST `/reason-cancel`

Tạo mới lý do hủy từ người dùng hoặc guest.

**URL:** `/reason-cancel`  
**Method:** `POST`  
**Authentication:** None  

#### Headers

| Header       | Type   | Required | Description      |
|--------------|--------|----------|------------------|
| Content-Type | string | Yes      | application/json |

#### Request Body

```json
{
  "userId": 123,
  "description": "Giá cả không phù hợp với tài chính hiện tại"
}
```

#### Request Body Fields

| Field       | Type   | Required | Description                           |
|-------------|--------|----------|---------------------------------------|
| userId      | number | No       | ID người dùng (null nếu là guest)     |
| description | string | Yes      | Lý do hủy chi tiết                    |

#### Response

**Success Response:**
- **Code:** 201 Created
- **Content:**
```json
{
  "message": "Success!"
}
```

#### Error Responses

**Internal Server Error:**
- **Code:** 500 Internal Server Error
- **Content:**
```json
{
  "message": "Internal Server Error",
  "statusCode": 500
}
```

#### Validation Rules

- `userId`: Optional, phải là số nguyên nếu có
- `description`: Required, không được để trống

#### Ví dụ sử dụng

```javascript
// Request với user đã đăng nhập
POST /reason-cancel
Content-Type: application/json

{
  "userId": 123,
  "description": "Không sử dụng thường xuyên"
}

// Request từ guest user
POST /reason-cancel
Content-Type: application/json

{
  "description": "Tìm thấy ứng dụng khác tốt hơn"
}

// Response
{
  "message": "Success!"
}
```

---

## Data Transfer Objects

### ReasonCancelDto

DTO cho việc tạo mới lý do hủy.

```typescript
interface ReasonCancelDto {
  userId?: number;    // Optional - ID người dùng
  description: string; // Required - Lý do hủy
}
```

#### Fields

| Field       | Type   | Required | Default | Description                    |
|-------------|--------|----------|---------|--------------------------------|
| userId      | number | No       | null    | ID người dùng (null cho guest) |
| description | string | Yes      | -       | Mô tả lý do hủy chi tiết       |

#### Validation Rules

- `userId`: 
  - `@IsNumber()` - Phải là số nguyên
  - `@IsOptional()` - Có thể bỏ trống
  - Default: `null`

- `description`: 
  - Required field
  - Không được để trống
  - Kiểu string

---

## Database Schema

### reasons_cancel Table

Lưu trữ thông tin lý do hủy từ người dùng.

```sql
CREATE TABLE reasons_cancel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULLABLE,
  description TEXT NULLABLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_id ON reasons_cancel(user_id);
CREATE INDEX idx_created_at ON reasons_cancel(created_at);
```

#### Table Fields

| Column      | Type      | Null | Description                    |
|-------------|-----------|------|--------------------------------|
| id          | INT       | No   | Primary key                    |
| user_id     | INT       | Yes  | ID người dùng (nullable)       |
| description | TEXT      | Yes  | Lý do hủy chi tiết             |
| created_at  | TIMESTAMP | No   | Thời gian tạo                  |
| updated_at  | TIMESTAMP | No   | Thời gian cập nhật             |

#### Database Configuration

- **Database:** `admin_hsk`
- **Table Name:** `reasons_cancel`
- **Entity Name:** `ReasonCancelEntity`

---

## Business Logic

### User Tracking

1. **Registered Users:** Có `userId` để track feedback theo user cụ thể
2. **Guest Users:** `userId = null` cho anonymous feedback
3. **Data Analytics:** Tất cả feedback đều được lưu để phân tích

### Feedback Collection

- **No Authentication Required:** Cho phép guest users cung cấp feedback
- **Optional User Linking:** Link với user account nếu có
- **Anonymous Support:** Hỗ trợ feedback ẩn danh
- **Comprehensive Logging:** Lưu tất cả feedback để cải thiện sản phẩm

### Use Cases

**Common Cancellation Reasons:**
- Giá cả không phù hợp
- Không sử dụng thường xuyên  
- Tìm thấy ứng dụng thay thế
- Không hài lòng với tính năng
- Vấn đề kỹ thuật
- Thay đổi nhu cầu học tập

**Data Analysis:**
- Track xu hướng lý do hủy
- Identify pain points chính
- Cải thiện product roadmap
- Customer retention strategies

---

## Error Handling

### Error Monitoring

- **Sentry Integration:** Tất cả errors được capture vào Sentry
- **Error Classification:** Phân loại lỗi theo severity
- **Graceful Degradation:** API luôn trả về response thích hợp

### Common Error Scenarios

#### Invalid Input Data

```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Cause:** Description empty hoặc userId không hợp lệ  
**Solution:** Validate input trước khi gửi request

#### Database Connection Issues

```json
{
  "message": "Internal Server Error",
  "statusCode": 500
}
```

**Cause:** Database connection timeout hoặc query failed  
**Solution:** Retry logic hoặc contact support

### Error Recovery

- **Automatic Retry:** Client có thể retry với exponential backoff
- **Fallback Storage:** Critical feedback có thể cache locally
- **User Notification:** Inform user nếu submission failed

---

## Implementation Notes

### Repository Pattern

```typescript
// BaseAbstractRepository được extend
export class ReasonCancelRepository extends BaseAbstractRepository<ReasonCancelEntity> {
  // Inherit standard CRUD operations
  // Custom methods có thể được thêm vào đây
}
```

### Service Layer

```typescript
export class ReasonCancelService {
  async createReasonCancel(input: ReasonCancelDto) {
    return this.reasonCancelRepository.create({
      "userId": input?.userId, 
      "description": input.description
    });
  }
}
```

### Module Configuration

- **No Middleware:** Không yêu cầu authentication
- **TypeORM Integration:** Auto-configured với entity
- **Standalone Module:** Không phụ thuộc external modules

---

## Analytics & Reporting

### Data Collection

- **User Segmentation:** Phân tích theo user type (registered vs guest)
- **Temporal Analysis:** Track feedback theo thời gian
- **Content Analysis:** NLP processing cho description text
- **Trend Monitoring:** Identify emerging cancellation reasons

### Metrics Tracking

- **Volume Metrics:** Số lượng feedback theo ngày/tuần/tháng
- **User Retention:** Correlation với cancellation rates
- **Reason Categories:** Classification của cancellation reasons
- **Geographic Distribution:** Phân tích theo region nếu có user data