# AI Result API Documentation

## Tổng quan

API quản lý AI Result cho ứng dụng Migii HSK, xử lý việc lưu trữ và cập nhật kết quả phân tích AI cho các câu hỏi và bài luyện tập. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [AI Result Management](#ai-result-management)
  - [PUT /ai-result](#put-ai-result)
- [Data Transfer Objects](#data-transfer-objects)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)

---

## AI Result Management

### PUT `/ai-result`

Cập nhật history ID cho các AI result của người dùng trong một lần luyện tập. API này được sử dụng để liên kết các câu trả lời với một session luyện tập cụ thể.

**URL:** `/ai-result`  
**Method:** `PUT`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |
| Content-Type  | string | Yes      | application/json         |

#### Request Body

```json
{
  "aiScoringIds": [1, 2, 3, 4],
  "historyId": "HSK_PRACTICE_20240811_001"
}
```

#### Request Body Fields

| Field        | Type     | Required | Description                                    |
|--------------|----------|----------|------------------------------------------------|
| aiScoringIds | number[] | Yes      | Mảng ID các câu hỏi/kết quả AI cần cập nhật   |
| historyId    | string   | Yes      | ID định danh cho lần luyện tập hiện tại       |

#### Validation Rules

- `aiScoringIds`: 
  - Không được rỗng
  - Phải là mảng các số nguyên dương
  - Tối đa 50 IDs trong một request
  - Tất cả IDs phải tồn tại trong database
  
- `historyId`:
  - Không được để trống
  - Độ dài tối đa 255 ký tự
  - Format khuyến nghị: `HSK_PRACTICE_YYYYMMDD_XXX`

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Update history for all questions successfully.",
  "data": {
    "updatedCount": 4,
    "historyId": "HSK_PRACTICE_20240811_001",
    "updatedIds": [1, 2, 3, 4]
  }
}
```

#### Success Response Fields

| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| message     | string   | Thông báo kết quả thành công         |
| data        | object   | Thông tin chi tiết về kết quả update |
| updatedCount| number   | Số lượng record đã được cập nhật     |
| historyId   | string   | History ID đã được gán               |
| updatedIds  | number[] | Danh sách IDs đã được cập nhật       |

#### Error Responses

**Invalid IDs Error:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "The Ids you transmitted are not satisfied.",
  "data": {
    "invalidIds": [5, 6],
    "reason": "These IDs do not exist or do not belong to the current user"
  }
}
```

**Authentication Error:**
- **Code:** 401 Unauthorized
- **Content:**
```json
{
  "message": "Authentication required",
  "data": {}
}
```

**Validation Error:**
- **Code:** 422 Unprocessable Entity
- **Content:**
```json
{
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "aiScoringIds",
        "message": "aiScoringIds must be a non-empty array"
      },
      {
        "field": "historyId",
        "message": "historyId is required"
      }
    ]
  }
}
```

**Rate Limit Error:**
- **Code:** 429 Too Many Requests
- **Content:**
```json
{
  "message": "Too many requests",
  "data": {
    "retryAfter": 60
  }
}
```

#### Rate Limiting

- **Limit:** 100 requests per minute per user
- **Window:** 60 seconds
- **Behavior:** Request bị từ chối khi vượt limit

#### Ví dụ sử dụng

```javascript
// Request
PUT /ai-result
Authorization: Bearer user-auth-token
Content-Type: application/json

{
  "aiScoringIds": [1, 2, 3, 4],
  "historyId": "HSK_PRACTICE_20240811_001"
}

// Response
{
  "message": "Update history for all questions successfully.",
  "data": {
    "updatedCount": 4,
    "historyId": "HSK_PRACTICE_20240811_001",
    "updatedIds": [1, 2, 3, 4]
  }
}
```

---

## Data Transfer Objects

### AIRessultDto

DTO cho việc tạo mới AI Result record.

```typescript
interface AIRessultDto {
  userId: number;        // Required - ID người dùng
  historyId?: number;    // Optional - ID lịch sử luyện tập
  questionId: number;    // Required - ID câu hỏi
  result: string;        // Required - Kết quả phân tích từ AI
  userAnswer: string;    // Required - Câu trả lời của người dùng
  aiType: number;        // Required - Loại AI sử dụng (default: 1)
  idsChatGPT: string;    // Required - IDs ChatGPT session
}
```

#### Fields

| Field      | Type    | Required | Default | Description                          |
|------------|---------|----------|---------|--------------------------------------|
| userId     | number  | Yes      | -       | ID người dùng thực hiện bài test     |
| historyId  | number  | No       | null    | ID lịch sử luyện tập (có thể null)   |
| questionId | number  | Yes      | -       | ID câu hỏi được trả lời              |
| result     | string  | Yes      | -       | Kết quả phân tích từ AI (JSON format)|
| userAnswer | string  | Yes      | -       | Câu trả lời gốc của người dùng       |
| aiType     | number  | Yes      | 1       | Loại AI: 1=ChatGPT, 2=Gemini, 3=Other|
| idsChatGPT | string  | Yes      | -       | Session ID của ChatGPT               |

#### Validation Rules

- `userId`: Phải là số nguyên dương, user phải tồn tại
- `questionId`: Phải là số nguyên dương, question phải tồn tại
- `result`: JSON string hợp lệ, chứa thông tin đánh giá AI
- `userAnswer`: Không được để trống, tối đa 2000 ký tự
- `aiType`: Giá trị từ 1-3, mặc định là 1
- `idsChatGPT`: UUID format, định danh session ChatGPT

#### Ví dụ AI Result:

```json
{
  "userId": 12345,
  "historyId": null,
  "questionId": 678,
  "result": "{\"score\": 85, \"feedback\": \"Good pronunciation\", \"mistakes\": []}",
  "userAnswer": "我喜欢学习中文",
  "aiType": 1,
  "idsChatGPT": "550e8400-e29b-41d4-a716-446655440000"
}
```

### AIRessultUpdateDto

DTO cho việc cập nhật history ID cho các AI result records.

```typescript
interface AIRessultUpdateDto {
  aiScoringIds: number[]; // Optional - Mảng ID cần update (default: [1,2,3,4])
  historyId: string;      // Optional - ID history lần luyện tập
}
```

#### Fields

| Field        | Type     | Required | Default     | Description                       |
|--------------|----------|----------|-------------|-----------------------------------|
| aiScoringIds | number[] | No       | [1,2,3,4]   | Mảng ID các AI result cần update  |
| historyId    | string   | No       | -           | ID history của lần luyện tập      |

#### Validation Rules

- `aiScoringIds`: 
  - Mảng các số nguyên dương
  - Tối thiểu 1 phần tử, tối đa 50 phần tử
  - Tất cả IDs phải thuộc về user hiện tại
  
- `historyId`: 
  - String không rỗng
  - Độ dài 1-255 ký tự
  - Format tự do nhưng khuyến nghị có timestamp

---

## Database Schema

### AI Result Table

```sql
CREATE TABLE ai_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  historyId VARCHAR(255) NULL,
  questionId INT NOT NULL,
  result TEXT NOT NULL,
  userAnswer TEXT NOT NULL,
  aiType INT NOT NULL DEFAULT 1,
  idsChatGPT VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (questionId) REFERENCES questions(id),
  INDEX idx_user_history (userId, historyId),
  INDEX idx_created_at (createdAt)
);
```

#### Table Fields

| Column     | Type         | Null | Default           | Description              |
|------------|--------------|------|-------------------|--------------------------|
| id         | INT          | No   | AUTO_INCREMENT    | Primary key              |
| userId     | INT          | No   | -                 | Foreign key to users     |
| historyId  | VARCHAR(255) | Yes  | NULL              | Session identifier       |
| questionId | INT          | No   | -                 | Foreign key to questions |
| result     | TEXT         | No   | -                 | AI analysis result JSON  |
| userAnswer | TEXT         | No   | -                 | User's original answer   |
| aiType     | INT          | No   | 1                 | AI model type used       |
| idsChatGPT | VARCHAR(255) | No   | -                 | ChatGPT session ID       |
| createdAt  | TIMESTAMP    | No   | CURRENT_TIMESTAMP | Record creation time     |
| updatedAt  | TIMESTAMP    | No   | AUTO_UPDATE       | Last modification time   |

---

## Error Handling

### Common Error Codes

| HTTP Code | Error Type              | Description                        |
|-----------|-------------------------|------------------------------------|
| 400       | Bad Request             | Invalid request data or parameters |
| 401       | Unauthorized            | Missing or invalid authentication  |
| 403       | Forbidden               | Insufficient permissions           |
| 404       | Not Found               | Resource not found                 |
| 422       | Unprocessable Entity    | Validation errors                  |
| 429       | Too Many Requests       | Rate limit exceeded                |
| 500       | Internal Server Error   | Server-side error                  |

### Error Response Format

```json
{
  "message": "Human-readable error description",
  "data": {
    "errorCode": "SPECIFIC_ERROR_CODE",
    "details": "Additional error information",
    "timestamp": "2024-08-11T10:30:00Z"
  }
}
```

### Specific Error Scenarios

#### Invalid AI Scoring IDs

```json
{
  "message": "The Ids you transmitted are not satisfied.",
  "data": {
    "invalidIds": [999, 1000],
    "validIds": [1, 2, 3],
    "reason": "IDs not found or access denied",
    "errorCode": "INVALID_AI_SCORING_IDS"
  }
}
```

#### History ID Conflict

```json
{
  "message": "History ID already exists for some records.",
  "data": {
    "conflictIds": [2, 3],
    "existingHistoryId": "HSK_PRACTICE_20240810_005",
    "errorCode": "HISTORY_ID_CONFLICT"
  }
}
```

### Retry Logic

Đối với các lỗi tạm thời (5xx, 429), client nên implement retry logic:

```javascript
const maxRetries = 3;
let retryCount = 0;
let retryDelay = 1000; // 1 second

async function updateAIResultWithRetry(data) {
  while (retryCount < maxRetries) {
    try {
      const response = await updateAIResult(data);
      return response;
    } catch (error) {
      if (error.status === 429 || error.status >= 500) {
        retryCount++;
        await delay(retryDelay);
        retryDelay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retry attempts reached');
}
```