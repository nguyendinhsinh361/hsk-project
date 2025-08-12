# Wrap Up API Documentation

## Tổng quan

API module quản lý hệ thống nhiệm vụ và bảng xếp hạng cho người dùng, bao gồm tạo nhiệm vụ, đồng bộ tiến độ và hiển thị ranking. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Wrap Up Management](#wrap-up-management)
  - [GET /wrapup](#get-wrapup)
  - [GET /wrapup/mission](#get-wrapupmission)
  - [POST /wrapup/mission](#post-wrapupmission)
  - [POST /wrapup/fake-ranking](#post-wrapupfake-ranking)
  - [PUT /wrapup/mission/synchronize](#put-wrapupmissionsynchronize)
  - [GET /wrapup/mission/ranking](#get-wrapupmissionranking)
  - [DELETE /wrapup/mission](#delete-wrapupmission)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)

---

## Wrap Up Management

### GET `/wrapup`

Lấy thông tin tổng quan wrap up của người dùng.

**URL:** `/wrapup`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

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
  "infoLoginStartTime": "2024-01-01T00:00:00.000Z",
  "infoTotalExam": 10,
  "infoHighestTestScore": 280,
  "infoTotalQuestionPractice": 500,
  "infoTotalExamOnline": 5,
  "infoInTopUser": 2
}
```

#### Response Fields

| Field                   | Type   | Description                                |
|-------------------------|--------|--------------------------------------------|
| infoLoginStartTime      | string | Thời gian bắt đầu sử dụng ứng dụng         |
| infoTotalExam           | number | Tổng số bài thi đã làm                     |
| infoHighestTestScore    | number | Điểm cao nhất đạt được trong bài thi       |
| infoTotalQuestionPractice | number | Tổng số câu hỏi luyện tập đã làm          |
| infoTotalExamOnline     | number | Tổng số bài thi online đã tham gia         |
| infoInTopUser           | number | Thứ hạng của người dùng (nếu trong top)    |

---

### GET `/wrapup/mission`

Lấy danh sách nhiệm vụ của người dùng theo level.

**URL:** `/wrapup/mission`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Query Parameters

| Parameter | Type | Required | Description                             |
|-----------|------|----------|-----------------------------------------|
| level     | enum | Yes      | Level nhiệm vụ (LEVEL_1, LEVEL_2, ...) |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "missisons": [
    {
      "id": 1,
      "user_id": 123,
      "mission_id": 5,
      "mission_name": "Practice Reading",
      "mission_display": "Hoàn thành 3 câu hỏi đọc hiểu",
      "mission_code": "practice_reading_free",
      "mission_kind": "reading_comprehension",
      "mission_type": "free",
      "mission_level": 1,
      "mission_count": 3,
      "mission_progress": 0,
      "mission_point": 10,
      "time_start": 1704067200000,
      "time_end": 1704096000000
    }
  ],
  "time_start": 1704067200000,
  "time_end": 1704096000000
}
```

#### Response Fields

| Field          | Type     | Description                                |
|----------------|----------|--------------------------------------------|
| missisons      | object[] | Mảng các nhiệm vụ của người dùng           |
| time_start     | number   | Thời gian bắt đầu khung giờ (timestamp)    |
| time_end       | number   | Thời gian kết thúc khung giờ (timestamp)   |

#### Mission Object Fields

| Field           | Type   | Description                                |
|-----------------|--------|--------------------------------------------|
| id              | number | ID của nhiệm vụ người dùng                 |
| user_id         | number | ID người dùng                              |
| mission_id      | number | ID template nhiệm vụ                       |
| mission_name    | string | Tên nhiệm vụ                               |
| mission_display | string | Mô tả hiển thị cho người dùng              |
| mission_code    | string | Mã code của nhiệm vụ                       |
| mission_kind    | string | Loại nhiệm vụ                              |
| mission_type    | string | Phân loại (free/premium/mia)               |
| mission_level   | number | Level của nhiệm vụ                         |
| mission_count   | number | Số lượng cần hoàn thành                    |
| mission_progress| number | Tiến độ hiện tại                           |
| mission_point   | number | Điểm thưởng khi hoàn thành                 |
| time_start      | number | Thời gian bắt đầu nhiệm vụ (timestamp)     |
| time_end        | number | Thời gian kết thúc nhiệm vụ (timestamp)    |

---

### POST `/wrapup/mission`

Upload dữ liệu nhiệm vụ từ file JSON.

**URL:** `/wrapup/mission`  
**Method:** `POST`  
**Authentication:** Required (Admin middleware)  
**Content-Type:** `multipart/form-data`

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | Admin authentication token |

#### Request Body

| Field       | Type | Required | Description                    |
|-------------|------|----------|--------------------------------|
| missionData | file | Yes      | File JSON chứa dữ liệu nhiệm vụ |

#### File Format

```json
[
  {
    "sequence_number": 1,
    "feature": "practice",
    "mission": "Complete reading practice",
    "mission_code": "practice_reading_free",
    "description": "Practice reading comprehension",
    "mission_display": "Hoàn thành [số lượng] câu hỏi [dạng bài]",
    "mission_point": 10,
    "type": "free",
    "mission_number": 5
  }
]
```

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Upload missions successfully",
  "data": {
    "count": 10
  }
}
```

---

### POST `/wrapup/fake-ranking`

Upload dữ liệu fake ranking.

**URL:** `/wrapup/fake-ranking`  
**Method:** `POST`  
**Authentication:** Required (Admin middleware)  
**Content-Type:** `multipart/form-data`

#### Headers

| Header      | Type   | Required | Description       |
|-------------|--------|----------|-------------------|
| supper-key  | string | Yes      | Admin key         |

#### Request Body

| Field        | Type | Required | Description                   |
|--------------|------|----------|-------------------------------|
| rankingData  | file | Yes      | File JSON chứa dữ liệu ranking |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Upload fake ranking successfully",
  "data": {
    "count": 50
  }
}
```

---

### PUT `/wrapup/mission/synchronize`

Đồng bộ tiến độ nhiệm vụ của người dùng.

**URL:** `/wrapup/mission/synchronize`  
**Method:** `PUT`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Request Body

```json
{
  "synchronizedMission": [
    {
      "id": 1,
      "mission_progress": 2
    },
    {
      "id": 2,
      "mission_progress": 1
    }
  ]
}
```

#### Request Body Fields

| Field               | Type     | Required | Description                        |
|---------------------|----------|----------|------------------------------------|
| synchronizedMission | object[] | Yes      | Mảng các nhiệm vụ cần đồng bộ      |

#### Mission Sync Object Fields

| Field            | Type   | Required | Description                        |
|------------------|--------|----------|------------------------------------|
| id               | number | Yes      | ID của nhiệm vụ người dùng         |
| mission_progress | number | Yes      | Tiến độ mới cần cập nhật           |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Update missions_users successfully !!!",
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "mission_progress": 2,
      // ... other mission fields
    }
  ]
}
```

---

### GET `/wrapup/mission/ranking`

Lấy bảng xếp hạng và thứ hạng của người dùng.

**URL:** `/wrapup/mission/ranking`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Query Parameters

| Parameter | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| limit     | number | No       | Số lượng kết quả trả về    |
| page      | number | No       | Trang hiện tại             |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "overall_ranking": [
    {
      "user_id": 456,
      "total_scores": 1500,
      "name": "User A",
      "rank": 1
    },
    {
      "user_id": 789,
      "total_scores": 1200,
      "name": "User B", 
      "rank": 2
    }
  ],
  "current_user_ranking": {
    "user_id": 123,
    "total_scores": 800,
    "rank": 5
  }
}
```

#### Response Fields

| Field               | Type     | Description                           |
|---------------------|----------|---------------------------------------|
| overall_ranking     | object[] | Danh sách xếp hạng người dùng         |
| current_user_ranking| object   | Thông tin xếp hạng của người dùng hiện tại |

#### Ranking Object Fields

| Field        | Type   | Description                        |
|--------------|--------|------------------------------------|
| user_id      | number | ID người dùng                      |
| total_scores | number | Tổng điểm                          |
| name         | string | Tên người dùng                     |
| rank         | number | Thứ hạng                           |

---

### DELETE `/wrapup/mission`

Xóa tất cả dữ liệu missions, missions_users và ranking.

**URL:** `/wrapup/mission`  
**Method:** `DELETE`  
**Authentication:** Required (Admin middleware)  

#### Headers

| Header      | Type   | Required | Description       |
|-------------|--------|----------|-------------------|
| supper-key  | string | Yes      | Admin key         |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
"Success !!!"
```

---

## Database Schema

### Tables

#### missions

Lưu trữ template nhiệm vụ.

| Column          | Type         | Null | Default           | Description              |
|-----------------|--------------|------|-------------------|--------------------------|
| id              | INT          | No   | AUTO_INCREMENT    | Primary key              |
| mission         | VARCHAR(255) | No   | -                 | Tên nhiệm vụ             |
| mission_code    | VARCHAR(100) | No   | -                 | Mã code nhiệm vụ         |
| description     | TEXT         | No   | -                 | Mô tả chi tiết           |
| mission_display | VARCHAR(255) | No   | -                 | Mô tả hiển thị           |
| mission_point   | INT          | No   | 0                 | Điểm thưởng              |
| type            | VARCHAR(50)  | No   | 'free'            | Loại nhiệm vụ            |
| mission_number  | INT          | No   | 1                 | Số lượng cần hoàn thành  |
| feature         | VARCHAR(100) | No   | -                 | Tính năng liên quan      |
| sequence_number | INT          | No   | 0                 | Thứ tự hiển thị          |

#### missions_users

Lưu trữ nhiệm vụ được gán cho người dùng cụ thể.

| Column           | Type         | Null | Default           | Description              |
|------------------|--------------|------|-------------------|--------------------------|
| id               | INT          | No   | AUTO_INCREMENT    | Primary key              |
| user_id          | INT          | No   | -                 | ID người dùng            |
| mission_id       | INT          | No   | -                 | ID template nhiệm vụ     |
| mission_name     | VARCHAR(255) | No   | -                 | Tên nhiệm vụ             |
| mission_display  | VARCHAR(255) | No   | -                 | Mô tả hiển thị           |
| mission_code     | VARCHAR(100) | No   | -                 | Mã code nhiệm vụ         |
| mission_kind     | VARCHAR(100) | No   | -                 | Loại nhiệm vụ            |
| mission_type     | VARCHAR(50)  | No   | 'free'            | Phân loại                |
| mission_level    | INT          | No   | 1                 | Level nhiệm vụ           |
| mission_count    | INT          | No   | 1                 | Số lượng cần hoàn thành  |
| mission_progress | INT          | No   | 0                 | Tiến độ hiện tại         |
| mission_point    | INT          | No   | 0                 | Điểm thưởng              |
| time_start       | BIGINT       | No   | -                 | Thời gian bắt đầu        |
| time_end         | BIGINT       | No   | -                 | Thời gian kết thúc       |
| created_at       | TIMESTAMP    | No   | CURRENT_TIMESTAMP | Thời gian tạo            |
| updated_at       | TIMESTAMP    | No   | AUTO_UPDATE       | Thời gian cập nhật       |

#### ranking

Bảng xếp hạng tổng điểm người dùng.

| Column        | Type         | Null | Default           | Description              |
|---------------|--------------|------|-------------------|--------------------------|
| id            | INT          | No   | AUTO_INCREMENT    | Primary key              |
| user_id       | INT          | No   | -                 | ID người dùng            |
| total_scores  | INT          | No   | 0                 | Tổng điểm                |
| name          | VARCHAR(255) | No   | -                 | Tên người dùng           |
| rank          | INT          | No   | 0                 | Thứ hạng                 |
| created_at    | TIMESTAMP    | No   | CURRENT_TIMESTAMP | Thời gian tạo            |
| updated_at    | TIMESTAMP    | No   | AUTO_UPDATE       | Thời gian cập nhật       |

---

## Business Logic

### Mission Assignment

- Mỗi khung thời gian, người dùng được gán 3 nhiệm vụ (2 free + 1 premium/mia)
- Nhiệm vụ được lọc theo level và loại trừ những nhiệm vụ đã hoàn thành đủ số lần
- Với level 1-2: Loại trừ nhiệm vụ HSKK và Writing
- Với level cao hơn: Loại trừ nhiệm vụ Hán tự

### Time Slots

Hệ thống chia ngày thành 3 khung thời gian:
- **0:00 - 8:00**: Khung 1
- **8:00 - 16:00**: Khung 2  
- **16:00 - 0:00**: Khung 3

### Scoring System

- Điểm được cập nhật khi `mission_progress >= mission_count`
- Ranking được sắp xếp theo `total_scores DESC, updated_at ASC`

---

## Error Handling

### Common Error Codes

| HTTP Code | Error Type              | Description                        |
|-----------|-------------------------|------------------------------------|
| 200       | Success                 | Yêu cầu thành công                 |
| 400       | Bad Request             | Dữ liệu không hợp lệ               |
| 401       | Unauthorized            | Chưa xác thực hoặc token không hợp lệ |
| 403       | Forbidden               | Không có quyền truy cập            |
| 404       | Not Found               | Không tìm thấy tài nguyên          |
| 500       | Internal Server Error   | Lỗi máy chủ                        |

### Error Response Format

```json
{
  "message": "Error description",
  "data": null
}
```

### Specific Error Scenarios

#### Invalid Mission ID

```json
{
  "message": "Mission ID không tồn tại hoặc không thuộc về người dùng",
  "data": {
    "invalidIds": [999, 1000],
    "errorCode": "INVALID_MISSION_ID"
  }
}
```

#### Synchronization Error

```json
{
  "message": "Lỗi trong quá trình đồng bộ nhiệm vụ",
  "data": {
    "failedIds": [5, 6],
    "errorCode": "SYNC_FAILED"
  }
}
```