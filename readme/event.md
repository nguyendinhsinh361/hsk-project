# Event API Documentation

## Tổng quan

API quản lý hệ thống sự kiện thi thử online cho ứng dụng Migii HSK, bao gồm việc quản lý sự kiện, bài thi, xếp hạng và trao giải. Hệ thống hỗ trợ đa ngôn ngữ, theo dõi tiến độ thi, tính điểm tự động và quản lý follower. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Event Management](#event-management)
  - [POST /event](#post-event)
  - [GET /event/latest-time](#get-eventlatest-time)
  - [GET /event/event-list](#get-eventevent-list)
  - [GET /event/event-detail](#get-eventevent-detail)
  - [GET /event/exam-event-detail](#get-eventexam-event-detail)
  - [GET /event/event-history](#get-eventevent-history)
  - [GET /event/ranking](#get-eventranking)
  - [POST /event/complete-exam](#post-eventcomplete-exam)
  - [POST /event/follow](#post-eventfollow)
- [Event Custom Time](#event-custom-time)
- [Event Prize System](#event-prize-system)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)
- [Authentication](#authentication)

---

## Event Management

### POST `/event`

Lấy danh sách sự kiện mới nhất đang active.

**URL:** `/event`  
**Method:** `POST`  
**Authentication:** None  

#### Response

**Success Response:**
- **Code:** 201 Created
- **Content:**
```json
[
  {
    "event_id": 1,
    "level": 4,
    "kind": "HSK4",
    "active": 1
  },
  {
    "event_id": 2,
    "level": 5,
    "kind": "HSK5",
    "active": 1
  }
]
```

#### Response Fields

| Field    | Type   | Description                    |
|----------|--------|--------------------------------|
| event_id | number | ID sự kiện                     |
| level    | number | Cấp độ HSK (1-6)               |
| kind     | string | Loại sự kiện                   |
| active   | number | Trạng thái: 1=Active, 0=Inactive |

#### Business Logic

- Lấy tối đa 6 sự kiện active gần nhất
- Sắp xếp theo `end` DESC
- Chỉ lấy các field cần thiết để giảm payload

#### Ví dụ sử dụng

```javascript
// Request
POST /event

// Response
[
  {
    "event_id": 1,
    "level": 4,
    "kind": "HSK4",
    "active": 1
  }
]
```

---

### GET `/event/latest-time`

Lấy thời gian bắt đầu và kết thúc của sự kiện mới nhất.

**URL:** `/event/latest-time`  
**Method:** `GET`  
**Authentication:** None  

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "timeStart": 1691749200000,
  "timeEnd": 1691835600000
}
```

#### Response Fields

| Field     | Type   | Description                    |
|-----------|--------|--------------------------------|
| timeStart | number | Unix timestamp bắt đầu sự kiện |
| timeEnd   | number | Unix timestamp kết thúc sự kiện |

#### Error Response

**Bad Request:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Bad request",
  "statusCode": 400
}
```

---

### GET `/event/event-list`

Lấy danh sách tất cả sự kiện với thông tin chi tiết và trạng thái follow.

**URL:** `/event/event-list`  
**Method:** `GET`  
**Authentication:** Optional (UserIdNotAuthMiddleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | No       | User authentication token (optional) |

#### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| language  | enum   | No       | "vi"    | Ngôn ngữ hiển thị (LanguageEventEnum) |

#### Language Options

| Value | Description    |
|-------|----------------|
| vi    | Tiếng Việt     |
| en    | English        |
| zh-cn | 中文 (简体)     |
| zh-tw | 中文 (繁體)     |
| es    | Español        |
| fr    | Français       |
| ko    | 한국어          |
| ja    | 日本語          |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get list event successfully !!!",
  "data": [
    {
      "event_id": 1,
      "kind": "HSK4",
      "start": 1691749200000,
      "end": 1691835600000,
      "count_question": 100,
      "time": 120,
      "follower_count": 150,
      "is_following": 1,
      "timeServer": 1691780000000,
      "status": 0,
      "image": "https://admin-hsk.migii.net/images/event1.jpg",
      "title": "Thi thử HSK 4 tháng 8"
    }
  ]
}
```

#### Response Fields

| Field          | Type   | Description                           |
|----------------|--------|---------------------------------------|
| event_id       | number | ID sự kiện                            |
| kind           | string | Loại sự kiện                          |
| start          | number | Timestamp bắt đầu                     |
| end            | number | Timestamp kết thúc                    |
| count_question | number | Số câu hỏi                            |
| time           | number | Thời gian làm bài (phút)              |
| follower_count | number | Số người theo dõi                     |
| is_following   | number | User có follow: 1=Yes, 0=No           |
| timeServer     | number | Timestamp hiện tại của server         |
| status         | number | Trạng thái: 0=Đang diễn ra, 1=Sắp diễn ra, 2=Đã kết thúc |
| image          | string | URL ảnh sự kiện                       |
| title          | string | Tiêu đề theo ngôn ngữ                 |

#### Status Logic

- **Status 0:** `start <= currentTime <= end` (Đang diễn ra)
- **Status 1:** `currentTime < start` (Sắp diễn ra)  
- **Status 2:** `currentTime > end` (Đã kết thúc)

#### Ví dụ sử dụng

```javascript
// Request (có auth)
GET /event/event-list?language=vi
Authorization: Bearer user-token

// Request (không auth)
GET /event/event-list?language=en

// Response
{
  "message": "Get list event successfully !!!",
  "data": [...]
}
```

---

### GET `/event/event-detail`

Lấy chi tiết một sự kiện cụ thể với thông tin bài thi và thống kê.

**URL:** `/event/event-detail`  
**Method:** `GET`  
**Authentication:** Optional (UserIdNotAuthMiddleware)  

#### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| event_id  | string | Yes      | ID sự kiện                     |
| language  | enum   | No       | Ngôn ngữ hiển thị              |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get event detail successfully !!!",
  "data": {
    "event_id": 1,
    "kind": "HSK4",
    "start": 1691749200000,
    "end": 1691835600000,
    "count_question": 100,
    "time": 120,
    "follower_count": 150,
    "is_following": 1,
    "image": "https://admin-hsk.migii.net/images/event1.jpg",
    "title": "Thi thử HSK 4 tháng 8",
    "test_id": 201,
    "score": 300,
    "pass_score": 180,
    "count_users": 85
  }
}
```

#### Additional Response Fields

| Field       | Type   | Description                    |
|-------------|--------|--------------------------------|
| test_id     | number | ID bài thi của sự kiện         |
| score       | number | Điểm tối đa                    |
| pass_score  | number | Điểm cần để pass               |
| count_users | number | Số người đã tham gia          |

---

### GET `/event/exam-event-detail`

Lấy chi tiết đề thi của một sự kiện (parts, questions, scoring).

**URL:** `/event/exam-event-detail`  
**Method:** `GET`  
**Authentication:** None  

#### Query Parameters

| Parameter     | Type   | Required | Description    |
|---------------|--------|----------|----------------|
| exam_event_id | string | Yes      | ID đề thi      |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get event detail successfully !!!",
  "data": {
    "test_id": 201,
    "time": 120,
    "score": 300,
    "pass_score": 180,
    "parts": [
      {
        "name": "Listening",
        "content": [
          {
            "Questions": [
              {
                "id": 1,
                "scores": [2, 0, 0, 0]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Parts Structure

- **parts:** Mảng các phần thi (Listening, Reading, Writing)
- **content:** Nội dung chi tiết từng phần
- **Questions:** Danh sách câu hỏi với scoring system
- **scores:** Mảng điểm cho từng đáp án [correct, wrong1, wrong2, wrong3]

---

### GET `/event/event-history`

Lấy lịch sử thi của user trong một sự kiện cụ thể.

**URL:** `/event/event-history`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Query Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| event_id  | string | Yes      | ID sự kiện     |
| language  | enum   | No       | Ngôn ngữ       |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get event result history successfully !!!",
  "data": [
    {
      "test_id": 201,
      "event_id": 1,
      "answer": [
        {
          "id": 1,
          "answer": ["A", "B"],
          "correct": [1, 0, 0, 0]
        }
      ],
      "result_score_total": 245,
      "result_score_parts": [
        {
          "name": "Listening",
          "score": 120
        }
      ],
      "work_time": 110,
      "pass_score": 180,
      "time": 120,
      "score": 300,
      "correct_count_question": 85,
      "count_question": 100,
      "created_at": "2024-08-11T10:30:00Z"
    }
  ]
}
```

#### History Fields

| Field                   | Type   | Description                    |
|-------------------------|--------|--------------------------------|
| test_id                 | number | ID bài thi                     |
| event_id                | number | ID sự kiện                     |
| answer                  | array  | Chi tiết câu trả lời           |
| result_score_total      | number | Tổng điểm đạt được             |
| result_score_parts      | array  | Điểm từng phần                 |
| work_time               | number | Thời gian làm bài thực tế (phút) |
| correct_count_question  | number | Số câu trả lời đúng            |
| count_question          | number | Tổng số câu hỏi                |

#### Error Response

**Not Found:**
- **Code:** 404 Not Found
- **Content:**
```json
{
  "message": "Not found",
  "statusCode": 404
}
```

---

### GET `/event/ranking`

Lấy bảng xếp hạng của một sự kiện với thông tin user hiện tại.

**URL:** `/event/ranking`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Query Parameters

| Parameter | Type   | Required | Default | Description          |
|-----------|--------|----------|---------|----------------------|
| event_id  | string | Yes      | -       | ID sự kiện           |
| page      | number | No       | 1       | Số trang             |
| limit     | number | No       | 10      | Số lượng mỗi trang   |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Get ranking successfully !!!",
  "data": {
    "current_user_ranking": {
      "user_id": 123,
      "name": "Nguyễn Văn A",
      "work_time": 110,
      "result_score_total": 245,
      "score": 300,
      "created_at": "2024-08-11T10:30:00Z",
      "rank_index": 15
    },
    "event_online_ranking": [
      {
        "user_id": 456,
        "name": "Trần Thị B",
        "work_time": 105,
        "result_score_total": 280,
        "score": 300,
        "created_at": "2024-08-11T09:30:00Z",
        "rank_index": 1
      }
    ]
  }
}
```

#### Ranking Logic

**Cho event_id <= 85:**
- Sắp xếp theo: `result_score_total DESC, work_time ASC`
- Ưu tiên điểm cao, thời gian thấp

**Cho event_id > 85:**
- Sắp xếp theo: `result_score_total DESC, created_at ASC`  
- Ưu tiên điểm cao, thời gian nộp bài sớm

#### Ranking Fields

| Field               | Type   | Description                    |
|---------------------|--------|--------------------------------|
| user_id             | number | ID người dùng                  |
| name                | string | Tên người dùng                 |
| work_time           | number | Thời gian làm bài (phút)       |
| result_score_total  | number | Tổng điểm đạt được             |
| score               | number | Tổng điểm tối đa               |
| created_at          | string | Thời gian nộp bài              |
| rank_index          | number | Thứ hạng (1-based)             |

---

### POST `/event/complete-exam`

Nộp bài thi và tính điểm cho sự kiện thi thử.

**URL:** `/event/complete-exam`  
**Method:** `POST`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |
| Content-Type  | string | Yes      | application/json         |

#### Request Body

```json
{
  "test_id": 201,
  "event_id": 1,
  "answers": [
    {
      "id": 1,
      "answer": ["A", "B"],
      "correct": [1, 0, 0, 0]
    },
    {
      "id": 2,
      "answer": ["C"],
      "correct": [0, 0, 1, 0]
    }
  ],
  "work_time": 110
}
```

#### Request Body Fields

| Field     | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| test_id   | number | Yes      | ID bài thi                     |
| event_id  | number | Yes      | ID sự kiện                     |
| answers   | array  | Yes      | Mảng câu trả lời               |
| work_time | number | Yes      | Thời gian làm bài (phút)       |

#### Answer Object Fields

| Field   | Type     | Required | Description                           |
|---------|----------|----------|---------------------------------------|
| id      | number   | Yes      | ID câu hỏi                            |
| answer  | string[] | Yes      | Mảng đáp án được chọn                 |
| correct | number[] | Yes      | Mảng correct/incorrect [1,0,0,0]      |

#### Response

**Success Response:**
- **Code:** 201 Created
- **Content:**
```json
{
  "message": "Update result exam event online successfully !!!",
  "data": {
    "result_score_total": 245,
    "result_score_parts": [
      {
        "name": "Listening",
        "score": 120
      },
      {
        "name": "Reading", 
        "score": 125
      }
    ],
    "pass_score": 180,
    "score": 300,
    "rank_index": 15,
    "correct_count_question": 85,
    "count_question": 100
  }
}
```

#### Scoring Algorithm

1. **Parse exam structure** từ `event_test.parts`
2. **Calculate scores per part:**
   - Map answers với questions trong từng part
   - Tính điểm dựa trên `correct` array và `scores` của question
3. **Aggregate results:**
   - Tổng điểm tất cả parts
   - Tổng câu đúng và tổng câu hỏi
4. **Save to database** và tính rank

#### Ví dụ sử dụng

```javascript
// Request
POST /event/complete-exam
Authorization: Bearer user-token
Content-Type: application/json

{
  "test_id": 201,
  "event_id": 1,
  "answers": [...],
  "work_time": 110
}

// Response
{
  "message": "Update result exam event online successfully !!!",
  "data": {
    "result_score_total": 245,
    "rank_index": 15
  }
}
```

---

### POST `/event/follow`

Follow/Unfollow một sự kiện và cập nhật số lượng follower.

**URL:** `/event/follow`  
**Method:** `POST`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |
| Content-Type  | string | Yes      | application/json         |

#### Request Body

```json
{
  "event_id": "1",
  "follow": 1
}
```

#### Request Body Fields

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| event_id | string | Yes      | ID sự kiện                     |
| follow   | enum   | Yes      | 1=Follow, 0=Unfollow          |

#### Follow Enum (TickEnum)

| Value | Description |
|-------|-------------|
| 1     | Follow      |
| 0     | Unfollow    |

#### Response

**Success Response:**
- **Code:** 201 Created
- **Content:**
```json
{
  "message": "Update info user follow successfully !!!",
  "data": null
}
```

#### Business Logic

**Follow (follow = 1):**
1. Insert record vào `event_follow` table
2. Increment `follower_count` trong `event` table

**Unfollow (follow = 0):**
1. Delete record từ `event_follow` table  
2. Decrement `follower_count` trong `event` table (chỉ khi delete thành công)

#### Database Operations

```sql
-- Follow
INSERT INTO event_follow SET user_id = ?, event_id = ?
UPDATE event SET follower_count = follower_count + 1 WHERE event_id = ?

-- Unfollow  
DELETE FROM event_follow WHERE user_id = ? AND event_id = ?
UPDATE event SET follower_count = follower_count - 1 WHERE event_id = ?
```

---

## Event Custom Time

### Service: getTimeActiveTrial()

Quản lý thời gian cho sự kiện dùng thử đặc biệt.

#### Constant Configuration

```javascript
const EVENT_CUSTOM = [
  {
    "eventId": "TP3DAM3C1",
    "eventName": "Sự kiện dùng thử Premium 3 ngày + 3 lượt chấm AI"
  }
]
```

#### Default Times

- **Default Start:** `1718278113000`
- **Default End:** `1719791999000`

#### Response Format

```json
{
  "message": "Get event custom time successfully.",
  "data": {
    "startTime": 1718278113000,
    "endTime": 1719791999000,
    "serverTime": 1691780000000
  }
}
```

#### Usage

Được sử dụng trong Awards API để kiểm tra thời gian hợp lệ cho việc nhận trial rewards.

---

## Event Prize System

### EventPrizeEntity

Lưu trữ thông tin trao giải cho các sự kiện.

#### Entity Structure

```typescript
interface EventPrizeEntity {
  id: number;           // Primary key
  user_id: number;      // ID người dùng
  event_id: number;     // ID sự kiện  
  active: number;       // Trạng thái: 1=Active
  rank: number;         // Thứ hạng đạt được
  level: number;        // Level HSK
  created_at: Date;     // Thời gian tạo
  updated_at: Date;     // Thời gian cập nhật
}
```

#### Service Method

```typescript
async createMultipleEventPrize(data: any[]) {
  return await this.eventPrizeRepository.create(data);
}
```

#### Usage in Awards System

Được sử dụng để lưu trữ danh sách người đạt TOP 20 mỗi level trong các sự kiện online, phục vụ cho việc trao thưởng tự động.

---

## Data Transfer Objects

### EventRequestDto

DTO cho request lấy danh sách sự kiện.

```typescript
interface EventRequestDto {
  language: LanguageEventEnum; // Optional - Ngôn ngữ hiển thị
}
```

### EventDetailDto

DTO cho request chi tiết sự kiện.

```typescript
interface EventDetailDto {
  language: LanguageEventEnum; // Optional - Ngôn ngữ hiển thị
  event_id: string;           // Required - ID sự kiện
}
```

### ExamEventDetailDto

DTO cho request chi tiết đề thi.

```typescript
interface ExamEventDetailDto {
  exam_event_id: string; // Required - ID đề thi
}
```

### RankingFilterDto

DTO cho request bảng xếp hạng với pagination.

```typescript
interface RankingFilterDto {
  page: number;      // From PaginateDto
  limit: number;     // From PaginateDto
  event_id: string;  // Required - ID sự kiện
}
```

### AnswerDetailDto

DTO cho chi tiết câu trả lời.

```typescript
interface AnswerDetailDto {
  id: number;        // Required - ID câu hỏi
  answer: string[];  // Required - Mảng đáp án
  correct: number[]; // Required - Mảng correct/incorrect
}
```

#### Validation Rules

- `id`: Phải là số nguyên
- `answer`: Mảng string không rỗng
- `correct`: Mảng số với mỗi phần tử là 0 hoặc 1

### UpdateResultExamOnlineDto

DTO cho việc nộp bài thi.

```typescript
interface UpdateResultExamOnlineDto {
  test_id: number;           // Required - ID bài thi
  event_id: number;          // Required - ID sự kiện
  answers: AnswerDetailDto[]; // Required - Mảng câu trả lời
  work_time: number;         // Required - Thời gian làm bài
}
```

#### Validation

- `@ValidateNested({ each: true })` cho answers array
- `@Type(() => AnswerDetailDto)` để transform nested objects

### UserFollowDto

DTO cho việc follow/unfollow sự kiện.

```typescript
interface UserFollowDto {
  event_id: string; // Required - ID sự kiện
  follow: TickEnum; // Required - Follow status
}
```

---

## Enums

### LanguageEventEnum

Enum cho các ngôn ngữ được hỗ trợ.

```typescript
enum LanguageEventEnum {
  VI = "vi",       // Tiếng Việt
  EN = "en",       // English
  ZH_CN = "zh-cn", // 中文 (简体)
  ZH_TW = "zh-tw", // 中文 (繁體)
  ES = "es",       // Español
  FR = "fr",       // Français
  KO = "ko",       // 한국어
  JA = "ja"        // 日本語
}
```

### TickEnum

Enum cho follow status (imported từ theory-notebook).

```typescript
enum TickEnum {
  FOLLOW = 1,      // Follow
  UNFOLLOW = 0     // Unfollow
}
```

---

## Database Schema

### event Table

Bảng chính lưu trữ thông tin sự kiện.

```sql
CREATE TABLE event (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  level INT NULLABLE,
  kind VARCHAR(225) NOT NULL,
  active INT DEFAULT 1,
  start BIGINT NOT NULL,
  end BIGINT NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  count_question INT NULLABLE,
  time INT NULLABLE,
  follower_count INT DEFAULT 0
);

-- Indexes
CREATE INDEX idx_active ON event(active);
CREATE INDEX idx_start_end ON event(start, end);
CREATE INDEX idx_level ON event(level);
```

#### Table Fields

| Column         | Type     | Description                    |
|----------------|----------|--------------------------------|
| event_id       | INT      | Primary key                    |
| level          | INT      | Cấp độ HSK (1-6)               |
| kind           | VARCHAR  | Loại sự kiện (HSK4, HSK5...)   |
| active         | INT      | Trạng thái: 1=Active, 0=Inactive |
| start          | BIGINT   | Unix timestamp bắt đầu        |
| end            | BIGINT   | Unix timestamp kết thúc       |
| description    | TEXT     | Mô tả JSON đa ngôn ngữ         |
| count_question | INT      | Số câu hỏi                     |
| time           | INT      | Thời gian làm bài (phút)       |
| follower_count | INT      | Số người theo dõi              |

### event_test Table

Lưu trữ thông tin đề thi của sự kiện.

```sql
CREATE TABLE event_test (
  test_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  time INT NOT NULL,
  score INT NOT NULL,
  pass_score INT NOT NULL,
  parts TEXT NOT NULL,
  count_question INT NOT NULL,
  active INT DEFAULT 1,
  
  FOREIGN KEY (event_id) REFERENCES event(event_id)
);
```

#### Table Fields

| Column         | Type | Description                    |
|----------------|------|--------------------------------|
| test_id        | INT  | Primary key                    |
| event_id       | INT  | Foreign key to event           |
| time           | INT  | Thời gian làm bài (phút)       |
| score          | INT  | Điểm tối đa                    |
| pass_score     | INT  | Điểm cần để pass               |
| parts          | TEXT | JSON structure đề thi          |
| count_question | INT  | Tổng số câu hỏi                |

### event_test_result Table

Lưu trữ kết quả thi của người dùng.

```sql
CREATE TABLE event_test_result (
  id INT AUTO_INCREMENT PRIMARY KEY,
  test_id INT NOT NULL,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  answer TEXT NOT NULL,
  result_score_total INT NOT NULL,
  result_score_parts TEXT NOT NULL,
  work_time INT NOT NULL,
  pass_score INT NOT NULL,
  time INT NOT NULL,
  score INT NOT NULL,
  correct_count_question INT NOT NULL,
  count_question INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (test_id) REFERENCES event_test(test_id),
  FOREIGN KEY (event_id) REFERENCES event(event_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_event_id ON event_test_result(event_id);
CREATE INDEX idx_user_id ON event_test_result(user_id);
CREATE INDEX idx_score_worktime ON event_test_result(result_score_total, work_time);
CREATE INDEX idx_score_created ON event_test_result(result_score_total, created_at);
```

#### Table Fields

| Column                  | Type      | Description                    |
|-------------------------|-----------|--------------------------------|
| id                      | INT       | Primary key                    |
| test_id                 | INT       | Foreign key to event_test      |
| event_id                | INT       | Foreign key to event           |
| user_id                 | INT       | Foreign key to users           |
| answer                  | TEXT      | JSON câu trả lời               |
| result_score_total      | INT       | Tổng điểm đạt được             |
| result_score_parts      | TEXT      | JSON điểm từng phần            |
| work_time               | INT       | Thời gian làm bài (phút)       |
| pass_score              | INT       | Điểm cần để pass               |
| time                    | INT       | Thời gian cho phép (phút)      |
| score                   | INT       | Điểm tối đa                    |
| correct_count_question  | INT       | Số câu trả lời đúng            |
| count_question          | INT       | Tổng số câu hỏi                |

### event_follow Table

Lưu trữ thông tin user follow sự kiện.

```sql
CREATE TABLE event_follow (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES event(event_id),
  UNIQUE KEY unique_user_event (user_id, event_id)
);

-- Indexes
CREATE INDEX idx_user_id ON event_follow(user_id);
CREATE INDEX idx_event_id ON event_follow(event_id);
```

### event_custom_time Table

Lưu trữ thời gian custom cho các sự kiện đặc biệt.

```sql
CREATE TABLE event_custom_time (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  active INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### event_prize Table

Lưu trữ thông tin trao giải.

```sql
CREATE TABLE event_prize (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULLABLE,
  event_id INT DEFAULT 1,
  active INT DEFAULT 1,
  rank INT NOT NULL,
  level INT NULLABLE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES event(event_id)
);
```

---

## Business Logic

### Event Status Management

#### Status Calculation
```javascript
const calculateEventStatus = (start, end, currentTime) => {
  if (start <= currentTime && end >= currentTime) {
    return 0; // Đang diễn ra
  } else if (end > currentTime) {
    return 1; // Sắp diễn ra
  } else {
    return 2; // Đã kết thúc
  }
};
```

#### Time Management
- **Server Time Sync:** Tất cả response đều include `timeServer`
- **Timezone Handling:** Sử dụng Unix timestamps để tránh timezone issues
- **Event Scheduling:** Automatic status updates dựa trên current time

### Multi-language Content

#### Description JSON Structure
```json
{
  "vi": {
    "title": "Thi thử HSK 4 tháng 8",
    "image": "/images/event_hsk4_vi.jpg"
  },
  "en": {
    "title": "HSK 4 Mock Test August",
    "image": "/images/event_hsk4_en.jpg"
  },
  "zh-cn": {
    "title": "HSK四级模拟考试八月",
    "image": "/images/event_hsk4_cn.jpg"
  }
}
```

#### Image URL Processing
```javascript
// Auto-prefix với domain nếu URL không chứa http
const processImageURL = (image, domain) => {
  if (!image) return null;
  return image.includes('http') ? image : `${domain}${image}`;
};
```

### Scoring System

#### Parts-based Scoring
```javascript
const calculateResults = (userAnswers, questionScores) => {
  return userAnswers.reduce((acc, userAnswer) => {
    const question = questionScores.find(q => q.id === userAnswer.id);
    if (question) {
      // Count correct answers
      acc.totalCorrect += userAnswer.correct.filter(c => c === 1).length;
      
      // Count total questions  
      acc.totalQuestion += question.scores.length;
      
      // Calculate weighted score
      acc.totalScore += userAnswer.correct
        .map((isCorrect, index) => 
          isCorrect === 1 ? question.scores[index] : 0
        )
        .reduce((sum, score) => sum + score, 0);
    }
    return acc;
  }, { totalCorrect: 0, totalScore: 0, totalQuestion: 0 });
};
```

#### Multi-part Aggregation
1. **Parse exam structure** từ JSON `parts` field
2. **Map user answers** với questions trong từng part
3. **Calculate scores per part** sử dụng weighted scoring
4. **Aggregate total scores** across all parts
5. **Save detailed results** với breakdown theo parts

### Ranking Algorithm

#### Legacy vs New Ranking
```javascript
const EVENT_ID_STONE = 85;

const getRankingQuery = (eventId) => {
  const baseQuery = `
    SELECT res.user_id, users.name, res.work_time, 
           res.result_score_total, res.score, res.created_at 
    FROM event_test_result as res 
    JOIN users on users.id = res.user_id  
    WHERE res.event_id = ${eventId}
  `;
  
  if (eventId > EVENT_ID_STONE) {
    return `${baseQuery} ORDER BY res.result_score_total DESC, res.created_at ASC`;
  } else {
    return `${baseQuery} ORDER BY res.result_score_total DESC, res.work_time ASC`;
  }
};
```

#### Duplicate Handling
```javascript
// Remove duplicate entries per user per event
const removeDuplicates = (results) => {
  return results.reduce((acc, item) => {
    const key = `${item.user_id}-${item.event_id}`;
    if (!acc.seen.has(key)) {
      acc.seen.add(key);
      acc.result.push(item);
    }
    return acc;
  }, { seen: new Set(), result: [] }).result;
};
```

### Follow System

#### Follow/Unfollow Logic
```javascript
const updateFollowStatus = async (userId, eventId, isFollow) => {
  if (isFollow) {
    // Add follow record
    await query(`INSERT INTO event_follow SET user_id = ?, event_id = ?`, 
                [userId, eventId]);
    
    // Increment follower count
    await query(`UPDATE event SET follower_count = follower_count + 1 
                 WHERE event_id = ?`, [eventId]);
  } else {
    // Remove follow record
    const result = await query(
      `DELETE FROM event_follow WHERE user_id = ? AND event_id = ?`, 
      [userId, eventId]
    );
    
    // Decrement follower count only if delete was successful
    if (result.affectedRows > 0) {
      await query(`UPDATE event SET follower_count = follower_count - 1 
                   WHERE event_id = ?`, [eventId]);
    }
  }
};
```

#### Follow Count Integrity
- **Atomic Operations:** Follow/unfollow và count update trong same transaction
- **Conditional Updates:** Chỉ update count khi database operation thành công
- **Consistency Checks:** Periodic verification của follower counts

---

## Authentication

### Middleware Configuration

```typescript
// Optional authentication - có thể access không cần đăng nhập
consumer
  .apply(UserIdNotAuthMiddleware)
  .forRoutes(
    { path: 'event/event-list', method: RequestMethod.GET },
    { path: 'event/event-detail', method: RequestMethod.GET }
  );

// Required authentication - phải đăng nhập
consumer
  .apply(UserIdMiddleware)
  .forRoutes(
    { path: 'event/event-history', method: RequestMethod.GET },
    { path: 'event/ranking', method: RequestMethod.GET },
    { path: 'event/complete-exam', method: RequestMethod.POST },
    { path: 'event/follow', method: RequestMethod.POST }
  );
```

### Access Control Strategy

#### Public Access (No Auth Required)
- **POST /event** - Lấy sự kiện mới nhất
- **GET /event/latest-time** - Thời gian sự kiện
- **GET /event/exam-event-detail** - Chi tiết đề thi

#### Optional Authentication (UserIdNotAuthMiddleware)
- **GET /event/event-list** - Danh sách sự kiện (follow status nếu có auth)
- **GET /event/event-detail** - Chi tiết sự kiện (follow status nếu có auth)

#### Required Authentication (UserIdMiddleware)
- **GET /event/event-history** - Lịch sử cá nhân
- **GET /event/ranking** - Xếp hạng (include user's rank)
- **POST /event/complete-exam** - Nộp bài thi
- **POST /event/follow** - Follow/unfollow sự kiện