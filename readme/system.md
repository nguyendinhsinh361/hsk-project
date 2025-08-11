# System API Documentation

## Tổng quan

API hệ thống quản lý thông tin thời gian và Super Password Key cho ứng dụng Migii HSK, được xây dựng trên NestJS framework.

## Mục lục

- [System Information](#system-information)
  - [GET /system/info](#get-systeminfo)
  - [GET /system/supper-key](#get-systemsupper-key)
- [Data Transfer Objects](#data-transfer-objects)
- [Thuật toán tạo Super Password](#thuật-toán-tạo-super-password)

---

## System Information

### GET `/system/info`

Lấy thông tin thời gian hiện tại của hệ thống.

**URL:** `/system/info`  
**Method:** `GET`  
**Authentication:** None  

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "time": 1691749200000
}
```

#### Response Fields

| Field | Type   | Description              |
|-------|--------|--------------------------|
| time  | number | Unix timestamp hiện tại |

#### Ví dụ sử dụng

```javascript
// Request
GET /system/info

// Response
{
  "time": 1691749200000
}
```

---

### GET `/system/supper-key`

Tạo và lấy Super Password Key mới cho hệ thống.

**URL:** `/system/supper-key`  
**Method:** `GET`  
**Authentication:** Required (Super Key middleware)  

#### Headers

| Header        | Type   | Required | Description                    |
|---------------|--------|----------|--------------------------------|
| Authorization | string | Yes      | Super Key authentication token |

#### Query Parameters

- Sử dụng decorators `@GetSupperKey()` và `@GetSuperKeyName()` để lấy thông tin
- Các decorators này được xử lý tự động bởi middleware

#### Response

**Success Response:**
- **Code:** 200 OK
- **Content:**
```json
{
  "superKey": "ABC123EUP"
}
```

#### Response Fields

| Field    | Type   | Description           |
|----------|--------|-----------------------|
| superKey | string | Super Password Key mới được tạo |

#### Error Responses

**Authentication Error:**
- **Code:** 401 Unauthorized
- **Content:**
```json
{
  "message": "Unauthorized access",
  "error": "Authentication required"
}
```

**Rate Limit Error:**
- **Code:** 429 Too Many Requests
- **Content:**
```json
{
  "message": "Too many requests",
  "error": "Rate limit exceeded"
}
```

#### Rate Limiting

API này có áp dụng rate limiting để ngăn chặn việc tạo quá nhiều key trong thời gian ngắn.

#### Ví dụ sử dụng

```javascript
// Request
GET /system/supper-key
Authorization: Bearer your-super-key-token

// Response
{
  "superKey": "ABC123EUP"
}
```

---

## Data Transfer Objects

### SupperPasswordKeyDto

DTO cho việc tạo và quản lý Super Password Key.

```typescript
interface SupperPasswordKeyDto {
  superPass: string;  // Required - Mật khẩu super
  keyUse: string;     // Required - Mục đích sử dụng key
  keyName: string;    // Required - Tên định danh cho key
}
```

#### Fields

| Field     | Type   | Required | Description                |
|-----------|--------|----------|----------------------------|
| superPass | string | Yes      | Mật khẩu super của hệ thống |
| keyUse    | string | Yes      | Mục đích sử dụng key       |
| keyName   | string | Yes      | Tên định danh cho key      |

#### Validation Rules

- `superPass`: Không được để trống, phải là string hợp lệ
- `keyUse`: Không được để trống, mô tả mục đích sử dụng
- `keyName`: Không được để trống, tên duy nhất cho key

---

## Thuật toán tạo Super Password

Super Password Key được tạo theo thuật toán đảm bảo tính bảo mật cao.

### Các bước thực hiện:

1. **Lấy timestamp hiện tại:** 
   - Sử dụng `Date.now()` để lấy thời gian hiện tại
   - Reset phút, giây, mili giây về 0 để tạo key theo giờ

2. **Áp dụng công thức toán học:** 
   ```javascript
   const result = Math.floor((timestamp) / (73^2) * (37^2) * (55^3))
   ```

3. **Chuyển đổi số hệ:** 
   - Chuyển kết quả sang hệ số 16 (hexadecimal)
   - Sử dụng `.toString(16)`

4. **Thêm suffix:** 
   - Thêm chuỗi "EUP" vào cuối để nhận diện

5. **Format cuối:** 
   - Chuyển toàn bộ thành chữ hoa bằng `.toUpperCase()`

### Code Implementation

```javascript
function generateSuperPasswordKey() {
  // Bước 1: Lấy timestamp và reset về giờ
  const now = new Date();
  now.setMinutes(0, 0, 0); // Reset phút, giây, mili giây về 0
  const timestamp = now.getTime();
  
  // Bước 2: Áp dụng công thức
  const calculation = Math.floor((timestamp) / (73**2) * (37**2) * (55**3));
  
  // Bước 3: Chuyển sang hex
  const hexValue = calculation.toString(16);
  
  // Bước 4 & 5: Thêm suffix và chuyển hoa
  const superKey = (hexValue + 'EUP').toUpperCase();
  
  return superKey;
}
```

### Ví dụ:

```javascript
// Input: timestamp = 1691749200000 (sau khi reset về giờ)
// Calculation: Math.floor(1691749200000 / (73^2) * (37^2) * (55^3))
// Hex conversion: "ABC123"
// Add suffix: "ABC123EUP"
// Final result: "ABC123EUP"
```

**Kết quả mẫu:** `ABC123EUP`

### Đặc điểm bảo mật:

- **Time-based:** Key thay đổi theo giờ, tăng tính bảo mật
- **Phức tạp tính toán:** Thuật toán khó dự đoán từ bên ngoài  
- **Format nhất quán:** Luôn có suffix "EUP" để nhận diện
- **Uppercase:** Sử dụng chữ hoa để dễ đọc và nhập liệu
- **Deterministic:** Cùng một giờ sẽ tạo ra cùng một key

### Lưu ý sử dụng:

- Key có hiệu lực trong vòng 1 giờ
- Hệ thống tự động tạo key mới mỗi giờ
- Không thể sử dụng key cũ sau khi hết hiệu lực
- Key được cache trong memory để tăng performance