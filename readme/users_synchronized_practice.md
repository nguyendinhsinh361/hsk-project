# User Synchronized Practice API Documentation

## Tổng quan

API quản lý hệ thống đồng bộ dữ liệu luyện tập cho ứng dụng Migii HSK, bao gồm lưu trữ và truy xuất lịch sử luyện tập, kết quả AI scoring và cập nhật điểm viết. Hệ thống hỗ trợ legacy data format và tích hợp với AI Result system.

## Mục lục

- [Synchronized Practice Management](#synchronized-practice-management)
  - [GET /user-synchronized-practice/:historyId](#get-user-synchronized-practicehistoryid)
  - [PUT /user-synchronized-practice/:historyId](#put-user-synchronized-practicehistoryid)
- [Data Transfer Objects](#data-transfer-objects)
- [Interfaces](#interfaces)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)

---

## Synchronized Practice Management

### GET `/user-synchronized-practice/:historyId`

Lấy chi tiết lịch sử luyện tập với kết quả AI scoring.

**URL:** `/user-synchronized-practice/:historyId`  
**Method:** `GET`  
**Authentication:** Required  

#### Path Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| historyId | string | Yes      | ID lịch sử luyện tập  |

#### Response

**Success Response:**
- **Code:** 201 Created
```json
{
  "Err": null,
  "User": {
    "content": {
      "question_1": "answer_content_1",
      "question_2": "answer_content_2"
    },
    "result": {
      "correct": 8,
      "currentDayRoute": 1,
      "id": "20240811_001",
      "idKind": "430002",
      "numberQuesComplete": 10,
      "numberQuesRoute": 10,
      "numberQuesRouteDid": 10,
      "number_ques": 10,
      "time": 1200,
      "total": 10,
      "totalScore": "85",
      "totalTime": "20:00",
      "typeHistory": 1
    },
    "sync_type": "practice"
  },
  "aiResult": [
    {
      "questionId": 40928,
      "result": {
        "answerEvaluation": [
          {
            "criteria": "Content and Task Response",
            "analysis": "Bài viết hoàn thành tốt yêu cầu",
            "score": "Good"
          }
        ],
        "overallEvaluation": "Bạn có kiến thức tốt...",
        "score": "6-8",
        "scoreDetail": 7.5
      },
      "status": true
    }
  ]
}
```

#### Response Fields

| Field              | Type   | Description                           |
|--------------------|--------|---------------------------------------|
| Err                | string | Error message (null nếu thành công)   |
| User.content       | object | Nội dung câu trả lời (JSON)           |
| User.result        | object | Kết quả tổng kết luyện tập            |
| User.sync_type     | string | Loại đồng bộ (practice/test)          |
| aiResult           | array  | Kết quả AI scoring chi tiết           |
| aiResult.questionId| number | ID câu hỏi được chấm AI               |
| aiResult.result    | object | Chi tiết kết quả AI scoring           |
| aiResult.status    | boolean| True=AI scoring thành công, False=lỗi validation |

#### AI Result Processing

**Deduplication Logic:**
```javascript
const uniqueAiResult = [];
let seenQuestionIds = new Set();

for (let item of aiResultRaw) {
  if (!seenQuestionIds.has(item.questionId)) {
    uniqueAiResult.push(item);
    seenQuestionIds.add(item.questionId);
  }
}
```

**Status Determination:**
```javascript
const status = (JSON.parse(ele.result)).hasOwnProperty('isNotContainsTopicWord') ? false : true;
```
- **True:** AI scoring thành công (có kết quả đánh giá)
- **False:** Validation lỗi (có `isNotContainsTopicWord` property)

#### Ví dụ sử dụng

```javascript
// Request
GET /user-synchronized-practice/12345
Authorization: Bearer user-token

// Response
{
  "Err": null,
  "User": {
    "content": {...},
    "result": {...},
    "sync_type": "practice"
  },
  "aiResult": [...]
}
```

---

### PUT `/user-synchronized-practice/:historyId`

Cập nhật điểm viết cho lịch sử luyện tập.

**URL:** `/user-synchronized-practice/:historyId`  
**Method:** `PUT`  
**Authentication:** Required  

#### Path Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| historyId | string | Yes      | ID lịch sử luyện tập  |

#### Request Body

```json
{
  "scoringWriting": "85"
}
```

#### Request Body Fields

| Field         | Type   | Required | Description                    |
|---------------|--------|----------|--------------------------------|
| scoringWriting| string | Yes      | Điểm viết (string number)      |

#### Response

**Success Response:**
- **Code:** 201 Created
```json
{
  "Err": null,
  "status": 200,
  "msg": "Success!",
  "User": {
    "id": 12345,
    "user_id": 456,
    "level": 4,
    "key_id": "hsk4_practice",
    "result": {
      "correct": 8,
      "currentDayRoute": 1,
      "scoreWriting": 85,
      "totalScore": "85"
    }
  }
}
```

**Error Response:**
- **Code:** 201 Created (Legacy format)
```json
{
  "Err": null,
  "status": 400,
  "msg": "Failed!",
  "User": {}
}
```

#### Business Logic

**Score Update Process:**
1. Lấy lịch sử theo `historyId` và `user_id`
2. Parse JSON result từ database
3. Cập nhật `scoreWriting` field
4. Stringify và save lại database
5. Trả về updated result

#### Ví dụ sử dụng

```javascript
// Request
PUT /user-synchronized-practice/12345
Authorization: Bearer user-token
Content-Type: application/json

{
  "scoringWriting": "90"
}

// Response
{
  "Err": null,
  "status": 200,
  "msg": "Success!",
  "User": {
    "result": {
      "scoreWriting": 90
    }
  }
}
```

---

## Data Transfer Objects

### UpdateHistoryDto

```typescript
interface UpdateHistoryDto {
  scoringWriting: string; // Required - Điểm viết (string format)
}
```

#### Validation Rules

- `scoringWriting`: Required, không được empty
- Format: String number (được convert sang int)
- Range: Thường 0-100 tùy theo scoring system

---

## Interfaces

### IFormatResponseOldHistory

```typescript
interface IFormatResponseOldHistory {
  Err: null | string;
  User: {
    content: {
      [key: string]: string; // Dynamic key-value pairs for answers
    };
    result: {
      correct: number;           // Số câu đúng
      currentDayRoute: number;   // Ngày hiện tại trong route
      id: string;               // ID lịch sử
      idKind: string;           // ID loại câu hỏi
      numberQuesComplete: number; // Số câu hoàn thành
      numberQuesRoute: number;   // Tổng số câu trong route
      numberQuesRouteDid: number; // Số câu đã làm trong route
      number_ques: number;       // Tổng số câu
      time: number;             // Thời gian làm bài (seconds)
      total: number;            // Tổng điểm
      totalScore: string;       // Tổng điểm (string format)
      totalTime: string;        // Tổng thời gian (MM:SS)
      typeHistory: number;      // Loại lịch sử
    };
    sync_type: string;          // Loại đồng bộ
  };
}
```



