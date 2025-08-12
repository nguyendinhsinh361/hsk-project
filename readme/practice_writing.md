# Practice Writing API Documentation

## Tổng quan

API quản lý hệ thống luyện viết cho ứng dụng Migii HSK, bao gồm tạo câu hỏi, bình luận, vote và báo cáo. Hệ thống hỗ trợ nhiều loại câu hỏi HSK với giới hạn tạo theo ngày và tính năng community interaction.

## Mục lục

- [Practice Writing Management](#practice-writing-management)
  - [GET /practice-writing/question](#get-practice-writingquestion)
  - [GET /practice-writing/comment/:questionId](#get-practice-writingcommentquestionid)
  - [GET /practice-writing/comment-child/:commentId](#get-practice-writingcomment-childcommentid)
  - [POST /practice-writing/comment](#post-practice-writingcomment)
  - [POST /practice-writing/comment/upvote](#post-practice-writingcommentupvote)
  - [POST /practice-writing/question/upvote](#post-practice-writingquestionupvote)
  - [POST /practice-writing/make-question](#post-practice-writingmake-question)
  - [POST /practice-writing/report](#post-practice-writingreport)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Business Logic](#business-logic)

---

## Practice Writing Management

### GET `/practice-writing/question`

Lấy danh sách câu hỏi luyện viết với filter và pagination.

**URL:** `/practice-writing/question`  
**Method:** `GET`  
**Authentication:** Required  

#### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Số trang                       |
| limit     | number | No       | 10      | Số lượng mỗi trang             |
| search    | string | No       | -       | Từ khóa tìm kiếm               |
| filter    | enum   | No       | ""      | Filter: user/comment/like      |

#### Response

```json
{
  "message": "Get questions successfully",
  "data": {
    "questions": [
      {
        "id": 1,
        "content": "写一篇关于你的家乡的短文",
        "kind": "430002",
        "userId": 123,
        "userName": "Nguyễn Văn A",
        "likeCount": 15,
        "commentCount": 8,
        "isLiked": 1,
        "createdAt": "2024-08-11T10:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET `/practice-writing/comment/:questionId`

Lấy danh sách bình luận của một câu hỏi.

**URL:** `/practice-writing/comment/:questionId`  
**Method:** `GET`  
**Authentication:** Required  

#### Path Parameters

| Parameter  | Type   | Required | Description    |
|------------|--------|----------|----------------|
| questionId | string | Yes      | ID câu hỏi     |

#### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Số trang                       |
| limit     | number | No       | 10      | Số lượng mỗi trang             |
| filter    | enum   | No       | ""      | Filter: upvote                 |

#### Response

```json
{
  "message": "Get comments successfully",
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "Bài viết rất hay!",
        "userId": 456,
        "userName": "Trần Thị B",
        "parentId": 0,
        "upvoteCount": 5,
        "isUpvoted": 1,
        "childCount": 2,
        "createdAt": "2024-08-11T10:30:00Z"
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET `/practice-writing/comment-child/:commentId`

Lấy danh sách bình luận con (replies) của một bình luận.

**URL:** `/practice-writing/comment-child/:commentId`  
**Method:** `GET`  
**Authentication:** Required  

#### Path Parameters

| Parameter | Type   | Required | Description       |
|-----------|--------|----------|-------------------|
| commentId | string | Yes      | ID bình luận cha  |

#### Response

```json
{
  "message": "Get child comments successfully",
  "data": {
    "comments": [
      {
        "id": 2,
        "content": "Cảm ơn bạn!",
        "userId": 123,
        "userName": "Nguyễn Văn A",
        "parentId": 1,
        "upvoteCount": 2,
        "isUpvoted": 0,
        "createdAt": "2024-08-11T11:00:00Z"
      }
    ]
  }
}
```

---

### POST `/practice-writing/comment`

Tạo bình luận mới cho câu hỏi hoặc reply cho bình luận.

**URL:** `/practice-writing/comment`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "questionId": 1,
  "content": "Bài viết rất tốt!",
  "parentId": 0,
  "language": "vi"
}
```

#### Request Body Fields

| Field      | Type   | Required | Description                           |
|------------|--------|----------|---------------------------------------|
| questionId | number | Yes      | ID câu hỏi                            |
| content    | string | Yes      | Nội dung bình luận                    |
| parentId   | number | Yes      | ID bình luận cha (0 = root comment)   |
| language   | string | Yes      | Ngôn ngữ: vi/en/zh                    |

#### Response

```json
{
  "message": "Comment created successfully",
  "data": {
    "id": 123,
    "content": "Bài viết rất tốt!",
    "userId": 456,
    "questionId": 1,
    "parentId": 0,
    "createdAt": "2024-08-11T10:30:00Z"
  }
}
```

---

### POST `/practice-writing/comment/upvote`

Like/Unlike một bình luận.

**URL:** `/practice-writing/comment/upvote`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "commentId": 123,
  "isLike": 1
}
```

#### Request Body Fields

| Field     | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| commentId | number | Yes      | ID bình luận             |
| isLike    | enum   | Yes      | 1=Like, 0=Unlike         |

#### Response

```json
{
  "message": "Comment upvoted successfully",
  "data": {
    "commentId": 123,
    "isLiked": 1,
    "upvoteCount": 6
  }
}
```

---

### POST `/practice-writing/question/upvote`

Like/Unlike một câu hỏi.

**URL:** `/practice-writing/question/upvote`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "questionId": 1,
  "isLike": 1
}
```

#### Response

```json
{
  "message": "Question upvoted successfully",
  "data": {
    "questionId": 1,
    "isLiked": 1,
    "likeCount": 16
  }
}
```

---

### POST `/practice-writing/make-question`

Tạo câu hỏi mới cho user Premium với upload ảnh.

**URL:** `/practice-writing/make-question`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Headers

| Header       | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| Content-Type | string | Yes      | multipart/form-data |

#### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| kind      | enum   | Yes      | Loại câu hỏi (KindQuestion)    |

#### Request Body (Form Data)

| Field    | Type   | Required | Description           |
|----------|--------|----------|-----------------------|
| question | string | No       | Nội dung câu hỏi      |
| img      | file   | No       | Ảnh liên quan         |

#### Kind Question Options

| Value  | Description              | Daily Limit |
|--------|--------------------------|-------------|
| 430002 | HSK 4 Writing Task 2     | 3           |
| 530002 | HSK 5 Writing Task 2     | 3           |
| 530003 | HSK 5 Writing Task 3     | 1           |
| 630001 | HSK 6 Writing Task 1     | 1           |

#### Response

```json
{
  "message": "Question created successfully",
  "data": {
    "id": 456,
    "content": "写一篇关于环保的文章",
    "kind": "430002",
    "userId": 123,
    "imageUrl": "https://domain.com/uploads/question_img_456.jpg",
    "createdAt": "2024-08-11T10:30:00Z"
  }
}
```

#### Error Responses

**Daily Limit Exceeded:**
- **Code:** 429 Too Many Requests
- **Content:**
```json
{
  "message": "Vượt quá số lượng tạo câu hỏi của dạng",
  "statusCode": 429
}
```

**File Too Large:**
- **Code:** 413 Payload Too Large
- **Content:**
```json
{
  "message": "Vượt quá giới hạn tải lên của file",
  "statusCode": 413
}
```

---

### POST `/practice-writing/report`

Báo cáo bình luận vi phạm.

**URL:** `/practice-writing/report`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "commentId": 123,
  "content": "Bình luận không phù hợp"
}
```

#### Request Body Fields

| Field     | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| commentId | number | Yes      | ID bình luận bị báo cáo  |
| content   | string | Yes      | Lý do báo cáo            |

#### Response

```json
{
  "message": "Report submitted successfully",
  "data": {
    "reportId": 789,
    "commentId": 123,
    "status": "pending"
  }
}
```

---

## Data Transfer Objects

### CreateCommentDto

```typescript
interface CreateCommentDto {
  questionId: number;  // Required - ID câu hỏi
  content: string;     // Required - Nội dung bình luận
  parentId: number;    // Required - ID bình luận cha (0 = root)
  language: string;    // Required - Ngôn ngữ
}
```

### UpvoteCommentDto

```typescript
interface UpvoteCommentDto {
  commentId: number;   // Required - ID bình luận
  isLike: LikeValue;   // Required - 1=Like, 0=Unlike
}
```

### UpvoteQuestionDto

```typescript
interface UpvoteQuestionDto {
  questionId: number;  // Required - ID câu hỏi
  isLike: LikeValue;   // Required - 1=Like, 0=Unlike
}
```

### MakeQuestionDto

```typescript
interface MakeQuestionDto {
  question?: string;   // Optional - Nội dung câu hỏi
  img?: string;        // Optional - File ảnh (binary)
}
```

### CreateCommentReportDto

```typescript
interface CreateCommentReportDto {
  commentId: number;   // Required - ID bình luận
  content: string;     // Required - Lý do báo cáo
}
```

---

## Enums

### KindQuestion

```typescript
enum KindQuestion {
  KIND_430002 = '430002',  // HSK 4 Writing Task 2
  KIND_530002 = '530002',  // HSK 5 Writing Task 2  
  KIND_530003 = '530003',  // HSK 5 Writing Task 3
  KIND_630001 = '630001'   // HSK 6 Writing Task 1
}
```

### CountQuestionInDay

```typescript
enum CountQuestionInDay {
  KIND_430002 = 3,  // 3 câu/ngày
  KIND_530002 = 3,  // 3 câu/ngày
  KIND_530003 = 1,  // 1 câu/ngày
  KIND_630001 = 1   // 1 câu/ngày
}
```

### FilterOption

```typescript
enum FilterOption {
  DEFAULT = "",     // Tất cả
  USER = "user",    // Theo user
  COMMENT = "comment", // Theo comment
  LIKE = "like"     // Theo like
}
```

### FilterCommentOption

```typescript
enum FilterCommentOption {
  DEFAULT = "",        // Tất cả
  UPVOTE = "upvote"    // Theo upvote
}
```

---

## Business Logic

### Daily Question Limits

- **HSK 4/5 Task 2:** 3 câu hỏi/ngày
- **HSK 5 Task 3:** 1 câu hỏi/ngày  
- **HSK 6 Task 1:** 1 câu hỏi/ngày
- **Reset:** Mỗi ngày 00:00 UTC

### Comment System

- **Nested Comments:** Support 2 levels (parent → child)
- **Vote System:** Like/Unlike cho comments và questions
- **Language Support:** vi/en/zh
- **Moderation:** Report system cho inappropriate content

### File Upload

- **Supported formats:** JPG, PNG, GIF
- **Max file size:** Configured in middleware
- **Storage:** Local filesystem với public URLs
- **Validation:** File type và size validation

### Rate Limiting

- **Comment creation:** Limited requests per minute
- **Vote actions:** Spam protection
- **Question creation:** Daily limits + general rate limiting
- **Report submission:** Abuse prevention

### User Permissions

- **Authentication:** Required cho tất cả endpoints
- **Premium features:** Question creation requires Premium
- **Content ownership:** Users can only modify own content
- **Moderation:** Report system cho community moderation