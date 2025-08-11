# Migii HSK API Documentation

## Tổng quan

Hệ thống API quản lý Super Password Key và AI Result cho ứng dụng Migii HSK, được xây dựng trên NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [System Information](#system-information)
  - [GET /system/info](#get-systeminfo)
  - [GET /system/supper-key](#get-systemsupper-key)
- [AI Result Management](#ai-result-management)
  - [PUT /ai-result](#put-ai-result)
- [Data Transfer Objects](#data-transfer-objects)
- [Thuật toán tạo Super Password](#thuật-toán-tạo-super-password)

## System Information

### GET `/system/info`

Lấy thông tin thời gian hiện tại của hệ thống.

**URL:** `/system/info`  
**Method:** `GET`  
**Authentication:** None  

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "time": 1691749200000
}
```

#### Response Fields

| Field | Type   | Description              |
|-------|--------|--------------------------|
| time  | number | Unix timestamp hiện tại |

---

### GET `/system/supper-key`

Tạo và lấy Super Password Key mới cho hệ thống.

**URL:** `/system/supper-key`  
**Method:** `GET`  
**Authentication:** Required (Super Key middleware)  

#### Headers

| Header        | Type   | Required | Description                    |
|---------------|--------|----------|--------------------------------|
| Authorization | string | Yes      | Super Key authentication token |

#### Query Parameters

- Sử dụng decorators `@GetSupperKey()` và `@GetSuperKeyName()` để lấy thông tin

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "superKey": "ABC123EUP"
}
```

#### Response Fields

| Field    | Type   | Description           |
|----------|--------|-----------------------|
| superKey | string | Super Password Key mới |

#### Rate Limiting

API này có áp dụng rate limiting để ngăn chặn việc tạo quá nhiều key trong thời gian ngắn.

---

## AI Result Management

### PUT `/ai-result`

Cập nhật history ID cho các AI result của người dùng trong một lần luyện tập.

**URL:** `/ai-result`  
**Method:** `PUT`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Request Body

```json
{
  "aiScoringIds": [1, 2, 3, 4],
  "historyId": "ID history của lần luyện tập được gửi lên"
}
```

#### Request Body Fields

| Field        | Type     | Required | Description                           |
|--------------|----------|----------|---------------------------------------|
| aiScoringIds | number[] | Yes      | Mảng ID các câu hỏi cần update       |
| historyId    | string   | Yes      | ID history của lần luyện tập hiện tại |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Update history for all questions successfully.",
  "data": {}
}
```

**Error Response:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "The Ids you transmitted are not satisfied.",
  "data": {}
}
```

#### Rate Limiting

API này có áp dụng rate limiting để bảo vệ hệ thống khỏi các request spam.

---

## Data Transfer Objects

### SupperPasswordKeyDto

DTO cho việc tạo và quản lý Super Password Key.

```typescript
interface SupperPasswordKeyDto {
  superPass: string;  // Required - Mật khẩu super
  keyUse: string;     // Required - Mục đích sử dụng key
  keyName: string;    // Required - Tên định danh cho key
}
```

#### Fields

| Field     | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| superPass | string | Yes      | Mật khẩu super của hệ thống |
| keyUse    | string | Yes      | Mục đích sử dụng key       |
| keyName   | string | Yes      | Tên định danh cho key      |

### AIRessultDto

DTO cho việc lưu trữ kết quả AI scoring.

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

| Field      | Type    | Required | Default | Description                      |
|------------|---------|----------|---------|----------------------------------|
| userId     | number  | Yes      | -       | ID người dùng thực hiện bài test |
| historyId  | number  | No       | -       | ID lịch sử luyện tập             |
| questionId | number  | Yes      | -       | ID câu hỏi được trả lời          |
| result     | string  | Yes      | -       | Kết quả phân tích từ AI          |
| userAnswer | string  | Yes      | -       | Câu trả lời của người dùng       |
| aiType     | number  | Yes      | 1       | Loại AI được sử dụng             |
| idsChatGPT | string  | Yes      | -       | IDs của ChatGPT session          |

### AIRessultUpdateDto

DTO cho việc cập nhật history ID cho các AI result.

```typescript
interface AIRessultUpdateDto {
  aiScoringIds: number[]; // Optional - Mảng ID cần update (default: [1,2,3,4])
  historyId: string;      // Optional - ID history lần luyện tập
}
```

#### Fields

| Field        | Type     | Required | Default     | Description                      |
|--------------|----------|----------|-------------|----------------------------------|
| aiScoringIds | number[] | No       | [1,2,3,4]   | Mảng ID các record cần update    |
| historyId    | string   | No       | -           | ID history của lần luyện tập     |

---

## Thuật toán tạo Super Password

Super Password Key được tạo theo thuật toán sau:

### Các bước thực hiện:

1. **Lấy timestamp hiện tại:** Sử dụng `Date.now()` và reset phút, giây, mili giây về 0
2. **Áp dụng công thức toán học:** 
   ```javascript
   Math.floor((timestamp) / (73^2) * (37^2) * (55^3))
   ```
3. **Chuyển đổi số hệ:** Chuyển kết quả sang hệ số 16 (hexadecimal)
4. **Thêm suffix:** Thêm chuỗi "EUP" vào cuối
5. **Format cuối:** Chuyển toàn bộ thành chữ hoa

### Ví dụ:

```javascript
// Input: timestamp = 1691749200000 (after reset minutes, seconds, ms to 0)
// Calculation: Math.floor(1691749200000 / (73^2) * (37^2) * (55^3))
// Hex conversion + suffix: "ABC123EUP"
```

**Kết quả mẫu:** `ABC123EUP`

### Đặc điểm:

- Key được tạo theo giờ (hour-based), đảm bảo tính bảo mật
- Format nhất quán với suffix "EUP" 
- Sử dụng chữ hoa để dễ đọc và nhận diện
- Thuật toán phức tạp giúp khó dự đoán key tiếp theo