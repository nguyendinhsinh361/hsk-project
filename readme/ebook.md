# Ebook API Documentation

## Tổng quan

API quản lý hệ thống Ebook cho ứng dụng Migii HSK, bao gồm việc quản lý sách điện tử, tiến độ đọc, danh sách yêu thích và đồng bộ dữ liệu người dùng. Hệ thống hỗ trợ đa ngôn ngữ, phân loại sách theo chủ đề và theo dõi tiến độ đọc chi tiết. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Ebook Management](#ebook-management)
  - [GET /ebook](#get-ebook)
  - [POST /ebook](#post-ebook)
  - [PUT /ebook/:ebookId](#put-ebookebookid)
  - [POST /ebook/synchronize](#post-ebooksynchronize)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)
- [Authentication & Authorization](#authentication--authorization)

---

## Ebook Management

### GET `/ebook`

Lấy danh sách ebook theo option và filter của người dùng với thông tin tiến độ đọc.

**URL:** `/ebook`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Số trang                       |
| limit     | number | No       | 10      | Số lượng ebook mỗi trang       |
| lang      | string | Yes      | "vi"    | Ngôn ngữ: "vi", "en", "cn"     |
| filter    | enum   | No       | "all"   | Filter theo option (OptionEbookEnum) |
| type      | enum   | No       | "all"   | Loại sách (TypeEbookEnum)      |

#### Filter Options (OptionEbookEnum)

| Value       | Description                  |
|-------------|------------------------------|
| all         | Tất cả ebook                 |
| is_progress | Ebook đang đọc (có tiến độ)   |
| favourite   | Ebook yêu thích              |
| newest      | Ebook mới nhất               |

#### Type Options (TypeEbookEnum)

| Value           | Description        |
|-----------------|--------------------|
| all             | Tất cả loại        |
| giáo trình      | Giáo trình         |
| sách giải trí   | Sách giải trí      |
| sách luyện tập  | Sách luyện tập     |
| sách luyện thi  | Sách luyện thi     |
| sách ngữ pháp   | Sách ngữ pháp      |
| sách từ vựng    | Sách từ vựng       |
| tips/bí kíp     | Tips và bí kíp     |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "ebooks": [
    {
      "id": 1,
      "flag": "hsk4_grammar_book",
      "name": {
        "vi": "Ngữ pháp HSK 4",
        "en": "HSK 4 Grammar",
        "cn": "HSK四级语法"
      },
      "cover_img_url": "https://domain.com/covers/hsk4_grammar.jpg",
      "pdf_url": "https://domain.com/pdfs/hsk4_grammar.pdf",
      "audio_url": [
        {
          "url": "https://domain.com/audio/chapter_1_1.mp3",
          "title": "Chapter 1 Part 1"
        },
        {
          "url": "https://domain.com/audio/chapter_1_2.mp3", 
          "title": "Chapter 1 Part 2"
        }
      ],
      "type": "sách ngữ pháp",
      "type_lang": {
        "vi": "sách ngữ pháp",
        "en": "grammar book",
        "cn": "语法书"
      },
      "author": {
        "vi": "Nguyễn Văn A",
        "en": "Nguyen Van A",
        "cn": "阮文A"
      },
      "is_free": 1,
      "priority": 1,
      "language": "vi",
      "level": "HSK4",
      "skill": "grammar",
      "is_favourite": 1,
      "is_downloaded": 1,
      "progress": 75,
      "page_checkpoint": 120,
      "created_at": "2024-08-11T10:30:00Z"
    }
  ],
  "progress": 5,
  "completed": 2
}
```

#### Response Fields

| Field     | Type   | Description                           |
|-----------|--------|---------------------------------------|
| ebooks    | array  | Danh sách ebook với thông tin đầy đủ   |
| progress  | number | Số lượng ebook đang đọc (có tiến độ)   |
| completed | number | Số lượng ebook đã hoàn thành (100%)    |

#### Ebook Object Fields

| Field           | Type    | Description                     |
|-----------------|---------|--------------------------------|
| id              | number  | ID ebook                       |
| flag            | string  | Mã định danh ebook             |
| name            | object  | Tên ebook đa ngôn ngữ          |
| cover_img_url   | string  | URL ảnh bìa                    |
| pdf_url         | string  | URL file PDF                   |
| audio_url       | array   | Danh sách file audio (sorted)  |
| type            | string  | Loại sách                      |
| type_lang       | object  | Loại sách đa ngôn ngữ          |
| author          | object  | Tác giả đa ngôn ngữ            |
| is_free         | number  | Miễn phí: 1=Yes, 0=No          |
| priority        | number  | Thứ tự ưu tiên hiển thị        |
| language        | string  | Ngôn ngữ chính                 |
| level           | string  | Cấp độ (HSK1-6)                |
| skill           | string  | Kỹ năng (grammar, vocabulary)   |
| is_favourite    | number  | Yêu thích: 1=Yes, 0=No         |
| is_downloaded   | number  | Đã tải: 1=Yes, 0=No            |
| progress        | number  | Tiến độ đọc (0-100%)           |
| page_checkpoint | number  | Trang đang đọc                 |

#### Error Responses

**Ebook Not Found:**
- **Code:** 404 Not Found
- **Content:**
```json
{
  "message": "Ebook is not found.",
  "statusCode": 404
}
```

**Bad Request:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Get Ebook Option failed.",
  "data": {}
}
```

#### Business Logic

- **Language Filter:** Lấy ebook có `language = "cn"` HOẶC `language = lang`
- **App Visibility:** Chỉ lấy ebook có `is_open_app = 1`
- **Audio Sorting:** Audio URLs được sắp xếp theo thứ tự filename
- **Progress Calculation:** Dựa trên JSON data trong `ebooks_users.content`
- **Favourites:** Dựa trên JSON array trong `ebooks_users.favourites`

#### Ví dụ sử dụng

```javascript
// Request
GET /ebook?page=1&limit=10&lang=vi&filter=favourite&type=sách%20ngữ%20pháp
Authorization: Bearer user-token

// Response
{
  "ebooks": [...],
  "progress": 5,
  "completed": 2
}
```

---

### POST `/ebook`

Tạo ebook mới từ file JSON upload (Admin only).

**URL:** `/ebook`  
**Method:** `POST`  
**Authentication:** None (File upload endpoint)  

#### Headers

| Header       | Type   | Required | Description       |
|--------------|--------|----------|-------------------|
| Content-Type | string | Yes      | multipart/form-data |

#### Request Body (Form Data)

| Field     | Type | Required | Description           |
|-----------|------|----------|-----------------------|
| ebookData | file | Yes      | File JSON chứa data ebook |

#### JSON File Format

```json
[
    {
        "flag": "hsk4_grammar_book",
        "name": "{\"vi\": \"Ngữ pháp HSK 4\", \"en\": \"HSK 4 Grammar\"}",
        "cover_img_url": "https://domain.com/covers/hsk4_grammar.jpg",
        "pdf_url": "https://domain.com/pdfs/hsk4_grammar.pdf",
        "audio_url": "[{\"url\": \"audio1.mp3\", \"title\": \"Chapter 1\"}]",
        "type": "sách ngữ pháp",
        "type_lang": "{\"vi\": \"sách ngữ pháp\", \"en\": \"grammar book\"}",
        "author": "{\"vi\": \"Nguyễn Văn A\", \"en\": \"Nguyen Van A\"}",
        "is_free": 1,
        "priority": 1,
        "language": "vi",
        "level": "HSK4",
        "skill": "grammar",
        "is_open_app": 1
    }
]
```

#### Response

**Success Response:**
- **Code:** 201 Created
- **Content:**
```json
{
  "id": 123,
  "flag": "hsk4_grammar_book",
  "name": "{\"vi\": \"Ngữ pháp HSK 4\", \"en\": \"HSK 4 Grammar\"}",
  "cover_img_url": "https://domain.com/covers/hsk4_grammar.jpg",
  "type": "sách ngữ pháp",
  "is_free": 1,
  "priority": 1,
  "language": "vi",
  "created_at": "2024-08-11T10:30:00Z",
  "updated_at": "2024-08-11T10:30:00Z"
}
```

#### Error Responses

**Bad Request:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Xảy ra lỗi trong quá trình tạo mới ebook",
  "statusCode": 400
}
```

**Internal Server Error:**
- **Code:** 500 Internal Server Error
- **Content:**
```json
{
  "message": "Lỗi server",
  "statusCode": 500
}
```

#### Ví dụ sử dụng

```javascript
// FormData request
const formData = new FormData();
const jsonFile = new Blob([JSON.stringify(ebookData)], {
  type: 'application/json'
});
formData.append('ebookData', jsonFile, 'ebook.json');

fetch('/ebook', {
  method: 'POST',
  body: formData
});
```

---

### PUT `/ebook/:ebookId`

Cập nhật thông tin chi tiết của một ebook (Admin only).

**URL:** `/ebook/:ebookId`  
**Method:** `PUT`  
**Authentication:** Required (Super Key middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | Super Key token          |
| Content-Type  | string | Yes      | application/json         |

#### Path Parameters

| Parameter | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| ebookId   | string | Yes      | ID của ebook   |

#### Request Body

```json
{
  "cover_img_url": "https://domain.com/new-cover.jpg",
  "pdf_url": "https://domain.com/new-pdf.pdf", 
  "audio_url": "new-audio-data.json"
}
```

#### Request Body Fields

| Field         | Type   | Required | Description                |
|---------------|--------|----------|----------------------------|
| cover_img_url | string | No       | URL ảnh bìa mới            |
| pdf_url       | string | No       | URL file PDF mới           |
| audio_url     | string | No       | JSON string audio URLs mới |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
"Update successfully !!!"
```

**Unauthorized Response:**
- **Code:** 200 OK
- **Content:**
```json
null
```

#### Super Key Validation

- Chỉ cho phép update khi `key_use` match với `SUPPER_KEY[0].key_use`
- Trả về `null` nếu không có quyền

#### Ví dụ sử dụng

```javascript
// Request
PUT /ebook/123
Authorization: Bearer super-key-token
Content-Type: application/json

{
  "cover_img_url": "https://domain.com/new-cover.jpg",
  "pdf_url": "https://domain.com/new-pdf.pdf"
}

// Response
"Update successfully !!!"
```

---

### POST `/ebook/synchronize`

Đồng bộ dữ liệu ebook của người dùng (tiến độ, yêu thích, checkpoint).

**URL:** `/ebook/synchronize`  
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
  "synchronizedEbook": [
    {
      "ebook_id": 1,
      "progress": 75,
      "is_favourite": 1,
      "page_checkpoint": 120,
      "is_downloaded": 1
    },
    {
      "ebook_id": 2,
      "progress": 100,
      "is_favourite": 0,
      "page_checkpoint": 200,
      "is_downloaded": 0
    }
  ]
}
```

#### Request Body Fields

| Field             | Type  | Required | Description                      |
|-------------------|-------|----------|----------------------------------|
| synchronizedEbook | array | Yes      | Mảng các object sync ebook       |

#### SynchronizeEbookUserDto Fields

| Field           | Type   | Required | Default | Description                    |
|-----------------|--------|----------|---------|--------------------------------|
| ebook_id        | number | Yes      | -       | ID ebook cần sync              |
| progress        | number | Yes      | 0       | Tiến độ đọc (0-100)            |
| is_favourite    | enum   | No       | 0       | Yêu thích: 1=Yes, 0=No         |
| page_checkpoint | number | No       | -       | Trang đang đọc hiện tại        |
| is_downloaded   | enum   | No       | 0       | Đã tải: 1=Yes, 0=No            |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "user_id": 123,
  "favourites": [1, 3, 5],
  "content": [
    {
      "ebook_id": 1,
      "progress": 75,
      "is_favourite": 1,
      "page_checkpoint": 120,
      "is_downloaded": 1
    },
    {
      "ebook_id": 2,
      "progress": 100,
      "is_favourite": 0,
      "page_checkpoint": 200,
      "is_downloaded": 0
    }
  ]
}
```

#### Error Responses

**Bad Request:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Update Ebook for user failed.",
  "data": {}
}
```

#### Sync Logic

1. **Favourites Management:**
   - Add `ebook_id` to favourites if `is_favourite = 1`
   - Remove `ebook_id` from favourites if `is_favourite = 0`

2. **Content Update:**
   - Update existing content record if found
   - Create new content record if not found
   - Merge new data with existing data

3. **Database Operation:**
   - Update existing `ebooks_users` record if found
   - Create new `ebooks_users` record if not found

#### Ví dụ sử dụng

```javascript
// Request
POST /ebook/synchronize
Authorization: Bearer user-token
Content-Type: application/json

{
  "synchronizedEbook": [
    {
      "ebook_id": 1,
      "progress": 75,
      "is_favourite": 1,
      "page_checkpoint": 120,
      "is_downloaded": 1
    }
  ]
}

// Response
{
  "user_id": 123,
  "favourites": [1],
  "content": [...]
}
```

---

## Data Transfer Objects

### CreateEbookDto

DTO cho việc upload file ebook JSON.

```typescript
interface CreateEbookDto {
  ebookData: string; // Required - File upload (binary)
}
```

#### Fields

| Field     | Type   | Required | Description                 |
|-----------|--------|----------|-----------------------------|
| ebookData | string | Yes      | File JSON chứa data ebook   |

### PaginateEbookFilterDto

DTO cho việc lấy danh sách ebook với filter.

```typescript
interface PaginateEbookFilterDto {
  page: number;              // From PaginateDto
  limit: number;             // From PaginateDto  
  lang: string;              // Required - Ngôn ngữ
  filter: OptionEbookEnum;   // Optional - Filter option
  type: TypeEbookEnum;       // Optional - Loại sách
}
```

#### Fields

| Field  | Type            | Required | Default | Description                |
|--------|-----------------|----------|---------|----------------------------|
| page   | number          | No       | 1       | Số trang                   |
| limit  | number          | No       | 10      | Số lượng mỗi trang         |
| lang   | string          | Yes      | "vi"    | Ngôn ngữ: vi/en/cn         |
| filter | OptionEbookEnum | No       | "all"   | Filter theo trạng thái     |
| type   | TypeEbookEnum   | No       | "all"   | Filter theo loại sách      |

### SynchronizeEbookUserDto

DTO cho việc sync dữ liệu một ebook.

```typescript
interface SynchronizeEbookUserDto {
  ebook_id: number;                    // Required - ID ebook
  progress: number;                    // Required - Tiến độ đọc
  is_favourite?: BooleanEbookEnum;     // Optional - Yêu thích
  page_checkpoint?: number;            // Optional - Trang checkpoint
  is_downloaded?: BooleanEbookEnum;    // Optional - Đã tải
}
```

#### Validation Rules

- `ebook_id`: Phải là số nguyên, không được rỗng
- `progress`: Phải là số (0-100)
- `is_favourite`: Enum 0 hoặc 1
- `page_checkpoint`: Số nguyên dương
- `is_downloaded`: Enum 0 hoặc 1

### SynchronizeEbookUserArrayDto

DTO wrapper cho mảng sync ebook.

```typescript
interface SynchronizeEbookUserArrayDto {
  synchronizedEbook: SynchronizeEbookUserDto[]; // Required - Mảng sync data
}
```

#### Validation

- `@IsArray()`: Phải là mảng
- `@ValidateNested({ each: true })`: Validate từng phần tử
- `@Type(() => SynchronizeEbookUserDto)`: Transform type

### UpdateEbookDetail

DTO cho việc cập nhật thông tin ebook.

```typescript
interface UpdateEbookDetail {
  cover_img_url?: string; // Optional - URL ảnh bìa
  pdf_url?: string;       // Optional - URL file PDF
  audio_url?: string;     // Optional - URL audio
}
```

---

## Enums

### BooleanEbookEnum

Enum cho các giá trị boolean trong ebook.

```typescript
enum BooleanEbookEnum {
  TRUE = 1,   // Yes/True
  FALSE = 0   // No/False
}
```

#### Usage

- `is_favourite`: Ebook có trong danh sách yêu thích
- `is_downloaded`: Ebook đã được tải về thiết bị
- `is_free`: Ebook miễn phí hay trả phí

### OptionEbookEnum

Enum cho các filter option của ebook.

```typescript
enum OptionEbookEnum {
  DEFAULT = "all",           // Tất cả ebook
  IN_PROGRESS = "is_progress", // Ebook đang đọc
  FAVOURITE = "favourite",   // Ebook yêu thích
  NEWEST = "newest"          // Ebook mới nhất
}
```

### TypeEbookEnum

Enum cho các loại sách.

```typescript
enum TypeEbookEnum {
  DEFAULT = "all",
  GIAO_TRINH = "giáo trình",
  SACH_GIAI_TRI = "sách giải trí", 
  SACH_LUYEN_TAP = "sách luyện tập",
  SACH_LUYEN_THI = "sách luyện thi",
  SACH_NGU_PHAP = "sách ngữ pháp",
  SACH_TU_VUNG = "sách từ vựng",
  TIPS_BI_KIP = "tips/bí kíp"
}
```

---

## Database Schema

### ebooks Table

Lưu trữ thông tin chính của ebook.

```sql
CREATE TABLE ebooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flag VARCHAR(255) NOT NULL,
  name TEXT DEFAULT NULL,
  cover_img_url VARCHAR(255) DEFAULT NULL,
  pdf_url VARCHAR(255) DEFAULT NULL,
  audio_url TEXT DEFAULT NULL,
  type VARCHAR(255) NOT NULL,
  type_lang TEXT DEFAULT NULL,
  author VARCHAR(255) DEFAULT NULL,
  is_free TINYINT DEFAULT 0,
  priority INT NOT NULL,
  language VARCHAR(255) NOT NULL,
  level VARCHAR(255) DEFAULT NULL,
  skill VARCHAR(255) DEFAULT NULL,
  is_open_app TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CHECK (flag REGEXP '^[A-Za-z0-9_]+$')
);

-- Indexes
CREATE INDEX idx_flag ON ebooks(flag);
CREATE INDEX idx_language ON ebooks(language);
CREATE INDEX idx_type ON ebooks(type);
```

#### Table Fields

| Column        | Type         | Null | Description                    |
|---------------|--------------|------|--------------------------------|
| id            | INT          | No   | Primary key                    |
| flag          | VARCHAR(255) | No   | Mã định danh unique            |
| name          | TEXT         | Yes  | Tên sách (JSON đa ngôn ngữ)    |
| cover_img_url | VARCHAR(255) | Yes  | URL ảnh bìa                    |
| pdf_url       | VARCHAR(255) | Yes  | URL file PDF                   |
| audio_url     | TEXT         | Yes  | JSON array audio URLs          |
| type          | VARCHAR(255) | No   | Loại sách                      |
| type_lang     | TEXT         | Yes  | Loại sách đa ngôn ngữ (JSON)   |
| author        | VARCHAR(255) | Yes  | Tác giả đa ngôn ngữ (JSON)     |
| is_free       | TINYINT      | Yes  | Miễn phí: 1=Yes, 0=No          |
| priority      | INT          | No   | Thứ tự ưu tiên                 |
| language      | VARCHAR(255) | No   | Ngôn ngữ chính                 |
| level         | VARCHAR(255) | Yes  | Cấp độ HSK                     |
| skill         | VARCHAR(255) | Yes  | Kỹ năng (grammar, vocabulary)   |
| is_open_app   | TINYINT      | Yes  | Hiển thị trong app: 1=Yes, 0=No |

### ebooks_users Table

Lưu trữ dữ liệu cá nhân hóa của người dùng.

```sql
CREATE TABLE ebooks_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  favourites TEXT DEFAULT NULL,
  content TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_id ON ebooks_users(user_id);
```

#### Table Fields

| Column     | Type      | Description                              |
|------------|-----------|------------------------------------------|
| id         | INT       | Primary key                              |
| user_id    | INT       | Foreign key to users table               |
| favourites | TEXT      | JSON array của ebook IDs yêu thích       |
| content    | TEXT      | JSON array thông tin đọc từng ebook     |
| created_at | TIMESTAMP | Thời gian tạo                            |
| updated_at | TIMESTAMP | Thời gian cập nhật                       |

#### JSON Data Structure

**Favourites JSON:**
```json
[1, 3, 5, 7]
```

**Content JSON:**
```json
[
  {
    "ebook_id": 1,
    "progress": 75,
    "is_favourite": 1,
    "page_checkpoint": 120,
    "is_downloaded": 1
  },
  {
    "ebook_id": 2,
    "progress": 50,
    "is_favourite": 0,
    "page_checkpoint": 80,
    "is_downloaded": 0
  }
]
```

---

## Business Logic

### Multi-language Support

1. **Name Field:** JSON object với keys "vi", "en", "cn"
2. **Type Lang:** Loại sách được dịch ra nhiều ngôn ngữ
3. **Author:** Tên tác giả theo từng ngôn ngữ
4. **Language Filter:** Hiển thị ebook Chinese + ngôn ngữ user chọn

### Audio URL Sorting

```javascript
// Custom sorting algorithm for audio files
sortAudioUrls(audioArray) {
  return audioArray.sort((a, b) => {
    const getSortableKey = (url) => {
      const filename = url.split("/").pop().split(".")[0];
      return filename.split("_")
        .map(part => isNaN(part) ? part : part.padStart(3, '0'))
        .join("_");
    };
    
    const keyA = getSortableKey(a.url);
    const keyB = getSortableKey(b.url);
    
    return keyA.localeCompare(keyB, undefined, { numeric: true });
  });
}
```

### Progress Tracking

1. **Progress Calculation:** 0-100% dựa trên page đã đọc
2. **Checkpoint:** Lưu trang cuối cùng user đọc
3. **Completed Detection:** Progress = 100% được tính là hoàn thành
4. **In-Progress Detection:** Progress > 0 và < 100%

### Favourites Management

1. **Add to Favourites:** Push ebook_id vào array favourites
2. **Remove from Favourites:** Filter ra ebook_id khỏi array
3. **Duplicate Prevention:** Check exists trước khi add
4. **Sync Logic:** Merge favourites từ client với server

### Content Synchronization

```javascript
// Sync logic pseudocode
const syncContent = (existing, incoming) => {
  for (const item of incoming) {
    const existingIndex = existing.findIndex(e => e.ebook_id === item.ebook_id);
    
    if (existingIndex >= 0) {
      // Update existing record
      existing[existingIndex] = { ...existing[existingIndex], ...item };
    } else {
      // Add new record
      existing.push(item);
    }
  }
  
  return existing;
};
```

### Filter Implementation

- **All:** Lấy tất cả ebook có `is_open_app = 1`
- **Favourite:** Filter theo array favourites của user
- **In Progress:** Filter theo ebook có progress > 0 trong content
- **Type Filter:** Filter theo field `type` của ebook

---

## Authentication & Authorization

### Middleware Configuration

```typescript
// User authentication
consumer
  .apply(UserIdMiddleware)
  .forRoutes(
    { path: 'ebook', method: RequestMethod.GET },
    { path: 'ebook/synchronize', method: RequestMethod.POST }
  );

// Admin authentication  
consumer
  .apply(SupperKeyMiddleware)
  .forRoutes(
    { path: 'ebook', method: RequestMethod.DELETE },
    { path: 'ebook/:ebookId', method: RequestMethod.PUT }
  );
```

### Access Control

- **GET /ebook:** User access - personal data included
- **POST /ebook/synchronize:** User access - personal data only
- **POST /ebook:** Public - file upload endpoint
- **PUT /ebook/:ebookId:** Admin only - super key required
- **DELETE /ebook:** Admin only - super key required (hidden endpoint)

### Data Security

- **User Isolation:** Mỗi user chỉ thấy dữ liệu cá nhân của mình
- **Admin Operations:** Chỉ super key mới thực hiện được admin operations
- **File Upload Security:** JSON file validation để tránh malicious uploads
- **Super Key Validation:** Strict validation cho admin endpoints

---

## Error Handling

### Common Error Scenarios

#### No Ebooks Found

```json
{
  "message": "Ebook is not found.",
  "statusCode": 404
}
```

**Causes:**
- User chưa có favourite nào khi filter by favourite
- User chưa có ebook in-progress khi filter by in-progress  
- Không có ebook nào match với type filter
- Database không có ebook nào active

#### Invalid Filter Parameters

```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Causes:**
- `lang` parameter missing hoặc invalid
- `filter` không thuộc OptionEbookEnum
- `type` không thuộc TypeEbookEnum
- `page` hoặc `limit` không phải số

#### Synchronization Errors

```json
{
  "message": "Update Ebook for user failed.",
  "data": {}
}
```

**Causes:**
- Invalid ebook_id trong sync data
- JSON parsing errors trong favourites/content
- Database connection issues
- Constraint violations

#### Admin Access Denied

```json
null
```

**Causes:**
- Super key không match với configured key
- Missing super key trong request
- Invalid super key format

### Error Recovery Strategies

1. **Graceful Degradation:** Return empty arrays thay vì errors khi không có data
2. **Data Validation:** Validate tất cả input parameters trước khi process
3. **JSON Safety:** Safely parse JSON với try-catch
4. **Database Rollback:** Transaction rollback cho sync operations
5. **Fallback Values:** Default values cho missing optional fields

---

## Performance Considerations

### Database Optimization

1. **Indexing Strategy:**
   - `idx_flag` cho lookup nhanh theo flag
   - `idx_language` cho filter theo ngôn ngữ
   - `idx_user_id` cho user-specific queries
   - `idx_type` cho filter theo loại sách

2. **Query Optimization:**
   - Limit + Offset pagination
   - Selective column fetching
   - JSON field parsing chỉ khi cần thiết

3. **Caching Opportunities:**
   - Cache ebook metadata (rarely changes)
   - Cache user preferences (favourites)
   - Cache computed aggregations (progress counts)

### Memory Management

1. **JSON Parsing:** Parse JSON fields chỉ khi cần thiết
2. **Audio Sorting:** Lazy loading và sort chỉ khi request
3. **Batch Processing:** Process sync data theo chunks
4. **Memory Cleanup:** Proper cleanup sau mỗi request

### Network Optimization

1. **Pagination:** Implement proper pagination để tránh large responses
2. **Compression:** Response compression cho JSON data
3. **CDN Integration:** Static assets (covers, PDFs, audio) serve từ CDN
4. **Lazy Loading:** Load audio URLs chỉ khi user click play

---

## API Usage Examples

### Complete Workflow Example

```javascript
// 1. Get user's ebook library
const getLibrary = async () => {
  const response = await fetch('/ebook?page=1&limit=20&lang=vi&filter=all&type=all', {
    headers: {
      'Authorization': 'Bearer user-token'
    }
  });
  
  const data = await response.json();
  console.log(`Found ${data.ebooks.length} ebooks`);
  console.log(`Progress: ${data.progress}, Completed: ${data.completed}`);
  
  return data;
};

// 2. User reads and makes progress
const updateProgress = async (ebookId, progress, pageCheckpoint) => {
  const syncData = {
    synchronizedEbook: [{
      ebook_id: ebookId,
      progress: progress,
      page_checkpoint: pageCheckpoint,
      is_favourite: 0,
      is_downloaded: 1
    }]
  };
  
  const response = await fetch('/ebook/synchronize', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer user-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(syncData)
  });
  
  return response.json();
};

// 3. Add to favourites
const addToFavourites = async (ebookId) => {
  const syncData = {
    synchronizedEbook: [{
      ebook_id: ebookId,
      progress: 0, // Keep existing progress
      is_favourite: 1
    }]
  };
  
  return fetch('/ebook/synchronize', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer user-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(syncData)
  });
};

// 4. Get favourites only
const getFavourites = async () => {
  return fetch('/ebook?page=1&limit=50&lang=vi&filter=favourite', {
    headers: {
      'Authorization': 'Bearer user-token'
    }
  });
};

// 5. Complete workflow
const completeWorkflow = async () => {
  try {
    // Get initial library
    const library = await getLibrary();
    
    // Simulate reading first ebook
    const firstEbook = library.ebooks[0];
    await updateProgress(firstEbook.id, 50, 100);
    
    // Add to favourites
    await addToFavourites(firstEbook.id);
    
    // Get updated favourites
    const favourites = await getFavourites();
    console.log('Favourites updated:', favourites);
    
  } catch (error) {
    console.error('Workflow error:', error);
  }
};
```

### Admin Operations Example

```javascript
// Upload new ebook
const uploadEbook = async (ebookData) => {
  const formData = new FormData();
  const jsonBlob = new Blob([JSON.stringify(ebookData)], {
    type: 'application/json'
  });
  formData.append('ebookData', jsonBlob, 'ebook.json');
  
  return fetch('/ebook', {
    method: 'POST',
    body: formData
  });
};

// Update ebook details
const updateEbook = async (ebookId, updates) => {
  return fetch(`/ebook/${ebookId}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer super-key-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
};

// Admin workflow
const adminWorkflow = async () => {
  const newEbook = {
    flag: 'hsk5_vocab_book',
    name: JSON.stringify({
      vi: 'Từ vựng HSK 5',
      en: 'HSK 5 Vocabulary',
      cn: 'HSK五级词汇'
    }),
    type: 'sách từ vựng',
    language: 'cn',
    is_free: 1,
    priority: 5
  };
  
  // Upload new ebook
  const uploaded = await uploadEbook(newEbook);
  console.log('Uploaded:', uploaded);
  
  // Update with media URLs
  const updates = {
    cover_img_url: 'https://cdn.example.com/covers/hsk5_vocab.jpg',
    pdf_url: 'https://cdn.example.com/pdfs/hsk5_vocab.pdf',
    audio_url: JSON.stringify([
      { url: 'audio1.mp3', title: 'Chapter 1' },
      { url: 'audio2.mp3', title: 'Chapter 2' }
    ])
  };
  
  const updated = await updateEbook(uploaded.id, updates);
  console.log('Updated:', updated);
};
```

---

## Best Practices

### Client-Side Implementation

1. **Offline Support:**
   - Cache ebook metadata locally
   - Store reading progress offline
   - Sync when online

2. **Performance:**
   - Implement virtual scrolling cho large lists
   - Lazy load audio files
   - Progressive image loading cho covers

3. **User Experience:**
   - Show loading states during sync
   - Provide feedback cho progress updates
   - Handle network errors gracefully

### Server-Side Best Practices

1. **Data Integrity:**
   - Validate JSON structures
   - Sanitize file uploads
   - Implement data constraints

2. **Security:**
   - Rate limiting cho sync endpoints
   - File type validation
   - Input sanitization

3. **Monitoring:**
   - Log sync operations
   - Monitor query performance
   - Track user engagement metrics
