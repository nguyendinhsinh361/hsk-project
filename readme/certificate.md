# Certificate API Documentation

## Tổng quan

API quản lý hệ thống chứng chỉ cho ứng dụng Migii HSK, bao gồm việc tạo, cập nhật, và quản lý chứng chỉ HSK của người dùng. Hệ thống hỗ trợ upload ảnh, phê duyệt chứng chỉ và trao thưởng Premium time. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Certificate Management](#certificate-management)
  - [POST /certificate](#post-certificate)
  - [GET /certificate/setup-time](#get-certificatesetup-time)
  - [GET /certificate](#get-certificate)
  - [GET /certificate/notify](#get-certificatenotify)
  - [PUT /certificate/update-certificate](#put-certificateupdate-certificate)
  - [PUT /certificate/update-image](#put-certificateupdate-image)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Database Schema](#database-schema)
- [File Upload](#file-upload)
- [Authentication & Middleware](#authentication--middleware)
- [Business Logic](#business-logic)

---

## Certificate Management

### POST `/certificate`

Tạo chứng chỉ mới cho người dùng với upload ảnh chứng chỉ.

**URL:** `/certificate`  
**Method:** `POST`  
**Authentication:** Required (User ID middleware)  
**Rate Limiting:** Yes (LimitedRequestsMiddleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |
| Content-Type  | string | Yes      | multipart/form-data      |

#### Request Body (Form Data)

| Field           | Type   | Required | Description                    |
|-----------------|--------|----------|--------------------------------|
| username        | string | Yes      | Họ tên người dùng              |
| email           | string | Yes      | Email (phải hợp lệ)            |
| phoneNumber     | string | No       | Số điện thoại                  |
| certificateImg  | file   | Yes      | File ảnh chứng chỉ             |
| note            | string | No       | Lời nhắn/ghi chú               |
| share           | enum   | Yes      | Chia sẻ: "1" hoặc "0"          |

#### File Upload Requirements

- **Allowed types:** `image/jpeg`, `image/png`, `image/gif`, `image/bmp`
- **Max size:** Được cấu hình trong `fileUploadCertificateOptions`
- **Storage:** Local file system với đường dẫn công khai

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Create new certificate successfully",
  "data": {
    "id": 123,
    "userId": 456,
    "username": "Nguyễn Văn A",
    "email": "user@example.com",
    "phoneNumber": "0123456789",
    "certificateImg": "https://domain.com/uploads/certificates/certificate_123.jpg",
    "note": "Chứng chỉ HSK 5",
    "share": 1,
    "active": 0,
    "createdAt": "2024-08-11T10:30:00Z"
  }
}
```

#### Error Responses

**File Type Error:**
- **Code:** 406 Not Acceptable
- **Content:**
```json
{
  "message": "File truyền lên phải là ảnh: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']"
}
```

**Duplicate Certificate Error:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Certificate of user with id: 456 already exist. Please wait 30 days"
}
```

#### Business Rules

- **One certificate per month:** User chỉ được tạo 1 chứng chỉ/tháng
- **Unique constraint:** `(user_id, month_year)` phải unique
- **Auto status:** Chứng chỉ mới tạo có `active = 0` (PENDING)

---

### GET `/certificate/setup-time`

Lấy thời gian thông báo người dùng gửi chứng chỉ (thời gian mở/đóng nộp chứng chỉ).

**URL:** `/certificate/setup-time`  
**Method:** `GET`  
**Authentication:** None  

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get certificate time successfully.",
  "data": {
    "startTime": 1704868878000,
    "endTime": 1707547278000,
    "serverTime": 1691749200000
  }
}
```

#### Response Fields

| Field      | Type   | Description                        |
|------------|--------|------------------------------------|
| startTime  | number | Timestamp bắt đầu nhận chứng chỉ   |
| endTime    | number | Timestamp kết thúc nhận chứng chỉ  |
| serverTime | number | Timestamp hiện tại của server      |

#### Default Values

- **startTime:** `1704868878000` (nếu không có config active)
- **endTime:** `1707547278000` (nếu không có config active)

#### Ví dụ sử dụng

```javascript
// Request
GET /certificate/setup-time

// Response
{
  "message": "Get certificate time successfully.",
  "data": {
    "startTime": 1704868878000,
    "endTime": 1707547278000,
    "serverTime": 1691749200000
  }
}
```

---

### GET `/certificate`

Lấy tất cả ảnh chứng chỉ đã được duyệt (hiển thị công khai).

**URL:** `/certificate`  
**Method:** `GET`  
**Authentication:** None  

#### Query Parameters

| Parameter | Type   | Required | Default | Description            |
|-----------|--------|----------|---------|------------------------|
| page      | number | No       | 1       | Số trang               |
| limit     | number | No       | 10      | Số lượng mỗi trang     |
| search    | string | No       | -       | Từ khóa tìm kiếm       |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get all image of certificate successfully",
  "data": [
    "https://domain.com/uploads/certificates/certificate_123.jpg",
    "https://domain.com/uploads/certificates/certificate_124.jpg",
    "https://domain.com/uploads/certificates/certificate_125.jpg"
  ]
}
```

#### Filter Conditions

- **Active status:** Chỉ lấy chứng chỉ có `active = 1` hoặc `active = 2`
- **Order:** Sắp xếp theo `createdAt DESC`
- **Pagination:** Hỗ trợ phân trang

#### Ví dụ sử dụng

```javascript
// Request
GET /certificate?page=1&limit=20

// Response
{
  "message": "Get all image of certificate successfully",
  "data": [
    "https://domain.com/uploads/certificates/certificate_123.jpg",
    // ... more certificate images
  ]
}
```

---

### GET `/certificate/notify`

Lấy thông báo chứng chỉ đã được duyệt hay chưa cho user hiện tại.

**URL:** `/certificate/notify`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  
**Rate Limiting:** Yes (LimitedRequestsMiddleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get notify of certificate successfully.",
  "data": {
    "active": 1,
    "premiunTime": 30
  }
}
```

#### Response Fields

| Field       | Type   | Description                           |
|-------------|--------|---------------------------------------|
| active      | number | Trạng thái chứng chỉ (xem bảng bên dưới) |
| premiunTime | number | Số ngày Premium được tặng (0 hoặc 30)  |

#### Certificate Status Values

| Status | Description                    | Premium Time |
|--------|--------------------------------|-------------|
| 1      | Kích hoạt (Approved)           | 30 ngày     |
| -1     | Không kích hoạt (Rejected)     | 0 ngày      |
| 0      | Trạng thái chờ (Pending)       | 0 ngày      |
| 2      | Đã xử lý - Duyệt (Processed)   | 30 ngày     |
| -2     | Đã xử lý - Không duyệt (Processed) | 0 ngày   |

#### Auto Status Update

- **Status 1 → 2:** Tự động chuyển khi user đọc notification
- **Status -1 → -2:** Tự động chuyển khi user đọc notification

#### Error Response

**Certificate Not Found:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Cannot find certificate of user"
}
```

#### Ví dụ sử dụng

```javascript
// Request
GET /certificate/notify
Authorization: Bearer user-token

// Response
{
  "message": "Get notify of certificate successfully.",
  "data": {
    "active": 1,
    "premiunTime": 30
  }
}
```

---

### PUT `/certificate/update-certificate`

Cập nhật trạng thái chứng chỉ (API test/admin).

**URL:** `/certificate/update-certificate`  
**Method:** `PUT`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| status    | enum   | Yes      | Trạng thái mới (CertificateStatusEnumTest) |

#### Status Values

| Value | Description                    |
|-------|--------------------------------|
| "1"   | ACTIVE (Approved)              |
| "-1"  | DEACTIVE (Rejected)            |
| "0"   | PENDING (Waiting)              |
| "-2"  | DEACTIVE_PROCESSED (Processed) |
| "2"   | ACTIVE_PROCESSED (Processed)   |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get notify of certificate successfully.",
  "data": {
    "affected": 1
  }
}
```

#### Ví dụ sử dụng

```javascript
// Request
PUT /certificate/update-certificate?status=1
Authorization: Bearer user-token

// Response
{
  "message": "Get notify of certificate successfully.",
  "data": {
    "affected": 1
  }
}
```

---

### PUT `/certificate/update-image`

Cập nhật ảnh chứng chỉ người dùng đã gửi lên.

**URL:** `/certificate/update-image`  
**Method:** `PUT`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |
| Content-Type  | string | Yes      | multipart/form-data      |

#### Request Body (Form Data)

| Field          | Type | Required | Description        |
|----------------|------|----------|--------------------|
| certificateImg | file | Yes      | File ảnh mới       |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Update image for certifcate successfully.",
  "data": "https://domain.com/uploads/certificates/new_certificate_123.jpg"
}
```

#### Error Responses

**File Type Error:**
- **Code:** 406 Not Acceptable
- **Content:**
```json
{
  "message": "File truyền lên phải là ảnh: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']"
}
```

**Bad File Error:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Ảnh bị lỗi"
}
```


---

## Data Transfer Objects

### CreateCertificateDto

DTO cho việc tạo chứng chỉ mới.

```typescript
interface CreateCertificateDto {
  username: string;        // Required - Họ tên
  email: string;          // Required - Email hợp lệ
  phoneNumber?: string;   // Optional - Số điện thoại
  certificateImg: string; // Required - File upload
  note?: string;          // Optional - Lời nhắn
  share: ShareValue;      // Required - Chia sẻ (default: "1")
}
```

#### Fields

| Field          | Type        | Required | Default | Description                |
|----------------|-------------|----------|---------|----------------------------|
| username       | string      | Yes      | -       | Họ tên người dùng          |
| email          | string      | Yes      | -       | Email (validation: email)   |
| phoneNumber    | string      | No       | -       | Số điện thoại              |
| certificateImg | file        | Yes      | -       | File ảnh chứng chỉ         |
| note           | string      | No       | -       | Lời nhắn/ghi chú           |
| share          | ShareValue  | Yes      | "1"     | Chia sẻ công khai          |

#### ShareValue Enum

```typescript
enum ShareValue {
  SHARE = '1',      // Chia sẻ công khai
  NOT_SHARE = '0'   // Không chia sẻ
}
```

#### Validation Rules

- `username`: Không được rỗng, phải là string
- `email`: Phải là email hợp lệ
- `phoneNumber`: Optional, phải là string nếu có
- `certificateImg`: Phải là file ảnh hợp lệ
- `share`: Phải thuộc enum ShareValue

### UpdateCertificateDto

DTO cho việc cập nhật trạng thái chứng chỉ.

```typescript
interface UpdateCertificateDto {
  status: CertificateStatusEnumTest; // Required - Trạng thái mới
}
```

#### Fields

| Field  | Type                        | Required | Default | Description        |
|--------|-----------------------------|----------|---------|--------------------|
| status | CertificateStatusEnumTest   | Yes      | "1"     | Trạng thái mới     |

### UpdateImgCertificateDto

DTO cho việc cập nhật ảnh chứng chỉ.

```typescript
interface UpdateImgCertificateDto {
  certificateImg: string; // Required - File upload mới
}
```

---

## Enums

### CertificateStatusEnum

Enum cho trạng thái chứng chỉ (internal).

```typescript
enum CertificateStatusEnum {
  ACTIVE = 1,              // Kích hoạt
  DEACTIVE = -1,           // Không kích hoạt  
  PEDNDING = 0,            // Trạng thái chờ
  DEACTIVE_PRCCESSED = -2, // Đã xử lý (Không duyệt)
  ACTIVE_PRCCESSED = 2     // Đã xử lý (Duyệt)
}
```

### CertificateStatusEnumTest

Enum cho API test/admin (string values).

```typescript
enum CertificateStatusEnumTest {
  ACTIVE = "1",              // Kích hoạt
  DEACTIVE = "-1",           // Không kích hoạt
  PEDNDING = "0",            // Trạng thái chờ  
  DEACTIVE_PRCCESSED = "-2", // Đã xử lý (Không duyệt)
  ACTIVE_PRCCESSED = "2"     // Đã xử lý (Duyệt)
}
```

#### Status Flow

```
PENDING (0) → ACTIVE (1) → ACTIVE_PROCESSED (2)
            ↘ DEACTIVE (-1) → DEACTIVE_PROCESSED (-2)
```

#### Premium Rewards

- **ACTIVE (1) hoặc ACTIVE_PROCESSED (2):** 30 ngày Premium
- **Các trạng thái khác:** 0 ngày Premium

---

## Database Schema

### Certificates Table

```sql
CREATE TABLE certificates (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT,
  username VARCHAR(255),
  email VARCHAR(255), 
  phone_number VARCHAR(255),
  certificate_img VARCHAR(255),
  note TEXT,
  share INT,
  active INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  month_year VARCHAR(32) GENERATED ALWAYS AS (CONCAT(MONTH(created_at), YEAR(created_at))) VIRTUAL
);

-- Indexes
CREATE INDEX idx_user_id ON certificates(user_id);
CREATE UNIQUE INDEX idx_unique_user_month_year ON certificates(user_id, month_year);
```

#### Table Fields

| Column         | Type         | Null | Default           | Description               |
|----------------|--------------|------|-------------------|---------------------------|
| id             | INT          | No   | AUTO_INCREMENT    | Primary key               |
| user_id        | INT          | Yes  | NULL              | Foreign key to users      |
| username       | VARCHAR(255) | Yes  | NULL              | Họ tên người dùng         |
| email          | VARCHAR(255) | Yes  | NULL              | Email người dùng          |
| phone_number   | VARCHAR(255) | Yes  | NULL              | Số điện thoại             |
| certificate_img| VARCHAR(255) | Yes  | NULL              | URL ảnh chứng chỉ         |
| note           | TEXT         | Yes  | NULL              | Ghi chú/lời nhắn          |
| share          | INT          | Yes  | NULL              | Chia sẻ: 1=Yes, 0=No     |
| active         | INT          | Yes  | 0                 | Trạng thái duyệt          |
| created_at     | TIMESTAMP    | No   | CURRENT_TIMESTAMP | Thời gian tạo             |
| updated_at     | TIMESTAMP    | No   | AUTO_UPDATE       | Thời gian cập nhật        |
| month_year     | VARCHAR(32)  | Yes  | VIRTUAL           | Virtual column: "MMYYYY"  |

### Certificate Time Table

```sql
CREATE TABLE certificates_time (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  start_time BIGINT,
  end_time BIGINT, 
  active INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Table Fields

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | INT       | Primary key                    |
| start_time | BIGINT    | Timestamp bắt đầu nhận chứng chỉ |
| end_time   | BIGINT    | Timestamp kết thúc nhận chứng chỉ |
| active     | INT       | Trạng thái active (1=active)   |
| created_at | TIMESTAMP | Thời gian tạo                  |
| updated_at | TIMESTAMP | Thời gian cập nhật             |

---

## File Upload

### Configuration

- **Storage:** Local file system
- **Upload path:** Configured in `fileUploadCertificateOptions`
- **Public access:** Files accessible via domain URL

### File Validation

```typescript
// Allowed MIME types
const allowedTypes = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/bmp'
];

// File size limits (configured in middleware)
const maxFileSize = '10MB'; // Example
```

### URL Generation

```typescript
// Full image URL construction
const fullImagePath = `${domain}/${imagePath.replace(/\\/g, '/')}`;
// Example: "https://migii.com/uploads/certificates/cert_123.jpg"
```

### Error Handling

- **File type rejection:** HTTP 406 Not Acceptable
- **File size exceeded:** HTTP 413 Payload Too Large  
- **Upload failure:** Automatic cleanup with `fs.unlink()`

---

## Authentication & Middleware

### UserIdMiddleware

- **Purpose:** Extract user ID from JWT token
- **Applied to:** POST `/certificate`, GET `/certificate/notify`
- **Decorator:** `@UserId()` injects user_id into controller

### LimitedRequestsMiddleware

- **Purpose:** Rate limiting for certificate operations
- **Applied to:** POST `/certificate`, GET `/certificate/notify`
- **Limits:** Prevent spam certificate creation

### Route Configuration

```typescript
consumer
  .apply(UserIdMiddleware, LimitedRequestsMiddleware)
  .forRoutes(
    { path: 'certificate', method: RequestMethod.POST },
    { path: 'certificate/notify', method: RequestMethod.GET }
  );
```

---

## Business Logic

### Certificate Creation Rules

1. **One per month:** User chỉ được tạo 1 certificate/tháng
2. **Unique constraint:** `(user_id, month_year)` unique index
3. **Auto status:** Mới tạo có status = 0 (PENDING)
4. **File cleanup:** Xóa file nếu create failed

### Status Workflow

```
Create → PENDING (0)
         ↓ (Admin review)
         ├── ACTIVE (1) → ACTIVE_PROCESSED (2)
         └── DEACTIVE (-1) → DEACTIVE_PROCESSED (-2)
```

### Premium Rewards

- **Approved certificates:** 30 ngày Premium time
- **Auto processing:** Status tự động chuyển khi user đọc notification
- **One-time reward:** Chỉ trao thưởng 1 lần khi chuyển status

### Certificate Time Management

- **Admin configuration:** Set start/end time cho việc nhận chứng chỉ
- **Default fallback:** Hard-coded timestamps nếu không có config
- **Server time sync:** Trả về server time để client đồng bộ

### Public Gallery

- **Approved only:** Chỉ hiển thị certificate có `active = 1` hoặc `active = 2`
- **Share preference:** Respect user's share setting
- **Latest first:** Sắp xếp theo `createdAt DESC`
- **Image URLs only:** Chỉ trả về URL ảnh, không có thông tin cá nhân

### Error Monitoring

- **Sentry integration:** All errors logged to Sentry
- **Graceful degradation:** API continues working even with partial failures
- **File cleanup:** Automatic cleanup of uploaded files on errors