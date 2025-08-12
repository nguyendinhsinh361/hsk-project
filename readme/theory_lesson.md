# Theory Lesson API Documentation

## Tổng quan

API quản lý hệ thống bài học lý thuyết cho ứng dụng Migii HSK, bao gồm theo dõi tiến độ học lý thuyết từ vựng, ngữ pháp và hán tự của người dùng. Hệ thống hỗ trợ đánh dấu hoàn thành bài học và quản lý version nội dung lý thuyết.

## Mục lục

- [Theory Lesson Management](#theory-lesson-management)
  - [GET /theory-lesson](#get-theory-lesson)
  - [POST /theory-lesson](#post-theory-lesson)
- [Theory Version](#theory-version)
  - [GET /theory/version](#get-theoryversion)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)

---

## Theory Lesson Management

### GET `/theory-lesson`

Lấy danh sách bài học lý thuyết theo option của người dùng.

**URL:** `/theory-lesson`  
**Method:** `GET`  
**Authentication:** Required  

#### Query Parameters

| Parameter | Type   | Required | Default     | Description                    |
|-----------|--------|----------|-------------|--------------------------------|
| page      | number | No       | 1           | Số trang                       |
| limit     | number | No       | 10          | Số lượng mỗi trang             |
| level     | enum   | Yes      | -           | Level HSK (1-6)                |
| kind      | enum   | No       | "hanzii"    | Loại lý thuyết                 |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "message": "Get all theory lesson by option successfully",
  "data": [
    {
      "id": 123,
      "user_id": 456,
      "lesson_id": 1001,
      "level": 1,
      "content": "",
      "completed_status": 1,
      "kind": "hanzii",
      "created_at": 1691749200000,
      "updated_at": 1691835600000
    }
  ]
}
```

#### Response Fields

| Field            | Type   | Description                           |
|------------------|--------|---------------------------------------|
| id               | number | ID record                             |
| user_id          | number | ID người dùng                         |
| lesson_id        | number | ID bài học lý thuyết                  |
| level            | number | Level HSK (1-6)                       |
| content          | string | Nội dung bài học                      |
| completed_status | number | Trạng thái: 0=Chưa hoàn thành, 1=Hoàn thành |
| kind             | string | Loại: word/grammar/hanzii             |
| created_at       | number | Timestamp tạo                         |
| updated_at       | number | Timestamp cập nhật                    |

#### Ví dụ sử dụng

```javascript
// Request
GET /theory-lesson?page=1&limit=20&level=1&kind=hanzii
Authorization: Bearer user-token

// Response
{
  "message": "Get all theory lesson by option successfully",
  "data": [...]
}
```

---

### POST `/theory-lesson`

Tạo/Cập nhật trạng thái hoàn thành bài học lý thuyết.

**URL:** `/theory-lesson`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "theoryInput": [
    {
      "lessonId": "1001",
      "level": "1",
      "completedStatus": "1",
      "kind": "hanzii"
    },
    {
      "lessonId": "1002",
      "level": "1",
      "completedStatus": "1",
      "kind": "word"
    }
  ]
}
```

#### Request Body Fields

| Field       | Type                      | Required | Description                    |
|-------------|---------------------------|----------|--------------------------------|
| theoryInput | CreateTheoryLessonDto[]   | Yes      | Mảng bài học cần tạo/cập nhật |

#### CreateTheoryLessonDto Fields

| Field           | Type   | Required | Default   | Description                    |
|-----------------|--------|----------|-----------|--------------------------------|
| lessonId        | string | Yes      | "0"       | ID bài học                     |
| level           | enum   | No       | -         | Level HSK                      |
| completedStatus | enum   | No       | -         | Trạng thái hoàn thành          |
| kind            | enum   | No       | "hanzii"  | Loại lý thuyết                 |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "message": "Create/Update theory lesson successfully",
  "data": {
    "idsTheorySuccess": ["1001", "1002"],
    "idsTheoryFailed": []
  }
}
```

#### Error Responses

**Internal Server Error:**
- **Code:** 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

#### Business Logic

**Create/Update Flow:**
1. Kiểm tra bài học đã tồn tại chưa
2. Nếu tồn tại → Update completed_status
3. Nếu chưa tồn tại → Create record mới
4. Trả về danh sách success/failed IDs

#### Ví dụ sử dụng

```javascript
// Request
POST /theory-lesson
Authorization: Bearer user-token
Content-Type: application/json

{
  "theoryInput": [
    {
      "lessonId": "1001",
      "level": "1", 
      "completedStatus": "1",
      "kind": "hanzii"
    }
  ]
}

// Response
{
  "message": "Create/Update theory lesson successfully",
  "data": {
    "idsTheorySuccess": ["1001"],
    "idsTheoryFailed": []
  }
}
```

---

## Theory Version

### GET `/theory/version`

Lấy thông tin version mới nhất của lý thuyết theo ngôn ngữ.

**URL:** `/theory/version`  
**Method:** `GET`  
**Authentication:** None  

#### Query Parameters

| Parameter | Type   | Required | Default | Description            |
|-----------|--------|----------|---------|------------------------|
| language  | enum   | No       | "en"    | Ngôn ngữ (vi/en/zh...) |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "message": "Get theory verison successfully !!!",
  "data": {
    "id": 1,
    "language": "vi",
    "version": "2.1.0",
    "release_date": "2024-08-11",
    "description": "Cập nhật nội dung HSK 6"
  }
}
```

#### Ví dụ sử dụng

```javascript
// Request
GET /theory/version?language=vi

// Response
{
  "message": "Get theory verison successfully !!!",
  "data": {
    "id": 1,
    "language": "vi",
    "version": "2.1.0"
  }
}
```

---

## Data Transfer Objects

### CreateTheoryLessonDto

```typescript
interface CreateTheoryLessonDto {
  lessonId: string;                    // Required - ID bài học
  level?: TheoryLevelEnum;             // Optional - Level HSK
  completedStatus?: TheoryLessonComplete; // Optional - Trạng thái hoàn thành
  kind: KindFilterEnum;                // Required - Loại lý thuyết
}
```

### CreateTheoryLessonArrayDto

```typescript
interface CreateTheoryLessonArrayDto {
  theoryInput: CreateTheoryLessonDto[]; // Required - Mảng bài học
}
```

### PaginateTheoryLessonFilterDto

```typescript
interface PaginateTheoryLessonFilterDto {
  page?: number;             // Optional - Số trang
  limit?: number;            // Optional - Số lượng mỗi trang
  level: TheoryLevelEnum;    // Required - Level HSK
  kind?: KindFilterEnum;     // Optional - Loại lý thuyết
}
```

---

## Enums

### TheoryLessonComplete

```typescript
enum TheoryLessonComplete {
  TRUE = "1",   // Hoàn thành
  FALSE = "0"   // Chưa hoàn thành
}
```

### KindFilterEnum

```typescript
enum KindFilterEnum {
  WORD = "word",       // Từ vựng
  GRAMMAR = "grammar", // Ngữ pháp
  HANZII = "hanzii"    // Hán tự
}
```

### TheoryLevelEnum

```typescript
enum TheoryLevelEnum {
  LEVEL_1 = "1",  // HSK 1
  LEVEL_2 = "2",  // HSK 2
  LEVEL_3 = "3",  // HSK 3
  LEVEL_4 = "4",  // HSK 4
  LEVEL_5 = "5",  // HSK 5
  LEVEL_6 = "6"   // HSK 6
}
```

---

## Database Schema

### theory_lesson Table

```sql
CREATE TABLE theory_lesson (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT,
  lesson_id VARCHAR(255),
  level INT,
  content TEXT,
  completed_status INT DEFAULT 0,
  kind VARCHAR(255) DEFAULT "hanzii",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_theory (user_id, lesson_id),
  INDEX idx_user_id (user_id)
);
```

#### Table Fields

| Column           | Type         | Description                      |
|------------------|--------------|----------------------------------|
| id               | INT          | Primary key                      |
| user_id          | INT          | Foreign key to users             |
| lesson_id        | VARCHAR(255) | ID bài học lý thuyết             |
| level            | INT          | Level HSK (1-6)                  |
| content          | TEXT         | Nội dung bài học                 |
| completed_status | INT          | 0=Chưa hoàn thành, 1=Hoàn thành  |
| kind             | VARCHAR(255) | Loại: word/grammar/hanzii        |
| created_at       | TIMESTAMP    | Thời gian tạo                    |
| updated_at       | TIMESTAMP    | Thời gian cập nhật               |

### theory_version Table

```sql
CREATE TABLE theory_version (
  id INT AUTO_INCREMENT PRIMARY KEY,
  language VARCHAR(10),
  version VARCHAR(20),
  release_date DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table Fields

| Column       | Type         | Description                |
|--------------|--------------|----------------------------|
| id           | INT          | Primary key                |
| language     | VARCHAR(10)  | Ngôn ngữ (vi/en/zh...)     |
| version      | VARCHAR(20)  | Version number             |
| release_date | DATE         | Ngày phát hành             |
| description  | TEXT         | Mô tả thay đổi             |

---

## Business Logic

### Progress Tracking

#### Unique Constraint
- **Key:** `(user_id, lesson_id)` 
- **Purpose:** Mỗi user chỉ có 1 record cho mỗi lesson
- **Behavior:** Update nếu tồn tại, Create nếu chưa có

#### Status Management
- **0 (FALSE):** Chưa hoàn thành bài học
- **1 (TRUE):** Đã hoàn thành bài học
- **Immutable:** Không cho phép chuyển từ hoàn thành về chưa hoàn thành

### Content Types

#### Hanzii (Hán tự)
- **Purpose:** Học viết và nhận diện chữ Hán
- **Structure:** Character + stroke order + examples

#### Word (Từ vựng)
- **Purpose:** Học từ vựng và cách sử dụng
- **Structure:** Word + pinyin + meaning + examples

#### Grammar (Ngữ pháp)
- **Purpose:** Học cấu trúc ngữ pháp
- **Structure:** Grammar pattern + rules + examples

### Batch Operations

#### Create/Update Logic
```javascript
for (const input of theoryInput) {
  const existing = await findByCondition({
    lesson_id: input.lessonId,
    user_id: userId,
    level: input.level
  });
  
  if (existing) {
    // Update existing record
    await update(existing.id, {
      completed_status: input.completedStatus
    });
  } else {
    // Create new record
    await create({
      user_id: userId,
      lesson_id: input.lessonId,
      level: input.level,
      kind: input.kind,
      completed_status: input.completedStatus
    });
  }
}
```

#### Error Handling
- **Success/Failed Arrays:** Track thành công và thất bại riêng biệt
- **Partial Success:** Cho phép một số records thành công, một số thất bại
- **Rollback:** Không rollback, xử lý từng record độc lập

### Version Control

#### Theory Version System
- **Purpose:** Quản lý version nội dung lý thuyết
- **Multi-language:** Mỗi ngôn ngữ có version riêng
- **Client Sync:** Client check version để download updates

#### Version Check Flow
```javascript
// Client checks current version
const currentVersion = await getTheoryVersion({ language: 'vi' });

// Compare with local version
if (currentVersion.version !== localVersion) {
  // Download updated theory content
  await downloadTheoryContent(currentVersion.version);
}
```

### Performance Optimization

#### Database Indexing
- **User Index:** `idx_user_id` for user-specific queries
- **Unique Constraint:** Prevent duplicate records
- **Composite Queries:** Efficient filtering by user + level + kind

#### Query Optimization
- **Pagination:** LIMIT/OFFSET for large datasets
- **Selective Fields:** Only return necessary columns
- **Timestamp Conversion:** Convert to milliseconds for client compatibility