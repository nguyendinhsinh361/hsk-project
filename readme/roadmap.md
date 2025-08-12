# Roadmap API Documentation

## Tổng quan

API quản lý hệ thống lộ trình học tập cá nhân hóa cho ứng dụng Migii HSK, bao gồm tạo lộ trình mặc định, quản lý lộ trình người dùng, đánh giá đầu vào và theo dõi tiến độ học tập. Hệ thống hỗ trợ adaptive learning với đánh giá năng lực và điều chỉnh lộ trình theo kết quả thực tế.

## Mục lục

- [Routes Default Management](#routes-default-management)
  - [POST /roadmap/create-route-default](#post-roadmapcreate-route-default)
- [Routes User Management](#routes-user-management)
  - [POST /roadmap/create](#post-roadmapcreate)
  - [GET /roadmap/detail](#get-roadmapdetail)
  - [PUT /roadmap/update](#put-roadmapupdate)
  - [PUT /roadmap/reset](#put-roadmapreset)
  - [DELETE /roadmap/delete/:id](#delete-roadmapdeleteid)
- [Evaluate System](#evaluate-system)
  - [POST /roadmap/evaluate-exam](#post-roadmapevaluate-exam)
  - [POST /roadmap/result-evaluate-exam](#post-roadmapresult-evaluate-exam)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)

---

## Routes Default Management

### POST `/roadmap/create-route-default`

Tạo lộ trình mặc định từ file JSON upload (Admin only).

**URL:** `/roadmap/create-route-default`  
**Method:** `POST`  
**Authentication:** None  

#### Headers

| Header       | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| Content-Type | string | Yes      | multipart/form-data |

#### Request Body (Form Data)

| Field        | Type | Required | Description           |
|--------------|------|----------|-----------------------|
| routeDefault | file | Yes      | File JSON lộ trình    |

#### File Requirements

- **Filename format:** `{level}.json` (VD: `1030.json`)
- **Content:** JSON structure của lộ trình
- **Max size:** Theo cấu hình server

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "message": "Success!"
}
```

**Error Responses:**
- **Code:** 409 Conflict - "Lộ trình đang tạo đã tồn tại"
- **Code:** 400 Bad Request - "No file uploaded"

#### Ví dụ sử dụng

```javascript
// FormData request
const formData = new FormData();
formData.append('routeDefault', fileInput.files[0]); // File: 1030.json

fetch('/roadmap/create-route-default', {
  method: 'POST',
  body: formData
});
```

---

## Routes User Management

### POST `/roadmap/create`

Tạo lộ trình cá nhân mới cho người dùng.

**URL:** `/roadmap/create`  
**Method:** `POST`  
**Authentication:** Required  

#### Query Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| level     | enum   | Yes      | Level lộ trình        |

#### Response

```json
{
  "message": "Success!"
}
```

#### Error Responses
- **Code:** 404 Not Found - "Không có dữ liệu lộ trình"
- **Code:** 409 Conflict - "Lộ trình đã tồn tại"

---

### GET `/roadmap/detail`

Lấy chi tiết lộ trình người dùng đang học.

**URL:** `/roadmap/detail`  
**Method:** `GET`  
**Authentication:** Required  

#### Query Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| level     | enum   | Yes      | Theory level (1-6)    |

#### Response

```json
{
  "data": {
    "id": 123,
    "id_user": 456,
    "level": 1030,
    "route": {
      "max_score": 300,
      "min_score": 180,
      "days": 30,
      "route": [
        {
          "type": "practice",
          "kind": "listening",
          "max_score": 100,
          "min_score": 60,
          "difficult": 1,
          "count_day": 10,
          "practice_per_day": 5,
          "id_route": 0,
          "status": false,
          "detail": [
            {
              "day": 1,
              "id_day": 0,
              "status": false,
              "process": [
                {
                  "kind": "110001",
                  "type": "practice",
                  "practice_per_day": 5,
                  "limit": null,
                  "time": null,
                  "status": false,
                  "id_process": 0
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "message": "Success!"
}
```

---

### PUT `/roadmap/update`

Cập nhật kết quả luyện tập vào lộ trình.

**URL:** `/roadmap/update`  
**Method:** `PUT`  
**Authentication:** Required  

#### Request Body

```json
{
  "id": 123,
  "id_route": 0,
  "id_day": 0,
  "id_process": 0,
  "result": {
    "questions": [
      {
        "id": 42531,
        "true": 1,
        "false": 0
      }
    ],
    "type": "practice",
    "time_start_process": 1728060924,
    "time_end_process": 1728061149,
    "sum_score": 181,
    "max_score": 300
  }
}
```

#### Response

```json
{
  "data": {
    "isPassRouteDetailProcess": true,
    "isPassRouteDetail": false,
    "isPassRoute": false,
    "updateRouteForUser": {
      "id": 123,
      "route": "..."
    }
  },
  "message": "Success!"
}
```

---

### PUT `/roadmap/reset`

Reset lộ trình từ route index cụ thể.

**URL:** `/roadmap/reset`  
**Method:** `PUT`  
**Authentication:** Required  

#### Query Parameters

| Parameter    | Type   | Required | Description                    |
|--------------|--------|----------|--------------------------------|
| id           | number | Yes      | ID lộ trình                    |
| index_route  | number | Yes      | Index route cần reset          |

#### Response

```json
{
  "data": {
    "id": 123,
    "id_user": 456,
    "level": 1030,
    "route": "..."
  },
  "message": "Success!"
}
```

---

### DELETE `/roadmap/delete/:id`

Xóa lộ trình của người dùng.

**URL:** `/roadmap/delete/:id`  
**Method:** `DELETE`  
**Authentication:** Required  

#### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| id        | string | Yes      | ID lộ trình    |

#### Response

```json
{
  "data": null,
  "message": "Success!"
}
```

---

## Evaluate System

### POST `/roadmap/evaluate-exam`

Lấy bài đánh giá đầu vào cho người dùng.

**URL:** `/roadmap/evaluate-exam`  
**Method:** `POST`  
**Authentication:** Required  

#### Query Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| level     | enum   | Yes      | Theory level (1-6)    |

#### Response

```json
{
  "data": {
    "id": 1,
    "content": {
      "detail": [
        {
          "kind": "110001",
          "questions": [
            {
              "id": 33340,
              "true": 1,
              "false": 0
            }
          ]
        }
      ],
      "timeStart": 1645278778517,
      "timeEnd": 1645278590115
    },
    "level": "1",
    "time": 30,
    "count_question": 20,
    "sum_score": 100
  },
  "message": "Success!"
}
```

---

### POST `/roadmap/result-evaluate-exam`

Gửi kết quả bài đánh giá đầu vào.

**URL:** `/roadmap/result-evaluate-exam`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "level": "1030",
  "detail": {
    "detail": [
      {
        "kind": "110001",
        "questions": [
          {
            "id": 33340,
            "true": 1,
            "false": 0
          }
        ]
      }
    ],
    "timeStart": 1645278778517,
    "timeEnd": 1645278590115
  }
}
```

#### Response

```json
{
  "data": null,
  "message": "Success!"
}
```

---

## Data Transfer Objects

### RoutesUserDto

```typescript
interface RoutesUserDto {
  level: RouteLevelEnum; // Required - Level lộ trình
}
```

### RoutesUserUpdateDto

```typescript
interface RoutesUserUpdateDto {
  id: number;                      // Required - ID lộ trình
  id_route: number;               // Required - ID route
  id_day: number;                 // Required - ID day
  id_process: number;             // Required - ID process
  result: QuestionResultRouteDto; // Required - Kết quả
}
```

### QuestionResultRouteDto

```typescript
interface QuestionResultRouteDto {
  questions?: QuestionDto[];      // Optional - Danh sách câu hỏi
  test_id?: number;              // Optional - ID đề thi
  type?: TypeRouteUserEnum;      // Optional - Loại (practice/test)
  write_score?: number;          // Optional - Điểm viết
  read_score?: number;           // Optional - Điểm đọc
  listen_score?: number;         // Optional - Điểm nghe
  time_start_process?: number;   // Optional - Thời gian bắt đầu
  time_end_process?: number;     // Optional - Thời gian kết thúc
  sum_score?: number;            // Optional - Tổng điểm
  max_score?: number;            // Optional - Điểm tối đa
  pass?: number;                 // Optional - Đã pass
}
```

### ResultEvaluateLevelDto

```typescript
interface ResultEvaluateLevelDto {
  level: RouteLevelEnum;     // Required - Level
  detail: DetailFinalDto;    // Required - Chi tiết kết quả
}
```

---

## Enums

### RouteLevelEnum

```typescript
enum RouteLevelEnum {
  // HSK 1
  LEVEL_1030 = '1030',
  LEVEL_1060 = '1060',
  LEVEL_1160030 = '1160030',
  LEVEL_1160060 = '1160060',
  LEVEL_1160090 = '1160090',
  LEVEL_1200030 = '1200030',
  LEVEL_1200060 = '1200060',
  LEVEL_1200090 = '1200090',

  // HSK 2-6 similar patterns...
  LEVEL_2030 = '2030',
  // ... more levels
}
```

### TypeRouteUserEnum

```typescript
enum TypeRouteUserEnum {
  PRACTICE = "practice",  // Luyện tập
  TEST = "test"          // Kiểm tra
}
```

---

## Database Schema

### routes_default Table

```sql
CREATE TABLE routes_default (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level TEXT,
  route LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### routes_user Table

```sql
CREATE TABLE routes_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT,
  level TEXT,
  route LONGTEXT,
  backup LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### questions_evaluate_level Table

```sql
CREATE TABLE questions_evaluate_level (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content LONGTEXT,
  level VARCHAR(255),
  time INT,
  count_question INT,
  sum_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Business Logic

### Route Structure

#### Hierarchical Design
```
Route Object
├── max_score, min_score, days
└── route[] (Array of routes)
    ├── type, kind, difficult, count_day
    └── detail[] (Array of days)
        ├── day, id_day, status
        └── process[] (Array of processes)
            ├── kind, type, practice_per_day
            ├── status, id_process
            └── result (Optional)
```

### Adaptive Learning Flow

1. **Evaluate Exam:** User làm bài đánh giá đầu vào
2. **Route Creation:** Tạo lộ trình dựa trên kết quả đánh giá
3. **Progress Tracking:** Theo dõi tiến độ qua từng process/day/route
4. **Status Updates:** Auto-update status khi hoàn thành
5. **Route Reset:** Cho phép làm lại từ route cụ thể

### Status Management

#### Process Status
- **Complete:** Khi đạt đủ `practice_per_day` hoặc type = "test"

#### Day Status  
- **Complete:** Khi tất cả process trong ngày complete

#### Route Status
- **Complete:** Khi tất cả days trong route complete

### Auto-cleanup System

- **Duplicate Prevention:** Xóa routes cũ không sử dụng
- **Latest Route:** Luôn lấy route mới nhất theo `updated_at`
- **Inactive Cleanup:** Xóa routes có `created_at = updated_at`

### Result Aggregation

```javascript
// Append results to existing process
if (!currentRouteDetailProcess.hasOwnProperty("result")) {
  currentRouteDetailProcess["result"] = result;
} else {
  currentRouteDetailProcess.result.time_end_process = result.time_end_process;
  currentRouteDetailProcess.result.questions.push(...result.questions);
}
```