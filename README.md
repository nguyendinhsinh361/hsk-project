# Migii HSK Docs

## Tổng quan

Hệ thống API quản lý Super Password Key cho ứng dụng Migii HSK, sử dụng NestJS framework với TypeORM để quản lý cơ sở dữ liệu.

## API Endpoints

### 1. System Information

#### GET `/system/info`
Lấy thông tin thời gian hiện tại của hệ thống.

**Response:**
```json
{
  "time": 1691749200000
}
```

### 1.1. Super Password Key Management

#### GET `/system/supper-key`
Tạo và lấy Super Password Key mới.

**Headers:**
- Yêu cầu middleware authentication với Super Key
- Rate limiting được áp dụng

**Query Parameters:**
- Sử dụng decorators `@GetSupperKey()` và `@GetSuperKeyName()` để lấy thông tin

**Response:**
```json
{
  "superKey": "ABC123EUP"
}
```

## Cấu trúc Database

### Table: `supper_key` (Database: `admin_hsk`)

| Cột | Kiểu dữ liệu | Mô tả |
|-----|-------------|--------|
| `id` | int (Auto increment) | Primary key |
| `super_pass` | varchar(255) | Mật khẩu super được tạo |
| `key_use` | varchar(255) | Mục đích sử dụng key |
| `key_name` | varchar(255) | Tên của key |
| `created_at` | timestamp | Thời gian tạo |
| `updated_at` | timestamp | Thời gian cập nhật |

## Data Transfer Objects (DTOs)

### 1.2. SupperPasswordKeyDto
```typescript
{
  superPass: string;  // Required - Mật khẩu super
  keyUse: string;     // Required - Mục đích sử dụng
  keyName: string;    // Required - Tên key
}
```

## Thuật toán tạo Super Password

Super Password được tạo theo công thức:
1. Lấy thời gian hiện tại và reset phút, giây, mili giây về 0
2. Áp dụng công thức: `Math.floor((timestamp) / (73^2) * (37^2) * (55^3))`
3. Chuyển đổi sang hệ 16 và thêm suffix "EUP"
4. Chuyển thành chữ hoa

**Ví dụ:** `ABC123EUP`

## Middleware

- **LimitedRequestsMiddleware**: Giới hạn số lượng request
- **SupperKeyMiddleware**: Xác thực Super Key