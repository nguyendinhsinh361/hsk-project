# Divination API Documentation

## Tổng quan

API quản lý hệ thống xem bói/tử vi cho ứng dụng Migii HSK, bao gồm việc lưu trữ thông tin cá nhân người dùng và lịch sử xem quẻ. Hệ thống cho phép người dùng tạo profile bói toán và theo dõi các lần xem quẻ. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Divination Management](#divination-management)
  - [POST /divination](#post-divination)
  - [GET /divination](#get-divination)
  - [GET /divination/info-user](#get-divinationinfo-user)
  - [GET /divination/:divinationId](#get-divinationdivinationid)
  - [POST /divination/info-user](#post-divinationinfo-user)
- [Data Transfer Objects](#data-transfer-objects)
- [Database Schema](#database-schema)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)
- [Authentication](#authentication)

---

## Divination Management

### POST `/divination`

Tạo lịch sử xem quẻ mới cho người dùng.

**URL:** `/divination`  
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
  "infoUserId": 1,
  "divinationId": 1,
  "contentId": 5
}
```

#### Request Body Fields

| Field        | Type   | Required | Description                    |
|--------------|--------|----------|--------------------------------|
| infoUserId   | number | Yes      | ID thông tin người dùng bói toán |
| divinationId | number | Yes      | ID quẻ (1, 2, 3...)            |
| contentId    | number | Yes      | ID nội dung cụ thể của quẻ     |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "id": 123,
  "infoUserDivinationId": 1,
  "divinationId": 1,
  "contentId": 5,
  "createdAt": "2024-08-11T10:30:00Z",
  "updatedAt": "2024-08-11T10:30:00Z"
}
```

#### Error Responses

**Info User Not Found:**
- **Code:** 404 Not Found
- **Content:**
```json
{
  "message": "Info user not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Duplicate History:**
- **Code:** 409 Conflict
- **Content:**
```json
{
  "message": "Error create duplicate history data",
  "error": "Conflict",
  "statusCode": 409
}
```

**Bad Request:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Error create history data",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### Validation Rules

- `infoUserId` phải tồn tại và thuộc về user hiện tại
- Không được tạo duplicate `(infoUserId, divinationId, contentId)`
- Tất cả fields đều required và phải là số nguyên

#### Ví dụ sử dụng

```javascript
// Request
POST /divination
Authorization: Bearer user-token
Content-Type: application/json

{
  "infoUserId": 1,
  "divinationId": 1,
  "contentId": 5
}

// Response
{
  "id": 123,
  "infoUserDivinationId": 1,
  "divinationId": 1,
  "contentId": 5,
  "createdAt": "2024-08-11T10:30:00Z",
  "updatedAt": "2024-08-11T10:30:00Z"
}
```

---

### GET `/divination`

Lấy danh sách lịch sử xem quẻ của người dùng (grouped by divinationId).

**URL:** `/divination`  
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
[
  {
    "divinationId": 1,
    "userId": 123,
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990",
    "contentIds": "1,3,5",
    "createdAt": "2024-08-10T10:30:00Z"
  },
  {
    "divinationId": 2,
    "userId": 123,
    "username": "Nguyễn Văn A", 
    "birthday": "14/02/1990",
    "contentIds": "2,4",
    "createdAt": "2024-08-11T15:20:00Z"
  }
]
```

#### Response Fields

| Field        | Type   | Description                                |
|--------------|--------|--------------------------------------------|
| divinationId | number | ID quẻ đã xem                              |
| userId       | number | ID người dùng                              |
| username     | string | Tên người dùng (từ info profile)           |
| birthday     | string | Ngày sinh (format DD/MM/YYYY)              |
| contentIds   | string | Danh sách content IDs (phân cách bởi dấu phẩy) |
| createdAt    | string | Thời gian xem quẻ đầu tiên của divinationId này |

#### Query Logic

- **GROUP BY:** `divinationId`, `userId`, `username`, `birthday`
- **Aggregation:** `GROUP_CONCAT(contentId)` để gộp các content IDs
- **Order:** `createdAt ASC` (lần xem đầu tiên)
- **Join:** Inner join với `info_user_divination` table

#### Ví dụ sử dụng

```javascript
// Request
GET /divination
Authorization: Bearer user-token

// Response
[
  {
    "divinationId": 1,
    "userId": 123,
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990",
    "contentIds": "1,3,5",
    "createdAt": "2024-08-10T10:30:00Z"
  }
]
```

---

### GET `/divination/info-user`

Lấy thông tin profile bói toán mới nhất của người dùng.

**URL:** `/divination/info-user`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Response

**Success Response (có data):**
- **Code:** 200 OK
- **Content:**
```json
{
  "id": 5,
  "userId": 123,
  "username": "Nguyễn Văn A",
  "birthday": "14/02/1990",
  "createdAt": "2024-08-11T10:30:00Z",
  "updatedAt": "2024-08-11T10:30:00Z"
}
```

**Success Response (không có data):**
- **Code:** 200 OK
- **Content:**
```json
{}
```

#### Business Logic

- Lấy record mới nhất theo `ORDER BY id DESC`
- Nếu không tìm thấy, trả về object rỗng `{}`
- Chỉ lấy của user hiện tại

#### Ví dụ sử dụng

```javascript
// Request
GET /divination/info-user
Authorization: Bearer user-token

// Response (có data)
{
  "id": 5,
  "userId": 123,
  "username": "Nguyễn Văn A",
  "birthday": "14/02/1990",
  "createdAt": "2024-08-11T10:30:00Z",
  "updatedAt": "2024-08-11T10:30:00Z"
}

// Response (chưa có profile)
{}
```

---

### GET `/divination/:divinationId`

Lấy chi tiết lịch sử xem một quẻ cụ thể của người dùng.

**URL:** `/divination/:divinationId`  
**Method:** `GET`  
**Authentication:** Required (User ID middleware)  

#### Headers

| Header        | Type   | Required | Description              |
|---------------|--------|----------|--------------------------|
| Authorization | string | Yes      | User authentication token |

#### Path Parameters

| Parameter    | Type   | Required | Description    |
|--------------|--------|----------|----------------|
| divinationId | number | Yes      | ID quẻ cần xem |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
[
  {
    "divinationId": 1,
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990",
    "contentId": 5,
    "createdAt": "2024-08-11T15:30:00Z"
  },
  {
    "divinationId": 1,
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990", 
    "contentId": 3,
    "createdAt": "2024-08-11T10:30:00Z"
  }
]
```

#### Response Fields

| Field        | Type   | Description                     |
|--------------|--------|---------------------------------|
| divinationId | number | ID quẻ                          |
| username     | string | Tên người dùng                  |
| birthday     | string | Ngày sinh                       |
| contentId    | number | ID content cụ thể               |
| createdAt    | string | Thời gian xem content này       |

#### Query Logic

- **Filter:** `userId = current_user` AND `divinationId = param`
- **Order:** `createdAt DESC` (mới nhất trước)
- **Join:** Inner join với `info_user_divination`

#### Ví dụ sử dụng

```javascript
// Request
GET /divination/1
Authorization: Bearer user-token

// Response
[
  {
    "divinationId": 1,
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990",
    "contentId": 5,
    "createdAt": "2024-08-11T15:30:00Z"
  }
]
```

---

### POST `/divination/info-user`

Tạo profile thông tin bói toán cho người dùng.

**URL:** `/divination/info-user`  
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
  "username": "Nguyễn Văn A",
  "birthday": "14/02/1990"
}
```

#### Request Body Fields

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| username | string | Yes      | Họ tên đầy đủ                  |
| birthday | string | Yes      | Ngày sinh (format DD/MM/YYYY)  |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "id": 6,
  "userId": 123,
  "username": "Nguyễn Văn A",
  "birthday": "1990-01-14T00:00:00.000Z",
  "createdAt": "2024-08-11T10:30:00Z",
  "updatedAt": "2024-08-11T10:30:00Z"
}
```

#### Date Transformation

- **Input format:** `DD/MM/YYYY` (string)
- **Storage format:** JavaScript Date object
- **Transform logic:** `new Date(year, month - 1, day)`

#### Validation Rules

- `username`: Không được rỗng, phải là string
- `birthday`: Format DD/MM/YYYY, phải là ngày hợp lệ

#### Ví dụ sử dụng

```javascript
// Request
POST /divination/info-user
Authorization: Bearer user-token
Content-Type: application/json

{
  "username": "Nguyễn Văn A",
  "birthday": "14/02/1990"
}

// Response
{
  "id": 6,
  "userId": 123,
  "username": "Nguyễn Văn A",
  "birthday": "1990-01-14T00:00:00.000Z",
  "createdAt": "2024-08-11T10:30:00Z",
  "updatedAt": "2024-08-11T10:30:00Z"
}
```

---

## Data Transfer Objects

### CreateHistoryDivinationDto

DTO cho việc tạo lịch sử xem quẻ.

```typescript
interface CreateHistoryDivinationDto {
  infoUserId: number;   // Required - ID profile bói toán
  divinationId: number; // Required - ID quẻ (1, 2, 3...)
  contentId: number;    // Required - ID nội dung cụ thể
}
```

#### Fields

| Field        | Type   | Required | Description                    |
|--------------|--------|----------|--------------------------------|
| infoUserId   | number | Yes      | ID từ bảng `info_user_divination` |
| divinationId | number | Yes      | ID quẻ đại diện cho ngày trong tháng |
| contentId    | number | Yes      | ID nội dung chi tiết của quẻ   |

#### Validation Rules

- Tất cả fields phải là số nguyên (`@IsInt()`)
- Không được để trống (`@IsNotEmpty()`)
- `infoUserId` phải tồn tại và thuộc về user hiện tại
- Combination `(infoUserId, divinationId, contentId)` phải unique

### CreateInfoUserDto

DTO cho việc tạo profile bói toán.

```typescript
interface CreateInfoUserDto {
  username: string; // Required - Họ tên
  birthday: Date;   // Required - Ngày sinh (auto transform)
}
```

#### Fields

| Field    | Type   | Required | Description               |
|----------|--------|----------|---------------------------|
| username | string | Yes      | Họ tên đầy đủ của người dùng |
| birthday | Date   | Yes      | Ngày sinh (được transform)  |

#### Validation & Transform

- `username`: `@IsString()`, `@IsNotEmpty()`
- `birthday`: 
  - Input: `"DD/MM/YYYY"` string
  - Transform: `@Transform()` → JavaScript Date
  - Validation: `@IsDate()`

#### Transform Logic

```typescript
@Transform(({ value }) => {
  const [day, month, year] = value.split('/');
  return new Date(year, month - 1, day);
})
```

---

## Database Schema

### info_user_divination Table

Lưu trữ thông tin cá nhân để xem bói.

```sql
CREATE TABLE info_user_divination (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  birthday VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_id ON info_user_divination(user_id);
```

#### Table Fields

| Column     | Type         | Null | Description              |
|------------|--------------|------|--------------------------|
| id         | INT          | No   | Primary key              |
| user_id    | INT          | No   | Foreign key to users     |
| username   | VARCHAR(255) | No   | Họ tên cho bói toán      |
| birthday   | VARCHAR(255) | No   | Ngày sinh (stored as string) |
| created_at | TIMESTAMP    | No   | Thời gian tạo            |
| updated_at | TIMESTAMP    | No   | Thời gian cập nhật       |

### user_history_divination Table

Lưu trữ lịch sử xem quẻ.

```sql
CREATE TABLE user_history_divination (
  id INT AUTO_INCREMENT PRIMARY KEY,
  info_user_divination_id INT NOT NULL,
  divination_id INT NOT NULL,
  content_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (info_user_divination_id) REFERENCES info_user_divination(id),
  UNIQUE KEY unique_history (info_user_divination_id, divination_id, content_id)
);

-- Indexes
CREATE INDEX idx_info_user_divination_id ON user_history_divination(info_user_divination_id);
CREATE INDEX idx_divination_id ON user_history_divination(divination_id);
```

#### Table Fields

| Column                    | Type      | Null | Description                     |
|---------------------------|-----------|------|---------------------------------|
| id                        | INT       | No   | Primary key                     |
| info_user_divination_id   | INT       | No   | FK to info_user_divination      |
| divination_id             | INT       | No   | ID quẻ (ngày trong tháng)       |
| content_id                | INT       | No   | ID nội dung cụ thể              |
| created_at                | TIMESTAMP | No   | Thời gian xem                   |
| updated_at                | TIMESTAMP | No   | Thời gian cập nhật              |

#### Relationships

```typescript
// OneToOne relation in entity
@OneToOne(() => InfoUserDivination)
@JoinColumn({
  name: 'info_user_divination_id',
  referencedColumnName: 'id',
})
infoUserDivination: InfoUserDivination;
```

---

## Business Logic

### Profile Management

1. **Multiple Profiles:** User có thể tạo nhiều profile bói toán
2. **Latest Profile:** API luôn lấy profile mới nhất (`ORDER BY id DESC`)
3. **Required Info:** Cần có profile trước khi tạo history
4. **Date Storage:** Birthday được lưu dưới dạng string trong database

### History Tracking

1. **Unique Constraint:** Không được duplicate `(infoUserId, divinationId, contentId)`
2. **Divination Grouping:** History được group theo `divinationId`
3. **Content Aggregation:** Nhiều `contentId` được gộp lại bằng `GROUP_CONCAT`
4. **Chronological Order:** Lịch sử được sắp xếp theo thời gian

### Data Relationships

```
User (1) → (N) InfoUserDivination → (1) → (N) UserHistoryDivination
```

- Một user có nhiều profile bói toán
- Một profile có nhiều lịch sử xem quẻ
- Mỗi lần xem có `divinationId` (quẻ) và `contentId` (nội dung cụ thể)

### Validation Workflow

```
POST /divination:
1. Validate DTO
2. Check infoUserId exists & belongs to user
3. Check for duplicate history
4. Create new history record
```

```
POST /divination/info-user:
1. Validate DTO
2. Transform birthday string to Date
3. Create new profile with auto userId
```

---

## Error Handling

### Common Error Scenarios

#### Profile Not Found

```json
{
  "message": "Info user not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Cause:** `infoUserId` không tồn tại hoặc không thuộc về user  
**Solution:** Tạo profile trước hoặc sử dụng đúng `infoUserId`

#### Duplicate History

```json
{
  "message": "Error create duplicate history data",
  "error": "Conflict", 
  "statusCode": 409
}
```

**Cause:** Đã tồn tại `(infoUserId, divinationId, contentId)`  
**Solution:** Kiểm tra lịch sử trước khi tạo mới

#### Invalid Date Format

```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Cause:** Birthday không đúng format DD/MM/YYYY  
**Solution:** Sử dụng format DD/MM/YYYY cho birthday

### Error Handling Strategy

- **NotFoundException:** Khi không tìm thấy resource
- **ConflictException:** Khi vi phạm business rules
- **BadRequestException:** Khi validation failed hoặc general errors
- **Fallback:** Service trả về empty object `{}` thay vì null

---

## Authentication

### Middleware Configuration

```typescript
consumer
  .apply(UserIdMiddleware)
  .forRoutes(
    { path: 'divination', method: RequestMethod.GET },
    { path: 'divination/:divinationId', method: RequestMethod.GET },
    { path: 'divination', method: RequestMethod.POST },
    { path: 'divination/info-user', method: RequestMethod.GET },
    { path: 'divination/info-user', method: RequestMethod.POST },
  );
```

### Authentication Requirements

- **All endpoints:** Require valid JWT token
- **User extraction:** `@UserId()` decorator injects current user ID
- **Authorization:** Users can only access their own data
- **Security:** Automatic user_id filtering in all queries

### Route Protection

- **GET operations:** Read user's own data only
- **POST operations:** Create data linked to current user
- **No admin routes:** All operations are user-scoped
- **No public access:** All endpoints require authentication