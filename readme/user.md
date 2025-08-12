# User Account API Documentation

## Tổng quan

API quản lý tài khoản người dùng cho ứng dụng Migii HSK, bao gồm đăng ký, đăng nhập, xác thực OAuth (Apple/Google), quản lý thiết bị và token. Hệ thống hỗ trợ device limit management cho Premium users và super password authentication.

## Mục lục

- [Account Management](#account-management)
  - [POST /account/regiter](#post-accountregiter)
  - [POST /account/login](#post-accountlogin)
  - [POST /account/logout](#post-accountlogout)
  - [POST /account/initLogin](#post-accountinitlogin)
- [OAuth Authentication](#oauth-authentication)
  - [POST /account/loginWithApple](#post-accountloginwithapple)
  - [POST /account/loginWithGoogle](#post-accountloginwithgoogle)
- [Account Operations](#account-operations)
  - [POST /account/deleteAccount](#post-accountdeleteaccount)
  - [PUT /account/activeAccount/:userId](#put-accountactiveaccountuserid)
  - [PUT /account/updateUserInformation](#put-accountupdateuserinformation)
- [Device & Token Management](#device--token-management)
  - [POST /account/deleteDevice](#post-accountdeletedevice)
  - [DELETE /account/deleteToken](#delete-accountdeletetoken)
- [Data Transfer Objects](#data-transfer-objects)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)

---

## Account Management

### POST `/account/regiter`

Đăng ký tài khoản mới với email và password.

**URL:** `/account/regiter`  
**Method:** `POST`  
**Authentication:** None  

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A",
  "day_of_birth": 15,
  "month_of_birth": 8,
  "year_of_birth": 1990,
  "phone": "0987654321",
  "device_id": "unique_device_id",
  "device": "iPhone 14 Pro",
  "platforms": "ios",
  "platforms_version": "16.0",
  "app_version": "2.1.0"
}
```

#### Response

**Success Response:**
- **Code:** 201 Created
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "Nguyễn Văn A",
  "accessToken": "jwt_token_here",
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png",
  "premiums_extra": [],
  "premiums_mia": []
}
```

#### Error Responses
- **Code:** 403 Forbidden - "Email already exists"
- **Code:** 417 Expectation Failed - "An error occurred while saving the device"

---

### POST `/account/login`

Đăng nhập bằng email và password.

**URL:** `/account/login`  
**Method:** `POST`  
**Authentication:** None  

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123",
  "device_id": "unique_device_id",
  "device": "iPhone 14 Pro",
  "platforms": "ios",
  "platforms_version": "16.0",
  "app_version": "2.1.0"
}
```

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "Nguyễn Văn A",
  "accessToken": "jwt_token_here",
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png",
  "premiums_extra": [
    {
      "id": 456,
      "product_id": "pre3months",
      "time_expired": 1699525200000,
      "is_premium": true
    }
  ],
  "premiums_mia": []
}
```

#### Error Responses
- **Code:** 401 Unauthorized - "Incorrect account or password"
- **Code:** 406 Not Acceptable - "Your account has been locked"
- **Code:** 403 Forbidden - "DeviceLimitExceeded"

#### Special Authentication

**Super Password:** Admins có thể login bằng super password thay vì user password
```javascript
const currentSupperPass = await this.systemService.genSupperPassword();
const checkSupperPass = loginDto.password === currentSupperPass;
```

---

### POST `/account/logout`

Đăng xuất và deactivate device.

**URL:** `/account/logout`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "device_id": "unique_device_id"
}
```

#### Response

```json
{
  "message": "Successful logout"
}
```

---

### POST `/account/initLogin`

Khởi tạo session với token hiện có (auto-login).

**URL:** `/account/initLogin`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "device_id": "unique_device_id",
  "device": "iPhone 14 Pro", 
  "platforms": "ios",
  "platforms_version": "16.0",
  "app_version": "2.1.0"
}
```

#### Response

```json
{
  "id": 123,
  "email": "user@example.com",
  "accessToken": "jwt_token_here",
  "premiums_extra": [],
  "premiums_mia": []
}
```

---

## OAuth Authentication

### POST `/account/loginWithApple`

Đăng nhập/đăng ký bằng Apple ID.

**URL:** `/account/loginWithApple`  
**Method:** `POST`  
**Authentication:** None  

#### Request Body

```json
{
  "access_token": "apple_jwt_token",
  "name": "John Doe",
  "device_id": "unique_device_id",
  "device": "iPhone 14 Pro",
  "platforms_version": "16.0",
  "app_version": "2.1.0"
}
```

#### Apple ID Verification Process

1. **Decode JWT Header:** Extract `kid` (Key ID)
2. **Fetch Apple Public Keys:** From `https://appleid.apple.com/auth/keys`
3. **Verify JWT Signature:** Using RSA public key
4. **Extract User Info:** `sub` (user ID), `email`, `picture`

#### Response

**Existing User (200 OK):**
```json
{
  "id": 123,
  "email": "user@privaterelay.appleid.com",
  "accessToken": "jwt_token_here"
}
```

**New User (201 Created):**
```json
{
  "id": 124,
  "email": "user@privaterelay.appleid.com", 
  "is_premium": false,
  "premium": {}
}
```

---

### POST `/account/loginWithGoogle`

Đăng nhập/đăng ký bằng Google.

**URL:** `/account/loginWithGoogle`  
**Method:** `POST`  
**Authentication:** None  

#### Request Body

```json
{
  "id_token": "google_jwt_token",
  "name": "John Doe",
  "device_id": "unique_device_id",
  "device": "Samsung Galaxy S21",
  "platforms": "android",
  "platforms_version": "12.0",
  "app_version": "2.1.0"
}
```

#### Google Token Verification

```javascript
const url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + id_token;
const { data } = await this.accountService.getDataRequests(url);
// Extract: sub, email, picture
```

---

## Account Operations

### POST `/account/deleteAccount`

Vô hiệu hóa tài khoản (soft delete).

**URL:** `/account/deleteAccount`  
**Method:** `POST`  
**Authentication:** Required  

#### Response

```json
{
  "message": "Delete user success."
}
```

#### Business Logic

- Set `activate_flag = -1` (deactivated)
- Không xóa dữ liệu, chỉ vô hiệu hóa

---

### PUT `/account/activeAccount/:userId`

Kích hoạt lại tài khoản (Admin only).

**URL:** `/account/activeAccount/:userId`  
**Method:** `PUT`  
**Authentication:** None (Admin endpoint)  

#### Response

```json
{
  "message": "Active user success."
}
```

---

### PUT `/account/updateUserInformation`

Cập nhật thông tin cá nhân.

**URL:** `/account/updateUserInformation`  
**Method:** `PUT`  
**Authentication:** Required  

#### Request Body

```json
{
  "name": "Nguyễn Văn B",
  "day_of_birth": 20,
  "month_of_birth": 12,
  "year_of_birth": 1995,
  "sex": 1,
  "phone": "0123456789",
  "country": "vn"
}
```

#### Response

```json
{
  "message": "Successfull"
}
```

---

## Device & Token Management

### POST `/account/deleteDevice`

Deactivate tất cả devices của user.

**URL:** `/account/deleteDevice`  
**Method:** `POST`  
**Authentication:** Required  

#### Response

```json
{
  "message": "Successful logout"
}
```

---

### DELETE `/account/deleteToken`

Xóa tất cả tokens của user.

**URL:** `/account/deleteToken`  
**Method:** `DELETE`  
**Authentication:** Required  

#### Response

```json
{
  "message": "Remove all token from user successfully !!!"
}
```

---

## Data Transfer Objects

### RegiterDto

```typescript
interface RegiterDto {
  email: string;              // Required - Email address
  password: string;           // Required - Min 6 chars
  name: string;              // Required - Full name
  day_of_birth?: number;     // Optional - Day (1-31)
  month_of_birth?: number;   // Optional - Month (1-12)
  year_of_birth?: number;    // Optional - Year
  phone: string;             // Required - Phone number
  device_id: string;         // Required - Device ID
  device: string;            // Required - Device name
  platforms: string;         // Required - ios/android
  platforms_version: string; // Required - OS version
  app_version: string;       // Required - App version
}
```

### LoginDto

```typescript
interface LoginDto {
  email: string;             // Required - Email
  password: string;          // Required - Password
  device_id: string;         // Required - Device ID
  device: string;            // Required - Device name
  platforms: string;         // Required - Platform
  platforms_version: string; // Required - OS version
  app_version: string;       // Required - App version
}
```

### AccountDto

```typescript
class AccountDto {
  id: number;
  email: string;
  name: string;
  accessToken: string;
  phone: string;
  avatar: string;
  premiums_extra: any;      // Premium subscription info
  premiums_mia: any;        // MiA package info
  
  constructor(input: any) {
    // Auto-mapping from user entity
  }
}
```

---

## Business Logic

### Device Limit Management

#### Premium Users (3 Device Limit)
```javascript
const totalNewFormatTokenOfUser = await this.authService.findTotalNewFormatTokenOfUser(user.id);

if (purchase[0]?.is_premium && totalNewFormatTokenOfUser.length >= 3) {
  // Remove old format tokens
  const oldTokensOfUser = await this.authService.getAllOldTokenOfUser(user.id);
  for (const token of oldTokensOfUser) {
    await this.authService.removeToken(token.id);
  }
  
  // Check if current token is valid
  if (!checkTokenValid) {
    throw new HttpException('DeviceLimitExceeded', HttpStatus.FORBIDDEN);
  }
}
```

#### Token Management Strategy
- **New Format Tokens:** Limit to 3 for Premium users
- **Old Format Cleanup:** Auto-remove outdated tokens
- **Device Rotation:** Keep 2 most recent + current if valid

### Password Security

#### Bcrypt Implementation
```javascript
// Registration
newUser.password = await bcrypt.hash(input.password, saltRounds);
newUser.password = newUser.password.replace('$2b$10$', '$2y$10$');

// Login verification
const check = await bcrypt.compare(
  loginDto.password, 
  user.password.replace('$2y$10$', '$2b$10$')
);
```

#### Super Password Access
- **Admin backdoor:** System-generated daily password
- **Emergency access:** Override user password for support
- **Security:** Time-based rotation

### OAuth Integration

#### Apple ID Flow
1. **JWT Verification:** Validate Apple-signed token
2. **Public Key Retrieval:** Fetch current Apple public keys
3. **Signature Validation:** Verify token authenticity
4. **User Extraction:** Get user info from verified claims

#### Google OAuth Flow
1. **Token Validation:** Call Google tokeninfo endpoint
2. **User Info Extraction:** Parse response for user data
3. **Account Linking:** Match or create user account

### Account State Management

#### Activation Flags
- **activate_flag > 0:** Active account
- **activate_flag = 0:** Normal state
- **activate_flag < 0:** Deactivated/banned

#### Soft Delete Pattern
- **No data deletion:** Preserve user data
- **Flag-based deactivation:** Use activate_flag
- **Reactivation support:** Admin can restore accounts

### Multi-Platform Support

#### Device Information Tracking
- **Device fingerprinting:** device_id, device name
- **Platform detection:** iOS, Android
- **Version tracking:** OS version, app version
- **Emoji filtering:** Clean device names

#### Session Management
- **Token generation:** JWT with device binding
- **Multi-device sync:** Cross-device authentication
- **Session cleanup:** Remove stale sessions

---

## Error Handling

### Authentication Errors

#### Invalid Credentials
```json
{
  "message": "Incorrect account or password",
  "statusCode": 401
}
```

#### Account Locked
```json
{
  "message": "Your account has been locked",
  "statusCode": 406
}
```

#### Device Limit Exceeded
```json
{
  "message": "DeviceLimitExceeded",
  "statusCode": 403
}
```

### Registration Errors

#### Duplicate Email
```json
{
  "message": "Email already exists",
  "statusCode": 403
}
```

#### Device Save Failed
```json
{
  "message": "An error occurred while saving the device.",
  "statusCode": 417
}
```

### OAuth Errors

#### Apple Login Failed
```json
{
  "message": "Login err",
  "statusCode": 302
}
```

#### Invalid Token Format
- **Apple:** JWT verification failure
- **Google:** Invalid id_token

### Error Recovery

- **Sentry Monitoring:** All errors logged
- **Graceful Degradation:** Partial success handling  
- **Retry Logic:** Token generation retry
- **Fallback Mechanisms:** Default avatar, empty premium data
