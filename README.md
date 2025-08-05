# MIGII HSK API

Backend API service for the MIGII HSK application.

## 1. Getting Started

### 1.1. Prerequisites

- Node.js (v14+)
- MySQL
- Docker (optional)

### 1.2. Installation

```bash
# Install dependencies
$ npm install

# Development
$ npm run start:dev

# Production mode
$ npm run start:prod
```

### 1.3. Docker Setup

```bash
# Build and run with Docker Compose
$ docker-compose up -d
```

## 2. API Documentation

### 2.1. Authentication

Most API endpoints require authentication. Include the access token in the request header:

```
Authorization: Bearer {accessToken}
```

### 2.2. Common Response Format

All API responses follow a standard format:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

### 2.3. Error Handling

Error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## 3. API Endpoints

### 3.1. User API

#### 3.1.1. Register

Creates a new user account.

- **URL**: `/account/regiter`
- **Method**: `POST`
- **Authentication**: Not required

**Headers**:
- `Content-Type`: application/json

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "phone": "1234567890",
  "device_id": "device-uuid",
  "device": "Device Name",
  "platforms": "ios|android",
  "platforms_version": "14.0",
  "app_version": "1.0.0"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "accessToken": "jwt-token",
  "phone": "1234567890",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "country": null,
  "language": null,
  "sex": null,
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png",
  "premiums_extra": [],
  "devices": null,
  "premiums_mia": null
}
```

**Status Codes**:
- `201`: Account created successfully
- `400`: Invalid data
- `403`: Email already exists
- `417`: Device save error
- `500`: Server error

#### 3.1.2. Login

Authenticates a user and returns an access token.

- **URL**: `/account/login`
- **Method**: `POST`
- **Authentication**: Not required

**Headers**:
- `Content-Type`: application/json

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "device_id": "device-uuid",
  "device": "Device Name",
  "platforms": "ios|android",
  "platforms_version": "14.0",
  "app_version": "1.0.0"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "accessToken": "jwt-token",
  "phone": "1234567890",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "country": null,
  "language": null,
  "sex": null,
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png",
  "premiums_extra": [],
  "devices": null,
  "premiums_mia": []
}
```

**Status Codes**:
- `200`: Login successful
- `400`: Invalid data
- `401`: Incorrect account or password
- `403`: Device limit exceeded (premium accounts)
- `406`: Account locked
- `417`: Device save error
- `500`: Server error

#### 3.1.3. Login with Apple

Authenticates or creates a user account using Apple authentication.

- **URL**: `/account/loginWithApple`
- **Method**: `POST`
- **Authentication**: Not required

**Headers**:
- `Content-Type`: application/json

**Request Body**:
```json
{
  "access_token": "apple-id-token",
  "name": "User Name",
  "device_id": "device-uuid",
  "device": "Device Name",
  "platforms_version": "14.0",
  "platforms": "ios|android",
  "app_version": "1.0.0"
}
```

**Response**: 
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "accessToken": "jwt-token",
  "phone": "1234567890",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "country": null,
  "language": null,
  "sex": null,
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png",
  "premiums_extra": [],
  "devices": null,
  "premiums_mia": []
}
```

**Status Codes**:
- `200`: Login successful
- `400`: Invalid data
- `401`: Authentication failed
- `500`: Server error

#### 3.1.4. Login with Google

Authenticates or creates a user account using Google authentication.

- **URL**: `/account/loginWithGoogle`
- **Method**: `POST`
- **Authentication**: Not required

**Headers**:
- `Content-Type`: application/json

**Request Body**:
```json
{
  "access_token": "google-id-token",
  "name": "User Name",
  "device_id": "device-uuid",
  "device": "Device Name",
  "platforms_version": "14.0",
  "platforms": "ios|android",
  "app_version": "1.0.0"
}
```

**Response**: 
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "accessToken": "jwt-token",
  "phone": "1234567890",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "country": null,
  "language": null,
  "sex": null,
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png",
  "premiums_extra": [],
  "devices": null,
  "premiums_mia": []
}
```

**Status Codes**:
- `200`: Login successful
- `400`: Invalid data
- `401`: Authentication failed
- `500`: Server error

#### 3.1.5. Logout

Logs out a user by invalidating their token.

- **URL**: `/account/logout`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "device_id": "device-uuid"
}
```

**Response**: 
```json
{
  "message": "Logout successful"
}
```

**Status Codes**:
- `200`: Logout successful
- `401`: Authentication failed

#### 3.1.6. Delete Account

Deletes a user account.

- **URL**: `/account/delete`
- **Method**: `DELETE`
- **Authentication**: Required

**Headers**:
- `Authorization`: Bearer {accessToken}

**Response**: 
```json
{
  "message": "Account deleted successfully"
}
```

**Status Codes**:
- `200`: Account deleted successfully
- `401`: Authentication failed
- `500`: Server error

#### 3.1.7. Update User Information

Updates user profile information.

- **URL**: `/account/update`
- **Method**: `PUT`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "name": "Updated Name",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "phone": "1234567890",
  "country": "Vietnam",
  "language": "vi",
  "sex": 1
}
```

**Response**: 
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Updated Name",
  "phone": "1234567890",
  "day_of_birth": 1,
  "month_of_birth": 1,
  "year_of_birth": 1990,
  "country": "Vietnam",
  "language": "vi",
  "sex": 1,
  "avatar": "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png"
}
```

**Status Codes**:
- `200`: Information updated successfully
- `400`: Invalid data
- `401`: Authentication failed
- `500`: Server error

### 3.2. Auth API

#### 3.2.1. Authenticate

Authenticates a user with an access token.

- **URL**: `/auth`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "accessToken": "jwt-token"
}
```

**Response**:
```json
{
  "user_id": "user-id"
}
```

**Status Codes**:
- `200`: Authentication successful
- `401`: Authentication failed

### 3.3. System API

#### 3.3.1. Get System Information

Returns system time information.

- **URL**: `/system/info`
- **Method**: `GET`
- **Authentication**: Not required

**Response**:
```json
{
  "time": "current-server-time"
}
```

**Status Codes**:
- `200`: Success

#### 3.3.2. Get Super Key

Returns a super key for administrative operations.

- **URL**: `/system/supper-key`
- **Method**: `GET`
- **Authentication**: Required (with super key name)

**Headers**:
- `Authorization`: Bearer {accessToken}
- `x-super-key-name`: {superKeyName}

**Response**:
```json
{
  "key": "super-key-value"
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

### 3.4. Purchase API

#### 3.4.1. Verify Google Store Purchase

Verifies and processes a Google Play Store purchase.

- **URL**: `/purchase/verifiedGoogleStore`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "packageName": "com.example.app",
  "productId": "product_id",
  "purchaseToken": "purchase_token",
  "platform": "android"
}
```

**Response**:
```json
{
  "message": "Purchase verified successfully",
  "premium": {
    "type": "premium_type",
    "expiry_date": "expiry_date"
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `409`: Already synchronized
- `500`: Server error

#### 3.4.2. Verify Apple Store Purchase

Verifies and processes an Apple App Store purchase.

- **URL**: `/purchase/verifiedAppleStore`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "receipt-data": "receipt_data",
  "password": "shared_secret",
  "platform": "ios"
}
```

**Response**:
```json
{
  "message": "Purchase verified successfully",
  "premium": {
    "type": "premium_type",
    "expiry_date": "expiry_date"
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `409`: Already synchronized
- `500`: Server error

#### 3.4.3. Affiliate Order

Gets affiliate order information.

- **URL**: `/purchase/affiliateOrder`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json

**Request Body**:
```json
{
  "key_project": "migii-hsk-affiliate",
  "from_date": "yyyy-mm-dd",
  "to_date": "yyyy-mm-dd"
}
```

**Response**:
```json
{
  "orders": [
    {
      "id": "order_id",
      "user_id": "user_id",
      "product_id": "product_id",
      "created_at": "creation_date"
    }
  ]
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `403`: Forbidden
- `500`: Server error

#### 3.4.4. Banking Active

Activates premium via banking.

- **URL**: `/purchase/bankingActive`
- **Method**: `POST`
- **Authentication**: Required (with banking key)

**Headers**:
- `Content-Type`: application/json
- `x-banking-active-key`: {bankingActiveKey}

**Request Body**:
```json
{
  "user_id": "user_id",
  "premium_type": "premium_type",
  "duration": "duration_in_days"
}
```

**Response**:
```json
{
  "message": "Premium activated successfully",
  "premium": {
    "type": "premium_type",
    "expiry_date": "expiry_date"
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

#### 3.4.5. Virtual Bill

Gets virtual bill information.

- **URL**: `/purchase/virtualBill`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "premium_type": "premium_type",
  "duration": "duration_in_days"
}
```

**Response**:
```json
{
  "bill_id": "bill_id",
  "amount": "amount",
  "payment_info": {
    "account_number": "account_number",
    "bank_name": "bank_name",
    "account_name": "account_name",
    "content": "payment_content"
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `500`: Server error

### 3.5. Practice Writing API

#### 3.5.1. Get Questions

Gets questions by pages.

- **URL**: `/practice-writing/question`
- **Method**: `GET`
- **Authentication**: Required

**Headers**:
- `Authorization`: Bearer {accessToken}

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: created_at)
- `order`: Sort order (asc/desc, default: desc)
- `search`: Search term (optional)

**Response**:
```json
{
  "data": [
    {
      "id": "question_id",
      "title": "Question title",
      "content": "Question content",
      "user_id": "creator_user_id",
      "user_name": "Creator name",
      "created_at": "creation_date",
      "upvotes": 5,
      "comments_count": 3,
      "is_upvoted": false
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

#### 3.5.2. Get Comments for Question

Gets all comments for a specific question.

- **URL**: `/practice-writing/comment/:questionId`
- **Method**: `GET`
- **Authentication**: Required

**Headers**:
- `Authorization`: Bearer {accessToken}

**Path Parameters**:
- `questionId`: ID of the question

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: created_at)
- `order`: Sort order (asc/desc, default: desc)

**Response**:
```json
{
  "data": [
    {
      "id": "comment_id",
      "content": "Comment content",
      "user_id": "user_id",
      "user_name": "User name",
      "created_at": "creation_date",
      "upvotes": 2,
      "is_upvoted": false,
      "child_comments_count": 1
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

#### 3.5.3. Get Child Comments

Gets all child comments for a specific comment.

- **URL**: `/practice-writing/comment-child/:commentId`
- **Method**: `GET`
- **Authentication**: Required

**Headers**:
- `Authorization`: Bearer {accessToken}

**Path Parameters**:
- `commentId`: ID of the parent comment

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response**:
```json
{
  "data": [
    {
      "id": "comment_id",
      "content": "Comment content",
      "user_id": "user_id",
      "user_name": "User name",
      "created_at": "creation_date",
      "upvotes": 1,
      "is_upvoted": false
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

#### 3.5.4. Add Comment

Adds a new comment.

- **URL**: `/practice-writing/comment`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "question_id": "question_id",
  "parent_id": "parent_comment_id",
  "content": "Comment content"
}
```

**Response**:
```json
{
  "id": "new_comment_id",
  "content": "Comment content",
  "user_id": "user_id",
  "user_name": "User name",
  "created_at": "creation_date",
  "upvotes": 0,
  "is_upvoted": false
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

#### 3.5.5. Like Comment

Likes or unlikes a comment.

- **URL**: `/practice-writing/comment/upvote`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "commentId": "comment_id",
  "isLike": 1
}
```

**Response**:
```json
{
  "message": "Comment upvoted successfully",
  "upvotes": 3,
  "is_upvoted": true
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

#### 3.5.6. Like Question

Likes or unlikes a question.

- **URL**: `/practice-writing/question/upvote`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "questionId": "question_id",
  "isLike": 1
}
```

**Response**:
```json
{
  "message": "Question upvoted successfully",
  "upvotes": 6,
  "is_upvoted": true
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

#### 3.5.7. Create Question for Premium User

Creates a question for a premium user.

- **URL**: `/practice-writing/make-question`
- **Method**: `POST`
- **Authentication**: Required
- **Content Type**: `multipart/form-data`

**Headers**:
- `Authorization`: Bearer {accessToken}

**Query Parameters**:
- `kind`: Question kind (1: Writing, 2: Grammar, etc.)

**Form Data**:
- `img`: Question image file (optional)
- `title`: Question title
- `content`: Question content
- `tags`: Question tags (comma separated)

**Response**:
```json
{
  "id": "new_question_id",
  "title": "Question title",
  "content": "Question content",
  "user_id": "user_id",
  "user_name": "User name",
  "created_at": "creation_date",
  "image_url": "image_url",
  "tags": ["tag1", "tag2"]
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not premium)
- `406`: Not acceptable
- `413`: Payload too large
- `429`: Too many requests

#### 3.5.8. Report Comment

Reports a comment.

- **URL**: `/practice-writing/report`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Request Body**:
```json
{
  "comment_id": "comment_id",
  "reason": "Report reason"
}
```

**Response**:
```json
{
  "message": "Comment reported successfully"
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized

### 3.8. Scoring API

#### 3.8.1. Score HSK4 Exam (430002)

Scores an HSK4 exam (430002).

- **URL**: `/scoring/hsk4/430002`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Query Parameters**:
- `aiType`: AI scoring type (1=Practice, 2=Test, default: 1)

**Request Body**:
```json
{
  "languageCode": "vi",
  "questionId": "40928",
  "imgUrl": "https://example.com/image.jpg",
  "requiredWord": "必须使用的词语",
  "answer": "学生的回答内容"
}
```

**Response**:
```json
{
  "score": 85,
  "feedback": "Detailed feedback about the answer",
  "corrections": [
    {
      "original": "错误的部分",
      "corrected": "正确的表达",
      "explanation": "Explanation of the correction"
    }
  ],
  "strengths": ["Good vocabulary usage", "Correct grammar"],
  "weaknesses": ["Some sentence structures could be improved"],
  "suggestions": ["Suggestion for improvement"]
}
```

**Status Codes**:
- `200`: Success
- `201`: Success with new result
- `400`: Bad request
- `402`: Payment required (need MIA package)
- `408`: Request timeout

#### 3.8.2. Score HSK5 Exam (530002)

Scores an HSK5 exam (530002).

- **URL**: `/scoring/hsk5/530002`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Query Parameters**:
- `aiType`: AI scoring type (1=Practice, 2=Test, default: 1)

**Request Body**:
```json
{
  "languageCode": "vi",
  "questionId": "41542",
  "requiredWord": "必须使用的词语",
  "answer": "学生的回答内容"
}
```

**Response**:
```json
{
  "score": 85,
  "feedback": "Detailed feedback about the answer",
  "corrections": [
    {
      "original": "错误的部分",
      "corrected": "正确的表达",
      "explanation": "Explanation of the correction"
    }
  ],
  "strengths": ["Good vocabulary usage", "Correct grammar"],
  "weaknesses": ["Some sentence structures could be improved"],
  "suggestions": ["Suggestion for improvement"]
}
```

**Status Codes**:
- `200`: Success
- `201`: Success with new result
- `400`: Bad request
- `402`: Payment required (need MIA package)
- `408`: Request timeout

#### 3.8.3. Score HSK5 Exam (530003)

Scores an HSK5 exam (530003).

- **URL**: `/scoring/hsk5/530003`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Query Parameters**:
- `aiType`: AI scoring type (1=Practice, 2=Test, default: 1)

**Request Body**:
```json
{
  "languageCode": "vi",
  "questionId": "41557",
  "imgUrl": "https://example.com/image.jpg",
  "answer": "学生的回答内容"
}
```

**Response**:
```json
{
  "score": 85,
  "feedback": "Detailed feedback about the answer",
  "corrections": [
    {
      "original": "错误的部分",
      "corrected": "正确的表达",
      "explanation": "Explanation of the correction"
    }
  ],
  "strengths": ["Good vocabulary usage", "Correct grammar"],
  "weaknesses": ["Some sentence structures could be improved"],
  "suggestions": ["Suggestion for improvement"]
}
```

**Status Codes**:
- `200`: Success
- `201`: Success with new result
- `400`: Bad request
- `402`: Payment required (need MIA package)
- `408`: Request timeout

#### 3.8.4. Score HSK6 Exam (630001)

Scores an HSK6 exam (630001).

- **URL**: `/scoring/hsk6/630001`
- **Method**: `POST`
- **Authentication**: Required

**Headers**:
- `Content-Type`: application/json
- `Authorization`: Bearer {accessToken}

**Query Parameters**:
- `aiType`: AI scoring type (1=Practice, 2=Test, default: 1)

**Request Body**:
```json
{
  "languageCode": "vi",
  "questionId": "44836",
  "title": "标题",
  "requiredParagraph": "需要总结的段落",
  "answer": "学生的回答内容"
}
```

**Response**:
```json
{
  "score": 85,
  "feedback": "Detailed feedback about the answer",
  "corrections": [
    {
      "original": "错误的部分",
      "corrected": "正确的表达",
      "explanation": "Explanation of the correction"
    }
  ],
  "strengths": ["Good vocabulary usage", "Correct grammar"],
  "weaknesses": ["Some sentence structures could be improved"],
  "suggestions": ["Suggestion for improvement"]
}
```

**Status Codes**:
- `200`: Success
- `201`: Success with new result
- `400`: Bad request
- `402`: Payment required (need MIA package)
- `408`: Request timeout