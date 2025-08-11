# Awards API Documentation

## Tổng quan

API quản lý hệ thống trao thưởng cho ứng dụng Migii HSK, bao gồm việc trao MiA (lượt chấm AI), Premium time và các phần thưởng sự kiện. Sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## Mục lục

- [Awards Management](#awards-management)
  - [POST /awards/custom-mia](#post-awardscustom-mia)
  - [POST /awards/trial-mia](#post-awardstrial-mia)
  - [POST /awards/get-time-trial](#post-awardsget-time-trial)
  - [POST /awards/award-test-online](#post-awardsaward-test-online)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)

---

## Awards Management

### POST `/awards/custom-mia`

Trao MiA và Premium time tùy chỉnh cho danh sách người dùng theo email (dành cho Admin).

**URL:** `/awards/custom-mia`  
**Method:** `POST`  
**Authentication:** Required (Support Admin middleware)  

#### Headers

| Header        | Type   | Required | Description                     |
|---------------|--------|----------|---------------------------------|
| Authorization | string | Yes      | Admin authentication token      |
| Content-Type  | string | Yes      | application/json                |

#### Query Parameters

| Parameter    | Type   | Required | Description                    |
|--------------|--------|----------|--------------------------------|
| eventName    | string | Yes      | Tên sự kiện (EventNameEnum)     |
| premiumTime  | string | Yes      | Số ngày Premium (string number) |
| miaTotal     | string | Yes      | Số lượt chấm AI (string number) |

#### Request Body

```json
{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

#### Request Body Fields

| Field  | Type     | Required | Description                        |
|--------|----------|----------|------------------------------------|
| emails | string[] | Yes      | Danh sách email người dùng nhận thưởng |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Create new purchase for custorm miA successfully!!!",
  "data": {}
}
```

#### Error Responses

**Authentication Error:**
- **Code:** 401 Unauthorized
- **Content:**
```json
{
  "message": "Lỗi xác thực tài khoản chưa đăng nhập",
  "data": {}
}
```

**Bad Request Error:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Create new purchase for custorm miA failed.",
  "data": {}
}
```

#### Ví dụ sử dụng

```javascript
// Request
POST /awards/custom-mia?eventName=TRIAL_EVENT&premiumTime=7&miaTotal=10
Authorization: Bearer admin-token
Content-Type: application/json

{
  "emails": ["user1@example.com", "user2@example.com"]
}

// Response
{
  "message": "Create new purchase for custorm miA successfully!!!",
  "data": {}
}
```

---

### POST `/awards/trial-mia`

Nhận gói dùng thử 3 ngày Premium + 3 lượt chấm AI (mỗi user chỉ được nhận 1 lần).

**URL:** `/awards/trial-mia`  
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
  "info": "user_trial_info_string"
}
```

#### Request Body Fields

| Field | Type   | Required | Description                      |
|-------|--------|----------|----------------------------------|
| info  | string | Yes      | Thông tin bổ sung từ người dùng   |

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Bạn đã nhận thành công lượt dùng thử.",
  "data": {
    "purchases": [
      {
        "id": 12345,
        "productId": "migii_hsk_mia_custom",
        "miaTotal": 3,
        "timeExpired": 1691835600000,
        "active": 1
      }
    ]
  }
}
```

#### Error Responses

**Already Claimed Error:**
- **Code:** 409 Conflict
- **Content:**
```json
{
  "message": "Bạn chỉ được nhận lượt dùng thử 1 lần cho một tài khoản.",
  "data": {}
}
```

**Authentication Error:**
- **Code:** 401 Unauthorized
- **Content:**
```json
{
  "message": "Lỗi xác thực tài khoản chưa đăng nhập",
  "data": {}
}
```

**Bad Request Error:**
- **Code:** 400 Bad Request
- **Content:**
```json
{
  "message": "Xảy ra lỗi trong quá trình nhận.",
  "data": {}
}
```

#### Ví dụ sử dụng

```javascript
// Request
POST /awards/trial-mia
Authorization: Bearer user-token
Content-Type: application/json

{
  "info": "trial_request_20240811"
}

// Response
{
  "message": "Bạn đã nhận thành công lượt dùng thử.",
  "data": {
    "purchases": [...]
  }
}
```

#### Business Logic

- **Gói dùng thử:** 3 ngày Premium + 3 lượt chấm AI
- **Giới hạn:** Mỗi tài khoản chỉ được nhận 1 lần
- **Key kiểm tra:** `TRIAL_MIA_3DAYS_3SCORING_HSK456_{user_id}_{email}`
- **Thời gian hiệu lực:** 3 ngày (259,200,000 milliseconds)

---

### POST `/awards/get-time-trial`

Lấy thông tin thời gian kích hoạt sự kiện dùng thử.

**URL:** `/awards/get-time-trial`  
**Method:** `POST`  
**Authentication:** None  

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Thành công",
  "data": {
    "timeStart": 1691749200000,
    "timeEnd": 1691835600000,
    "isActive": true
  }
}
```

#### Error Responses

**Conflict Error:**
- **Code:** 409 Conflict
- **Content:**
```json
{
  "message": "Tài khoản đã được nhận 3 ngày Premium + 3 Lượt chấm AI.",
  "data": {}
}
```

**Not Found Error:**
- **Code:** 404 Not Found
- **Content:**
```json
{
  "message": "Lỗi trong quá trình nhận quà tặng",
  "data": {}
}
```

#### Ví dụ sử dụng

```javascript
// Request
POST /awards/get-time-trial

// Response
{
  "message": "Thành công",
  "data": {
    "timeStart": 1691749200000,
    "timeEnd": 1691835600000,
    "isActive": true
  }
}
```

---

### POST `/awards/award-test-online`

Tự động trao giải cho sự kiện thi thử online (dành cho hệ thống).

**URL:** `/awards/award-test-online`  
**Method:** `POST`  
**Authentication:** Required  

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "message": "Awards Prize successfully !!!",
  "data": {}
}
```

#### Error Responses

**Not Found Error:**
- **Code:** 404 Not Found
- **Content:**
```json
{
  "message": "Không có sự kiện nào được kích hoạt.",
  "data": {}
}
```

**Internal Server Error:**
- **Code:** 500 Internal Server Error
- **Content:**
```json
{
  "message": "Lỗi trong quá trình trao giải.",
  "data": {}
}
```

#### Business Logic

**Cơ chế trao giải:**

| Hạng | HSK 4/5/6 MiA | Premium Days | Điều kiện      |
|-------|---------------|--------------|----------------|
| TOP 1 | 10 lượt       | 30 ngày      | Điểm ≥ 50      |
| TOP 2-3| 5 lượt       | 14 ngày      | Điểm ≥ 50      |
| TOP 4-20| 1 lượt      | 5 ngày       | Điểm ≥ 50      |

**Quy tắc:**
- Chỉ trao giải cho HSK level 4, 5, 6
- Điểm tối thiểu: 50 điểm
- User chỉ nhận giải cao nhất nếu tham gia nhiều level
- Top 20 mỗi level sẽ được ghi nhận vào bảng `event_prize`

#### Ví dụ sử dụng

```javascript
// Request
POST /awards/award-test-online
Authorization: Bearer system-token

// Response
{
  "message": "Awards Prize successfully !!!",
  "data": {}
}
```

---

## Data Transfer Objects

### AwardsMiADto

DTO cho việc trao MiA và Premium time tùy chỉnh.

```typescript
interface AwardsMiADto {
  eventName: EventNameEnum; // Required - Tên sự kiện
  premiumTime: string;      // Required - Số ngày Premium
  miaTotal: string;         // Required - Số lượt chấm AI
}
```

#### Fields

| Field       | Type            | Required | Default               | Description                    |
|-------------|-----------------|----------|-----------------------|--------------------------------|
| eventName   | EventNameEnum   | Yes      | EventNameEnum.TRIAL_EVENT | Loại sự kiện trao thưởng       |
| premiumTime | string          | Yes      | -                     | Số ngày Premium (dạng string)   |
| miaTotal    | string          | Yes      | -                     | Số lượt chấm AI (dạng string)   |

#### Validation Rules

- `eventName`: Phải thuộc enum EventNameEnum
- `premiumTime`: String number, giá trị > 0
- `miaTotal`: String number, giá trị ≥ 0

### UserCustomDto

DTO cho thông tin người dùng tùy chỉnh.

```typescript
interface UserCustomDto {
  info: string; // Required - Thông tin bổ sung
}
```

#### Fields

| Field | Type   | Required | Description                    |
|-------|--------|----------|--------------------------------|
| info  | string | Yes      | Thông tin bổ sung từ người dùng |

### ListUserCustomDto

DTO cho danh sách email người dùng.

```typescript
interface ListUserCustomDto {
  emails: string[]; // Required - Danh sách email
}
```

#### Fields

| Field  | Type     | Required | Description                        |
|--------|----------|----------|------------------------------------|
| emails | string[] | Yes      | Danh sách email người dùng nhận thưởng |

#### Validation Rules

- `emails`: Mảng không rỗng, mỗi phần tử phải là email hợp lệ

---

## Enums

### EventNameEnum

Enum định nghĩa các loại sự kiện.

```typescript
enum EventNameEnum {
  TRIAL_EVENT = "Sự kiện dùng thử",
  ONLINE_EVENT = "Thi thử online", 
  CUSTOM_ACTIVE = "Kích hoạt tài khoản công ty"
}
```

#### Values

| Value        | Description                  | Use Case                    |
|--------------|------------------------------|-----------------------------|
| TRIAL_EVENT  | "Sự kiện dùng thử"           | Gói dùng thử cho user mới    |
| ONLINE_EVENT | "Thi thử online"             | Trao giải sự kiện thi online |
| CUSTOM_ACTIVE| "Kích hoạt tài khoản công ty"| Kích hoạt tài khoản doanh nghiệp |

---

## Authentication & Authorization

### Middleware Usage

#### SupportAdminMiddleware
- **Áp dụng cho:** `/awards/custom-mia`
- **Mục đích:** Xác thực quyền admin/support
- **Headers:** Yêu cầu admin authentication token

#### UserIdMiddleware  
- **Áp dụng cho:** `/awards/trial-mia`
- **Mục đích:** Xác thực user và lấy user_id
- **Headers:** Yêu cầu user authentication token
- **Decorator:** `@UserId()` để inject user_id vào controller

### Route Configuration

```typescript
// Admin routes
consumer
  .apply(SupportAdminMiddleware)
  .forRoutes(
    { path: 'awards/custom-mia', method: RequestMethod.POST }
  );

// User routes  
consumer
  .apply(UserIdMiddleware)
  .forRoutes(
    { path: 'awards/trial-mia', method: RequestMethod.POST }
  );
```

---

## Error Handling

### Common Error Scenarios

#### Trial Already Claimed

```json
{
  "message": "Bạn chỉ được nhận lượt dùng thử 1 lần cho một tài khoản.",
  "data": {}
}
```

**Cause:** User đã nhận gói trial trước đó  
**Solution:** Kiểm tra bằng note pattern trong database

#### User Not Found

```json
{
  "message": "Create new purchase for custorm miA failed.",
  "data": {}
}
```

**Cause:** Email không tồn tại trong hệ thống  
**Solution:** Kiểm tra email trước khi trao thưởng

#### No Active Events

```json
{
  "message": "Không có sự kiện nào được kích hoạt.",
  "data": {}
}
```

**Cause:** Không có event online nào đang active  
**Solution:** Kích hoạt event trước khi chạy trao giải

### Error Monitoring

- **Sentry Integration:** Tất cả errors được log vào Sentry
- **Error Codes:** HTTP status codes chuẩn
- **User-friendly Messages:** Thông báo lỗi bằng tiếng Việt

### Retry Strategies

```javascript
// Example retry for award-test-online
async function awardTestOnlineWithRetry(maxRetries = 3) {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await awardTestOnline();
      return response;
    } catch (error) {
      if (error.status === 500 && retryCount < maxRetries - 1) {
        retryCount++;
        await delay(2000 * retryCount); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

---

## Database Operations

### Purchase Table Operations

**Create Custom MiA Purchase:**
```sql
INSERT INTO purchase (
  id_user, product_id, platforms, purchase_date, 
  time_expired, active, note, mia_total, 
  product_type, origin_mia_total
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

**Check Trial Status:**
```sql
SELECT * FROM purchase 
WHERE note LIKE 'TRIAL_MIA_3DAYS_3SCORING_HSK456_%' 
  AND id_user = ?
```

**Get Active Premium:**
```sql
SELECT purchase_date, time_expired, product_id, product_type 
FROM purchase 
WHERE id_user = ? AND active = 1 AND time_expired > ? 
ORDER BY time_expired DESC LIMIT 1
```

### Event Prize Operations

**Save Event Rankings:**
```sql
INSERT INTO event_prize (user_id, event_id, active, rank, level) 
VALUES (?, ?, ?, ?, ?)
```

**Get Event Rankings:**
```sql
SELECT * FROM event_online_ranking 
WHERE event_id = ? 
ORDER BY rank_index ASC 
LIMIT 20
```