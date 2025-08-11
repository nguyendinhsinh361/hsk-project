# Migii HSK Docs

## Tổng quan

Hệ thống API quản lý Super Password Key và AI Result cho ứng dụng Migii HSK, sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## API Endpoints

### 1. System Information

#### 1.1. GET `/system/info`
Lấy thông tin thời gian hiện tại của hệ thống.

**Response:**
```json
{
  "time": 1691749200000
}
```

#### 1.2. GET `/system/supper-key`
Tạo và lấy Super Password Key mới.

**Headers:**
- Yêu cầu middleware authentication với Super Key
- Rate limiting được áp dụng

**Query Parameters:**
- Sử dụng decorators `@GetSupperKey()` và `@GetSuperKeyName()` để lấy thông tin

**Response:**
```json
{
  "superKey": "ABC123EUP"
}
```

### 2. AI Result Management

#### 2.1. PUT `/ai-result`
Cập nhật history ID cho các AI result của người dùng.

**Headers:**
- Yêu cầu middleware authentication với User ID
- Rate limiting được áp dụng

**Body Parameters:**
```json
{
  "aiScoringIds": [1, 2, 3, 4],
  "historyId": "ID history của lần luyện tập được gửi lên"
}
```

**Response:**
```json
{
  "message": "Update history for all questions successfully.",
  "data": {}
}
```

**Error Response:**
```json
{
  "message": "The Ids you transmitted are not satisfied.",
  "data": {}
}
```

## Data Transfer Objects (DTOs)

### 1.2. SupperPasswordKeyDto
```typescript
{
  superPass: string;  // Required - Mật khẩu super
  keyUse: string;     // Required - Mục đích sử dụng
  keyName: string;    // Required - Tên key
}
```

### 2.1. AIRessultDto
```typescript
{
  userId: number;        // Required - ID người dùng
  historyId?: number;    // Optional - ID lịch sử
  questionId: number;    // Required - ID câu hỏi
  result: string;        // Required - Kết quả AI
  userAnswer: string;    // Required - Câu trả lời người dùng
  aiType: number;        // Required - Loại AI (default: 1)
  idsChatGPT: string;    // Required - IDs ChatGPT
}
```

### 2.2. AIRessultUpdateDto
```typescript
{
  aiScoringIds: number[]; // Optional - Mảng ID cần update (default: [1,2,3,4])
  historyId: string;      // Optional - ID history lần luyện tập
}
```

## Thuật toán tạo Super Password

Super Password được tạo theo công thức:
1. Lấy thời gian hiện tại và reset phút, giây, mili giây về 0
2. Áp dụng công thức: `Math.floor((timestamp) / (73^2) * (37^2) * (55^3))`
3. Chuyển đổi sang hệ 16 và thêm suffix "EUP"
4. Chuyển thành chữ hoa

**Ví dụ:** `ABC123EUP`