# User Tracking API Documentation

## Tổng quan

API quản lý hệ thống theo dõi hành vi người dùng cho ứng dụng Migii HSK, ghi nhận các hoạt động và tương tác của người dùng với app để phân tích và cải thiện trải nghiệm. Hệ thống sử dụng tag-based tracking với duplicate prevention.

## Mục lục

- [User Tracking Management](#user-tracking-management)
  - [POST /user/userTracking](#post-userusertracking)
- [Data Transfer Objects](#data-transfer-objects)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)

---

## User Tracking Management

### POST `/user/userTracking`

Ghi nhận các hoạt động theo dõi của người dùng.

**URL:** `/user/userTracking`  
**Method:** `POST`  
**Authentication:** Required  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |
| Content-Type  | string | Yes      | application/json         |

#### Request Body

```json
{
  "content": [
    {
      "tag": "Attention_Practice100"
    },
    {
      "tag": "Attention_Exam2"
    },
    {
      "tag": "Attention_Unit3"
    },
    {
      "tag": "Attention_Game1"
    }
  ]
}
```

#### Request Body Fields

| Field   | Type       | Required | Description                    |
|---------|------------|----------|--------------------------------|
| content | Tracking[] | Yes      | Mảng các tag tracking          |

#### Tracking Object Fields

| Field | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| tag   | string | Yes      | Tag định danh hoạt động        |

#### Common Tag Examples

| Tag                    | Description                    |
|------------------------|--------------------------------|
| Attention_Practice100  | Tương tác với bài luyện tập    |
| Attention_Exam2        | Tương tác với bài kiểm tra     |
| Attention_Unit3        | Tương tác với unit 3           |
| Attention_Game1        | Tương tác với game 1           |
| Attention_Theory       | Xem lý thuyết                  |
| Attention_Vocabulary   | Học từ vựng                    |
| Attention_Grammar      | Học ngữ pháp                   |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "User": "successfull"
}
```

#### Error Responses

**Bad Request:**
- **Code:** 400 Bad Request
```json
{
  "message": "Dữ liệu không hợp lệ",
  "statusCode": 400
}
```

**Unauthorized:**
- **Code:** 401 Unauthorized
```json
{
  "message": "Lỗi xác thực",
  "statusCode": 401
}
```

**Internal Server Error:**
- **Code:** 500 Internal Server Error
```json
{
  "message": "Internal Server Error",
  "statusCode": 500
}
```

#### Business Logic

**Duplicate Prevention:**
- Sử dụng `INSERT IGNORE` để tránh duplicate entries
- Combination `(user_id, tag)` phải unique
- Không ném error khi duplicate, chỉ bỏ qua

**Batch Insert:**
- Hỗ trợ insert multiple tags trong một request
- Dynamic SQL generation với placeholders
- Atomic operation cho tất cả tags

#### Ví dụ sử dụng

```javascript
// Request
POST /user/userTracking
Authorization: Bearer user-token
Content-Type: application/json

{
  "content": [
    {
      "tag": "Attention_Practice100"
    },
    {
      "tag": "Attention_Unit3"
    }
  ]
}

// Response
{
  "User": "successfull"
}
```

---

## Data Transfer Objects

### Tracking

```typescript
interface Tracking {
  tag: string; // Required - Tag định danh hoạt động
}
```

#### Validation Rules

- `tag`: Required, phải là string không rỗng
- Format: Thường theo pattern `Attention_[Activity][Number]`

### UserTrackingDto

```typescript
interface UserTrackingDto {
  content: Tracking[]; // Required - Mảng tracking tags
}
```

#### Validation Rules

- `content`: Phải là array không rỗng
- Mỗi phần tử phải có tag hợp lệ

### OutputUserDto

```typescript
class OutputUserDto {
  User: any;
  
  constructor(input: any) {
    this.User = input;
  }
}
```

#### Response Wrapper

- **Purpose:** Wrap response theo format nhất quán
- **Content:** Chứa result từ service layer
- **Usage:** `return new OutputUserDto("successfull")`

---

## Database Schema

### users_tracking Table

```sql
CREATE TABLE users_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tag VARCHAR(155) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_tag (user_id, tag),
  INDEX idx_user_id (user_id),
  INDEX idx_tag (tag),
  INDEX idx_created_at (created_at)
);
```

#### Table Fields

| Column     | Type         | Null | Description                    |
|------------|--------------|------|--------------------------------|
| id         | INT          | No   | Primary key                    |
| user_id    | INT          | No   | Foreign key to users           |
| tag        | VARCHAR(155) | No   | Tag định danh hoạt động        |
| created_at | TIMESTAMP    | Yes  | Thời gian ghi nhận             |
| updated_at | TIMESTAMP    | Yes  | Thời gian cập nhật             |

#### Database Constraints

- **Unique Constraint:** `(user_id, tag)` để tránh duplicate
- **Foreign Key:** `user_id` references `users(id)`
- **Index Optimization:** Indexes cho query performance

---

## Business Logic

### Tracking Categories

#### Attention Tracking
- **Purpose:** Theo dõi tương tác với content
- **Pattern:** `Attention_[Type][Number]`
- **Examples:**
  - `Attention_Practice100` - Hoàn thành 100 bài luyện tập
  - `Attention_Exam2` - Làm bài kiểm tra lần 2
  - `Attention_Unit3` - Tương tác với Unit 3

#### Engagement Tracking
- **Purpose:** Đo lường mức độ tham gia
- **Metrics:** Time spent, interaction frequency
- **Usage:** Analytics và personalization

### Batch Processing

#### Dynamic SQL Generation
```javascript
const buildBatchInsert = (userId, content) => {
  const placeholders = [];
  const values = [];
  
  content.forEach((item) => {
    placeholders.push("(?,?)");
    values.push(userId, item.tag);
  });
  
  const sql = `INSERT IGNORE INTO users_tracking (user_id, tag) VALUES ${placeholders.join(",")}`;
  return { sql, values };
};
```

#### Validation Flow
```javascript
const validateContent = (content) => {
  content.forEach((item) => {
    if (!item?.tag) {
      throw new HttpException("Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST);
    }
  });
};
```

### Duplicate Handling

#### INSERT IGNORE Strategy
- **Behavior:** Ignore duplicate `(user_id, tag)` combinations
- **Advantage:** No error thrown for duplicates
- **Use Case:** User có thể trigger cùng event nhiều lần

#### Alternative Approaches
```sql
-- Option 1: INSERT IGNORE (current)
INSERT IGNORE INTO users_tracking (user_id, tag) VALUES (?, ?);

-- Option 2: ON DUPLICATE KEY UPDATE
INSERT INTO users_tracking (user_id, tag) VALUES (?, ?) 
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Option 3: Check then insert
SELECT COUNT(*) FROM users_tracking WHERE user_id = ? AND tag = ?;
-- If count = 0, then INSERT
```

### Analytics Use Cases

#### User Behavior Analysis
- **Engagement Patterns:** Frequency of different activities
- **Learning Path:** Sequence of user interactions
- **Feature Usage:** Most/least used features

#### Personalization
- **Content Recommendation:** Based on tracking history
- **Difficulty Adjustment:** Based on practice patterns
- **UI Customization:** Based on user preferences

#### A/B Testing
- **Feature Adoption:** Track new feature usage
- **User Flow:** Monitor conversion funnels
- **Performance Metrics:** Compare user segments

---

## Error Handling

### Validation Errors

#### Missing Tag
```json
{
  "message": "Dữ liệu không hợp lệ",
  "statusCode": 400
}
```

**Cause:** Tag field empty hoặc missing  
**Solution:** Ensure tất cả tracking objects có tag

#### Invalid Request Format
```json
{
  "message": "Validation failed",
  "statusCode": 400
}
```

**Cause:** Request body không match DTO schema  
**Solution:** Follow đúng API specification

### System Errors

#### Database Connection
```json
{
  "message": "Internal Server Error", 
  "statusCode": 500
}
```

**Cause:** Database unavailable hoặc query failed  
**Solution:** Retry hoặc check database status

### Error Monitoring

- **Sentry Integration:** All errors được capture
- **Error Classification:** Differentiate validation vs system errors
- **Graceful Degradation:** Tracking failures không block main functionality

---

## Performance Considerations

### Database Optimization

#### Batch Inserts
- **Single Query:** Multiple tags trong một SQL statement
- **Reduced Overhead:** Fewer database connections
- **Transaction Safety:** Atomic operations

#### Index Strategy
- **Primary Lookups:** `idx_user_id` for user-specific queries
- **Tag Analysis:** `idx_tag` for aggregate analytics  
- **Time-based Queries:** `idx_created_at` for temporal analysis

### Memory Management

#### Efficient SQL Building
```javascript
// Efficient approach
const placeholders = content.map(() => "(?,?)");
const sql = `INSERT IGNORE INTO users_tracking (user_id, tag) VALUES ${placeholders.join(",")}`;

// Avoid string concatenation in loop
```

### Rate Limiting Considerations

- **High Frequency Events:** User actions có thể trigger nhiều tracking events
- **Batch Submission:** Group multiple events into single request
- **Client-side Buffering:** Accumulate events before sending