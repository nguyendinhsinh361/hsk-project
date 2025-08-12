# Purchase API Documentation

## Tổng quan

API quản lý hệ thống thanh toán cho ứng dụng Migii HSK, bao gồm xác thực giao dịch Google Play/App Store, thanh toán ngân hàng và quản lý gói Premium/MiA. Hệ thống hỗ trợ affiliate tracking và multiple payment methods.

## Mục lục

- [Purchase Management](#purchase-management)
  - [POST /purchase/verifiedGoogleStore](#post-purchaseverifiedgooglestore)
  - [POST /purchase/verifiedAppleStore](#post-purchaseverifiedapplestore)
  - [POST /purchase/affiliateOrder](#post-purchaseaffiliateorder)
  - [POST /purchase/bankingActive](#post-purchasebankingactive)
  - [POST /purchase/virtualBill](#post-purchasevirtualbill)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Business Logic](#business-logic)

---

## Purchase Management

### POST `/purchase/verifiedGoogleStore`

Xác thực và kích hoạt gói Premium/MiA từ Google Play Store.

**URL:** `/purchase/verifiedGoogleStore`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "subscriptionId": "migii_hsk_3months_auto",
  "token": "google_play_purchase_token",
  "device_id": "device_unique_id",
  "device": "Samsung Galaxy S21",
  "platforms_version": "Android 12",
  "app_version": "2.1.0",
  "affiliate": {
    "code": "AFF123",
    "package_key": "PKG456",
    "discount": 10
  }
}
```

#### Request Body Fields

| Field             | Type   | Required | Description                    |
|-------------------|--------|----------|--------------------------------|
| subscriptionId    | string | Yes      | Google Play product ID         |
| token             | string | Yes      | Purchase token từ Google Play  |
| device_id         | string | Yes      | ID duy nhất của thiết bị       |
| device            | string | Yes      | Tên thiết bị                   |
| platforms_version | string | Yes      | Phiên bản hệ điều hành         |
| app_version       | string | Yes      | Phiên bản app                  |
| affiliate         | object | No       | Thông tin affiliate            |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "premium": {
    "purchase_date": 1691749200000,
    "time_expired": 1699525200000,
    "product_id": "pre3months"
  }
}
```

**Error Responses:**
- **Code:** 401 Unauthorized - "Not authorized"
- **Code:** 402 Payment Required - "paymentState"
- **Code:** 409 Conflict - "Token has been synchronized"
- **Code:** 400 Bad Request - "Verify failed"

---

### POST `/purchase/verifiedAppleStore`

Xác thực và kích hoạt gói Premium/MiA từ App Store.

**URL:** `/purchase/verifiedAppleStore`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "receipt": "app_store_receipt_data",
  "type": "production",
  "device_id": "device_unique_id",
  "device": "iPhone 14 Pro",
  "platforms_version": "iOS 16.0",
  "app_version": "2.1.0",
  "affiliate": {
    "code": "AFF123",
    "package_key": "PKG456",
    "discount": 10
  }
}
```

#### Request Body Fields

| Field             | Type   | Required | Default      | Description                    |
|-------------------|--------|----------|--------------|--------------------------------|
| receipt           | string | Yes      | -            | App Store receipt data         |
| type              | string | No       | "production" | "sandbox" hoặc "production"    |
| device_id         | string | Yes      | -            | ID duy nhất của thiết bị       |
| device            | string | Yes      | -            | Tên thiết bị                   |
| platforms_version | string | Yes      | -            | Phiên bản iOS                  |
| app_version       | string | Yes      | -            | Phiên bản app                  |
| affiliate         | object | No       | -            | Thông tin affiliate            |

#### Response

**Success Response:**
- **Code:** 200 OK
```json
{
  "premium": {
    "purchase_date": 1691749200000,
    "time_expired": 1699525200000,
    "product_id": "pre3months"
  }
}
```

---

### POST `/purchase/affiliateOrder`

Lấy danh sách đơn hàng affiliate trong khoảng thời gian (Internal API).

**URL:** `/purchase/affiliateOrder`  
**Method:** `POST`  
**Authentication:** None (key-based)  

#### Request Body

```json
{
  "key_project": "migii-hsk-affiliate",
  "start_time": 1691749200000,
  "end_time": 1699525200000
}
```

#### Response

```json
{
  "orders": [
    {
      "user_id": 123,
      "package": "migii_hsk_3months_auto",
      "order_date_ms": 1691749200000,
      "code": "AFF123",
      "package_key": "PKG456",
      "discount": 10,
      "payment_platform": "google",
      "user_platform": "android",
      "email": "user@example.com",
      "user_name": "Nguyễn Văn A",
      "language": "vi",
      "country": "VN",
      "price_sale": 156000
    }
  ]
}
```

---

### POST `/purchase/bankingActive`

Kích hoạt Premium qua chuyển khoản ngân hàng (ACB webhook).

**URL:** `/purchase/bankingActive`  
**Method:** `POST`  
**Authentication:** Required (Banking Active Key middleware)  

#### Request Body

```json
{
  "virtual_bill": {
    "id": "jwt_token_virtual_bill",
    "user_id": "123",
    "product_id": "migii_hsk_3months_auto",
    "price": "156000",
    "currency": "VND",
    "transaction_code": "MHSK_20240811_001",
    "project_id": "MHSK",
    "affiliate": {
      "affiliate_code": "AFF123",
      "affiliate_package_key": "PKG456",
      "affiliate_discount": "10"
    }
  },
  "transaction": {
    "transactionStatus": "SUCCESS",
    "transactionChannel": "TRANSFER",
    "transactionCode": "ACB_TXN_123",
    "accountNumber": "123456789",
    "transactionDate": "2024-08-11T10:30:00Z",
    "effectiveDate": "2024-08-11T10:30:00Z",
    "debitOrCredit": "CREDIT",
    "amount": 156000,
    "transactionContent": "MHSK_20240811_001",
    "transactionEntityAttribute": {
      "receiverBankName": "ACB",
      "issuerBankName": "MB",
      "remitterName": "NGUYEN VAN A",
      "remitterAccountNumber": "987654321"
    }
  }
}
```

#### Response

```json
{
  "message": "Create new purchase by banking active successfully!",
  "data": {
    "id": 456,
    "idUser": 123,
    "productId": "pre3months",
    "purchaseDate": 1691749200000,
    "timeExpired": 1699525200000,
    "priceSale": 156000
  }
}
```

#### Error Responses
- **Code:** 400 Bad Request - "Đơn đã được thanh toán" / "Đơn không hợp lệ"

---

### POST `/purchase/virtualBill`

Tạo đơn ảo cho thanh toán chuyển khoản.

**URL:** `/purchase/virtualBill`  
**Method:** `POST`  
**Authentication:** Required  

#### Request Body

```json
{
  "product_id": "migii_hsk_3months_auto",
  "price": 156000,
  "affiliate": {
    "affiliate_code": "AFF123",
    "affiliate_package_key": "PKG456",
    "affiliate_discount": "10"
  }
}
```

#### Response

```json
{
  "id": "jwt_token_virtual_bill",
  "user_id": "123",
  "product_id": "migii_hsk_3months_auto",
  "price": "156000",
  "currency": "VND",
  "transaction_code": "MHSK_20240811_001",
  "project_id": "MHSK",
  "qrcode_url": "https://payments.eup.ai/qr/MHSK_20240811_001"
}
```

---

## Data Transfer Objects

### VerifyGoogle

```typescript
interface VerifyGoogle {
  subscriptionId: string;    // Required - Google Play product ID
  token: string;            // Required - Purchase token
  device_id: string;        // Required - Device ID
  device: string;           // Required - Device name
  platforms_version: string; // Required - OS version
  app_version: string;      // Required - App version
  affiliate?: Affiliate;    // Optional - Affiliate info
}
```

### VerifyIos

```typescript
interface VerifyIos {
  receipt: string;          // Required - App Store receipt
  type?: string;            // Optional - "sandbox"/"production"
  device_id: string;        // Required - Device ID
  device: string;           // Required - Device name
  platforms_version: string; // Required - iOS version
  app_version: string;      // Required - App version
  affiliate?: Affiliate;    // Optional - Affiliate info
}
```

### BankingActiceDataDto

```typescript
interface BankingActiceDataDto {
  virtual_bill: VirtualBillDto;    // Required - Virtual bill info
  transaction: TransactionDto;     // Required - Bank transaction info
}
```

### CreateVirtualBillDto

```typescript
interface CreateVirtualBillDto {
  product_id: string;       // Required - Product ID
  price: number;           // Required - Price in VND
  affiliate: AffiliateDto; // Required - Affiliate info
}
```

---

## Enums

### MigiiHSKProductIdEnum

```typescript
enum MigiiHSKProductIdEnum {
  MIGII_HSK_1MONTH = "pre1months",
  MIGII_HSK_3MONTHS = "pre3months",
  MIGII_HSK_6MONTHS = "pre6months",
  MIGII_HSK_12MONTHS = "pre12months",
  MIGII_HSK_LIFETIME = "preforevermonths",
  MIGII_HSK_MIA_LIFETIME = "migii_hsk_mia_lifetime",
  MIGII_HSK_MIA_12MONTHS = "migii_hsk_mia_12months",
  MIGII_HSK_MIA_3MONTHS = "migii_hsk_mia_3months",
  MIGII_HSK_MIA_1MONTH = "migii_hsk_mia_1months",
  MIGII_HSK_MIA_TOKEN = "migii_hsk_mia_token"
}
```

### ProductTypeEnum

```typescript
enum ProductTypeEnum {
  PRODUCT_TYPE_STANDARD = 1,  // Premium subscription
  PRODUCT_TYPE_MIA = 2        // MiA AI scoring
}
```

---

## Business Logic

### Product Mapping

**Premium Packages:**
- **1 Month:** 2.68M ms (31 days)
- **3 Months:** 8.03M ms (93 days)
- **6 Months:** 15.81M ms (183 days)
- **12 Months:** 31.62M ms (366 days)
- **Lifetime:** 3.15T ms (~100 years)

**MiA Packages:**
- **Token:** 200 MiA credits
- **1 Month:** 250 MiA credits
- **3 Months:** 250 MiA credits
- **12 Months:** 300 MiA credits
- **Lifetime:** 400 MiA credits

### Payment Flow

#### In-App Purchase (Google/Apple)
1. **Client** purchases in app store
2. **App** sends receipt to API
3. **API** verifies with store
4. **API** creates purchase record
5. **User** gets Premium/MiA access

#### Banking Transfer
1. **User** requests virtual bill
2. **API** creates virtual bill
3. **User** transfers money
4. **Bank** sends webhook
5. **API** verifies and activates

### Time Extension Logic

```javascript
// Existing premium time is preserved
const remainingTime = existingExpiry > currentTime ? 
  existingExpiry - currentTime : 0;

const newExpiry = currentTime + packageDuration + remainingTime;
```

### Affiliate System

- **Code tracking** for referral attribution
- **Package key** for specific offers
- **Discount percentage** for commission calculation
- **Platform detection** for analytics

### Error Handling

- **Duplicate prevention** via transaction_id
- **Store verification** với retry logic
- **Price validation** với tolerance
- **Telegram notifications** cho admin monitoring
