# Theory Notebook API Documentation

## Tổng quan

API quản lý sổ tay lý thuyết cá nhân cho ứng dụng Migii HSK, cho phép người dùng ghi chú, đánh dấu và theo dõi mức độ hiểu biết về từ vựng, ngữ pháp và hán tự. Hệ thống hỗ trợ sync dữ liệu legacy và quản lý progress học tập chi tiết.

## Mục lục

- [Theory Notebook Management](#theory-notebook-management)
  - [GET /theory-notebook](#get-theory-notebook)
  - [POST /theory-notebook](#post-theory-notebook)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)

---

## Theory Notebook Management

### GET `/theory-notebook`

Lấy danh sách từ/câu lý thuyết trong sổ tay theo option.

**URL:** `/theory-notebook`  
**Method:** `GET`  
**Authentication:** Required  

#### Query Parameters

| Parameter | Type   | Required | Default     | Description                    |
|-----------|--------|----------|-------------|--------------------------------|
| page      | number | No       | 1           | Số trang                       |
| limit     | number | No       | 10          | Số lượng mỗi trang             |
| level     | enum   | No       | -           | Level HSK (1-7)                |
| filter    | enum   | No       | "0"         | Lọc theo mức độ hiểu biết      |
| kind      | enum   | No       | "hanzii"    | Loại lý thuyết                 |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "message": "Get all theory notebook by option successfully",
  "data": [
    {
      "id": 123,
      "user_id": 456,
      "theory_id": 1001,
      "level": 4,
      "understand_level": 1,
      "tick": 1,
      "click": 1,
      "take_note": "Từ này rất quan trọng",
      "kind": "word",
      "hanzii": null,
      "word": "学习",
      "grammar": null,
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
| theory_id        | number | ID lý thuyết                          |
| level            | number | Level HSK                             |
| understand_level | number | Mức độ hiểu: 0=Mặc định, 1=Đã biết, 2=Không biết, 3=Không chắc |
| tick             | number | Đánh dấu: 0=Không, 1=Có               |
| click            | number | Đã click vào: 0=Không, 1=Có          |
| take_note        | string | Ghi chú cá nhân                       |
| kind             | string | Loại: word/grammar/hanzii             |
| word             | string | Nội dung từ vựng                      |
| grammar          | string | Nội dung ngữ pháp                     |
| hanzii           | string | Nội dung hán tự                       |

#### Legacy Data Sync

Khi `kind != "hanzii"`, hệ thống tự động sync dữ liệu từ `users_synchronized`:

```javascript
// Auto-sync vocabulary và grammar từ legacy system
if (kind !== KindFilterEnum.HANZII) {
  const legacyData = await getUserSynchronizedData(user_id);
  await syncVocabularyData(legacyData.listVocab);
  await syncGrammarData(legacyData.listGrammar);
}
```

#### Ví dụ sử dụng

```javascript
// Request
GET /theory-notebook?page=1&limit=20&level=4&filter=1&kind=word
Authorization: Bearer user-token

// Response
{
  "message": "Get all theory notebook by option successfully",
  "data": [...]
}
```

---

### POST `/theory-notebook`

Tạo/Cập nhật ghi chú lý thuyết trong sổ tay.

**URL:** `/theory-notebook`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "theoryInput": [
    {
      "theoryId": "1001",
      "takeNote": "Từ này dùng trong văn phong trang trọng",
      "tick": "1",
      "understandLevel": "1",
      "level": "4",
      "kind": "word",
      "click": "1",
      "word": "学习"
    },
    {
      "theoryId": "2001",
      "takeNote": "Cấu trúc này hay gặp trong HSK 5",
      "tick": "1",
      "understandLevel": "3",
      "level": "5",
      "kind": "grammar",
      "grammar": "不但...而且..."
    }
  ]
}
```

#### Request Body Fields

| Field       | Type                        | Required | Description                    |
|-------------|-----------------------------|----------|--------------------------------|
| theoryInput | CreateTheoryNotebookDto[]   | Yes      | Mảng ghi chú cần tạo/cập nhật |

#### CreateTheoryNotebookDto Fields

| Field           | Type   | Required | Default     | Description                    |
|-----------------|--------|----------|-------------|--------------------------------|
| theoryId        | string | Yes      | "0"         | ID lý thuyết                   |
| takeNote        | string | No       | -           | Ghi chú cá nhân                |
| tick            | enum   | No       | -           | Đánh dấu (0/1)                 |
| understandLevel | enum   | No       | -           | Mức độ hiểu biết (0/1/2/3)     |
| level           | enum   | No       | -           | Level HSK                      |
| kind            | enum   | No       | "hanzii"    | Loại lý thuyết                 |
| click           | enum   | No       | "0"         | Đã click vào (0/1)             |
| word            | string | No       | -           | Nội dung từ vựng               |
| grammar         | string | No       | -           | Nội dung ngữ pháp              |
| hanzii          | string | No       | -           | Nội dung hán tự                |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "message": "Create/Update theory notebook successfully",
  "data": {
    "idsTheorySuccess": [1001, 2001],
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
1. Kiểm tra ghi chú đã tồn tại chưa (theo `theory_id` + `user_id`)
2. Nếu tồn tại → Update fields có giá trị
3. Nếu chưa tồn tại → Create record mới
4. Trim whitespace cho text fields
5. Trả về danh sách success/failed IDs

#### Ví dụ sử dụng

```javascript
// Request
POST /theory-notebook
Authorization: Bearer user-token
Content-Type: application/json

{
  "theoryInput": [
    {
      "theoryId": "1001",
      "takeNote": "Từ quan trọng cần nhớ",
      "tick": "1",
      "understandLevel": "1",
      "kind": "word",
      "word": "重要"
    }
  ]
}

// Response
{
  "message": "Create/Update theory notebook successfully",
  "data": {
    "idsTheorySuccess": [1001],
    "idsTheoryFailed": []
  }
}
```

---

## Data Transfer Objects

### CreateTheoryNotebookDto

```typescript
interface CreateTheoryNotebookDto {
  theoryId: string;                      // Required - ID lý thuyết
  takeNote?: string;                     // Optional - Ghi chú
  tick?: TickEnum;                       // Optional - Đánh dấu
  understandLevel: UnderstandLevelFilterEnum; // Required - Mức độ hiểu
  level?: TheoryLevelEnum;               // Optional - Level HSK
  kind?: KindFilterEnum;                 // Optional - Loại lý thuyết
  click?: TickEnum;                      // Optional - Đã click
  word?: string;                         // Optional - Nội dung từ vựng
  grammar?: string;                      // Optional - Nội dung ngữ pháp
  hanzii?: string;                       // Optional - Nội dung hán tự
}
```

### PaginateTheoryFilterDto

```typescript
interface PaginateTheoryFilterDto {
  page?: number;                         // Optional - Số trang
  limit?: number;                        // Optional - Số lượng mỗi trang
  level?: TheoryLevelEnum;               // Optional - Level HSK
  filter: UnderstandLevelFilterEnum;     // Required - Filter mức độ hiểu
  kind: KindFilterEnum;                  // Required - Loại lý thuyết
}
```

---

## Enums

### UnderstandLevelFilterEnum

```typescript
enum UnderstandLevelFilterEnum {
  DEFAULT = "0",  // Mặc định/Tất cả
  KNOWN = "1",    // Đã biết
  UNKNOWN = "2",  // Không biết
  UNSURE = "3"    // Không chắc
}
```

### TickEnum

```typescript
enum TickEnum {
  TRUE = "1",   // Có/Đánh dấu
  FALSE = "0"   // Không/Bỏ đánh dấu
}
```

### KindFilterEnum

```typescript
enum KindFilterEnum {
  HANZII = "hanzii",   // Hán tự
  WORD = "word",       // Từ vựng
  GRAMMAR = "grammar"  // Ngữ pháp
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
  LEVEL_6 = "6",  // HSK 6
  LEVEL_7 = "7"   // HSK 7
}
```

---

## Database Schema

### theory_notebook Table

```sql
CREATE TABLE theory_notebook (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT,
  theory_id INT,
  level INT,
  understand_level INT DEFAULT 0,
  tick INT,
  click INT DEFAULT 0,
  take_note VARCHAR(255),
  kind VARCHAR(255) DEFAULT "hanzii",
  hanzii VARCHAR(255) DEFAULT NULL,
  word VARCHAR(255) DEFAULT NULL,
  grammar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_theory_kind (user_id, theory_id, kind),
  UNIQUE KEY unique_user_word (user_id, word),
  INDEX idx_user_id (user_id),
  INDEX idx_kind (kind),
  INDEX idx_level (level),
  INDEX idx_understand_level (understand_level)
);
```

#### Table Fields

| Column           | Type         | Description                      |
|------------------|--------------|----------------------------------|
| id               | INT          | Primary key                      |
| user_id          | INT          | Foreign key to users             |
| theory_id        | INT          | ID lý thuyết                     |
| level            | INT          | Level HSK (1-7)                  |
| understand_level | INT          | Mức độ hiểu: 0/1/2/3             |
| tick             | INT          | Đánh dấu: 0/1                    |
| click            | INT          | Đã click: 0/1                    |
| take_note        | VARCHAR(255) | Ghi chú cá nhân                  |
| kind             | VARCHAR(255) | Loại: word/grammar/hanzii        |
| word             | VARCHAR(255) | Nội dung từ vựng                 |
| grammar          | VARCHAR(255) | Nội dung ngữ pháp                |
| hanzii           | VARCHAR(255) | Nội dung hán tự                  |

---

## Business Logic

### Unique Constraints

#### Multi-field Unique Keys
- **unique_user_theory_kind:** `(user_id, theory_id, kind)`
- **unique_user_word:** `(user_id, word)`

#### Purpose
- Prevent duplicate entries cho cùng theory với cùng kind
- Prevent duplicate word entries cho cùng user

### Legacy Data Migration

#### Auto-sync Process
```javascript
const syncLegacyData = async (user_id, kind) => {
  if (kind !== KindFilterEnum.HANZII) {
    const legacyData = await getUserSynchronizedData(user_id);
    
    // Sync vocabulary
    if (legacyData.listVocab) {
      for (const word of legacyData.listVocab) {
        await insertOrUpdate({
          user_id,
          word,
          kind: KindFilterEnum.WORD,
          tick: 1
        });
      }
    }
    
    // Sync grammar
    if (legacyData.listGrammar) {
      for (const grammarId of legacyData.listGrammar) {
        await insertOrUpdate({
          user_id,
          theory_id: grammarId,
          kind: KindFilterEnum.GRAMMAR,
          tick: 1,
          click: 1
        });
      }
    }
  }
};
```

### Understanding Level System

#### Level Meanings
- **0 (DEFAULT):** Chưa đánh giá/Mặc định
- **1 (KNOWN):** Đã hiểu và thuộc
- **2 (UNKNOWN):** Chưa hiểu/không biết
- **3 (UNSURE):** Không chắc chắn

#### Study Workflow
```javascript
const studyWorkflow = {
  initial: UnderstandLevelFilterEnum.DEFAULT,
  afterStudy: UnderstandLevelFilterEnum.KNOWN,
  needReview: UnderstandLevelFilterEnum.UNSURE,
  difficult: UnderstandLevelFilterEnum.UNKNOWN
};
```

### Content Type Management

#### Word (Từ vựng)
- **Storage:** `word` field
- **Features:** Personal notes, understanding level, tick marking
- **Unique:** Per user per word

#### Grammar (Ngữ pháp)
- **Storage:** `grammar` field + `theory_id`
- **Features:** Click tracking, personal notes
- **Unique:** Per user per theory_id per kind

#### Hanzii (Hán tự)
- **Storage:** `hanzii` field
- **Features:** Character practice tracking
- **No legacy sync:** Pure user-generated content

### Query Optimization

#### Dynamic Where Conditions
```javascript
const buildWhereConditions = (user_id, level, filter, kind) => {
  let conditions = [{ user_id: +user_id, kind: kind }];
  
  if (+level) {
    conditions = [
      { user_id: +user_id, level: +level, kind: kind },
      { user_id: +user_id, level: null, kind: kind }
    ];
  }
  
  if (+filter) {
    conditions = [
      { understand_level: +filter, user_id: +user_id, level: +level, kind: kind }
    ];
  }
  
  return conditions;
};
```

#### Performance Features
- **Indexed queries:** All filter fields have indexes
- **Pagination:** Efficient LIMIT/OFFSET
- **Timestamp conversion:** Convert to milliseconds for client
- **Selective loading:** Only necessary fields

### Batch Processing

#### Create/Update Logic
```javascript
const processBatch = async (theoryInput) => {
  const results = { success: [], failed: [] };
  
  for (const input of theoryInput) {
    try {
      const existing = await findByCondition({
        theory_id: input.theoryId,
        user_id: user_id
      });
      
      if (existing) {
        await updateRecord(existing.id, input);
      } else {
        await createRecord(input);
      }
      
      results.success.push(input.theoryId);
    } catch (error) {
      results.failed.push(input.theoryId);
    }
  }
  
  return results;
};
```

#### Data Sanitization
- **Text trimming:** All string fields được trim()
- **Type conversion:** String enums → numbers
- **Null handling:** Optional fields handle null values
- **Validation:** Enum values validated trước khi save