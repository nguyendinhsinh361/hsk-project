# HSK API Documentation

## 1. Tổng quan dự án

Đây là API backend cho hệ thống luyện thi HSK (Hanyu Shuiping Kaoshi) được xây dựng bằng NestJS, hỗ trợ đa ngôn ngữ (Tiếng Anh và Tiếng Việt) với các chức năng chấm điểm tự động, quản lý người dùng, và nhiều tính năng khác.

### 1.1. Công nghệ sử dụng
- **Framework**: NestJS
- **Database**: MySQL, TypeORM
- **Authentication**: JWT
- **Cache**: Redis (đã comment)  
- **Validation**: class-validator, Zod
- **Documentation**: Swagger
- **AI Integration**: OpenAI API
- **Error Monitoring**: Sentry

### 1.2. Cấu trúc dự án
```
src/
├── modules/
│   ├── auth/           # Xác thực và ủy quyền
│   ├── system/         # Quản lý hệ thống
│   ├── v1/            # API version 1
│   │   ├── chatgpt/   # Tích hợp OpenAI
│   │   ├── scoring/   # Chấm điểm HSK
│   │   ├── ai-result/ # Kết quả AI scoring
│   │   ├── awards/    # Trao giải và khuyến mãi
│   │   ├── certificate/ # Quản lý chứng chỉ
│   │   ├── device/    # Quản lý thiết bị
│   │   ├── divinations/ # Xem bói HSK
│   │   ├── ebook/     # Quản lý sách điện tử
│   │   ├── event/     # Sự kiện thi thử online
│   │   ├── practice-writing/ # Luyện viết
│   │   ├── purchase/  # Mua gói premium
│   │   └── ...        # Các modules khác
│   ├── helper/        # Các utility functions
│   ├── i18n/          # Đa ngôn ngữ
│   └── cache/         # Cache service
├── middleware/        # Middleware
├── decorators/        # Custom decorators
├── config/           # Cấu hình
└── base/             # Base classes
```

## 2. Authentication Module

### 2.1. Mô tả
Module xử lý xác thực người dùng thông qua JWT token với prefix tùy chỉnh.

### 2.2. Database Schema

#### 2.2.1. AccessToken Entity
```sql
CREATE TABLE AccessToken (
    id VARCHAR(255) PRIMARY KEY,
    userId INT NOT NULL,
    ttl BIGINT NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3. API Endpoints

#### 2.3.1. Authentication
**POST** `/auth`

**Mô tả**: Xác thực người dùng

**Headers**:
- `Authorization`: Bearer token (được xử lý bởi UserIdMiddleware)

**Request Body**:
```json
{
    "id": "optional_access_token_id"
}
```

**Response**:
```json
{
    "user_id": "extracted_user_id"
}
```

### 2.4. Key Features

- **Custom Token Format**: `${userId}.${jwt_token}`
- **No Expiration**: Tokens không có thời gian hết hạn
- **Database Storage**: Lưu trữ token với TTL tùy chỉnh
- **Multiple Token Management**: Hỗ trợ nhiều token cho một user

## 3. System Module

### 3.1. Mô tả
Module quản lý hệ thống và tạo super password keys.

### 3.2. Database Schema

#### 3.2.1. SupperPasswordKey Entity
```sql
CREATE TABLE supper_key (
    id INT AUTO_INCREMENT PRIMARY KEY,
    super_pass VARCHAR(255) NOT NULL,
    key_use VARCHAR(255) NOT NULL,
    key_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.3. API Endpoints

#### 3.3.1. System Info
**GET** `/system/info`

**Mô tả**: Lấy thông tin thời gian hệ thống

**Response**:
```json
{
    "time": 1672531200000
}
```

#### 3.3.2. Super Key Generation
**GET** `/system/supper-key`

**Mô tả**: Tạo super password key

**Middleware**: 
- LimitedRequestsMiddleware (Giới hạn request)
- SupperKeyMiddleware (Xác thực super key)

**Response**:
```json
{
    "superKey": "A1B2C3EUP"
}
```

### 3.4. Super Password Algorithm

```typescript
// Thuật toán tạo super password
const generateSuperPassword = () => {
    const prefix = new Date();
    const SALT1 = 37, SALT2 = 73, SALT3 = 55;
    prefix.setMinutes(0, 0, 0);
    
    const superPass = Math.floor(
        (+prefix.getTime()) / 
        Math.pow(SALT2, 2) * 
        Math.pow(SALT1, 2) * 
        Math.pow(SALT3, 3)
    ).toString(16);
    
    return `${superPass}EUP`.toUpperCase();
}
```

## 4. ChatGPT Integration Module

### 4.1. Mô tả
Module tích hợp với OpenAI API để thực hiện chấm điểm tự động các bài thi HSK.

### 4.2. Database Schema

#### 4.2.1. ChatGPT Usage Entity
```sql
CREATE TABLE usages_chatgpt (
    id INT AUTO_INCREMENT PRIMARY KEY,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    model VARCHAR(255) NOT NULL,
    project_key VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    prompt_tokens INT NOT NULL,
    completion_tokens INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4.3. Configuration

#### 4.3.1. Supported Models
```typescript
enum ChatGPTModelEnum {
    GPT_4_1106_VISION_PREVIEW = "gpt-4-vision-preview",
    GPT_35_TURBO_0125 = "gpt-3.5-turbo-0125",
    GPT_4O_2024_05_13 = "gpt-4o-2024-05-13",
    GPT_4O_MINI = "gpt-4o-mini"
}
```

#### 4.3.2. Project Keys
```typescript
enum ChatGPTProjectKeyEnum {
    HSK_430002 = "MIGII_HSK_430002",
    HSK_530002 = "MIGII_HSK_530002", 
    HSK_530003 = "MIGII_HSK_530003",
    HSK_630001 = "MIGII_HSK_630001"
}
```

### 4.4. Scoring Capabilities

- **Grammatical Range Analysis**: Đánh giá độ phức tạp ngữ pháp
- **Grammatical Accuracy Check**: Kiểm tra lỗi ngữ pháp
- **Lexical Resource Evaluation**: Đánh giá từ vựng và chính tả
- **Coherence Assessment**: Kiểm tra tính mạch lạc
- **Advanced Suggestions**: Gợi ý từ vựng và câu văn nâng cao

## 5. Scoring Module - Core API

### 5.1. Mô tả
Module chính thực hiện chấm điểm các bài thi HSK với nhiều cấp độ khác nhau.

### 5.2. API Endpoints

#### 5.2.1. HSK4 Scoring (430002)
**POST** `/scoring/hsk4/430002`

**Mô tả**: Chấm điểm bài thi HSK4 - mô tả hình ảnh

**Query Parameters**:
- `aiType`: `1` (Luyện tập) hoặc `2` (Thi thử) - Optional, default: 1

**Request Body**:
```json
{
    "languageCode": "vi",
    "questionId": "40928",
    "imgUrl": "https://example.com/image.jpg",
    "requiredWord": "仔细",
    "answer": "女士仔细地欣赏画廊里的一幅窗户和花瓶的画。"
}
```

**Response**:
```json
{
    "miaTotal": 10,
    "idAIScoring": 12345,
    "data": {
        "answerEvaluation": [...],
        "overallEvaluation": "...",
        "imageDescription": "...",
        "suggestedVocabulary": [...],
        "suggestedSentence": [...],
        "score": "6-8",
        "scoreDetail": 7.5
    },
    "status": true,
    "message": "SUCCESS"
}
```

#### 5.2.2. HSK5 Scoring (530002)
**POST** `/scoring/hsk5/530002`

**Mô tả**: Chấm điểm bài thi HSK5 - viết đoạn văn với từ bắt buộc

**Request Body**:
```json
{
    "languageCode": "vi",
    "questionId": "41542", 
    "requiredWord": "客户、谈判、利益、顺利、满意",
    "answer": "当涉及到商务谈判时，与客户的有效沟通至关重要..."
}
```

#### 5.2.3. HSK5 Scoring (530003)
**POST** `/scoring/hsk5/530003`

**Mô tả**: Chấm điểm bài thi HSK5 - mô tả hình ảnh chi tiết

**Request Body**:
```json
{
    "languageCode": "vi",
    "questionId": "41557",
    "imgUrl": "https://example.com/image.jpg", 
    "answer": "在图片中，我们看到一个正在进行的视频拍摄场景..."
}
```

#### 5.2.4. HSK6 Scoring (630001)
**POST** `/scoring/hsk6/630001`

**Mô tả**: Chấm điểm bài thi HSK6 - tóm tắt đoạn văn

**Request Body**:
```json
{
    "languageCode": "vi",
    "questionId": "44836",
    "title": "Nhập tiêu đề cho bài tóm tắt",
    "requiredParagraph": "很久很久以前，有一位智慧而受人爱戴的国王...",
    "answer": "  在这个故事中，叙述者萨希尔讲述了他与两个好朋友..."
}
```

### 5.3. Response Status Codes

| Status Code | Description | Meaning |
|-------------|-------------|---------|
| 200 | OK | Chấm điểm thành công |
| 201 | CREATED | Thành công với kết quả mới |
| 400 | BAD REQUEST | Lỗi trong quá trình chấm |
| 402 | PAYMENT REQUIRED | Cần mua gói MIA để có lượt chấm |
| 408 | REQUEST TIMEOUT | Timeout (>1 phút) |

### 5.4. Scoring Criteria

#### 5.4.1. Common Evaluation Criteria
1. **Content and Task Response**: Đánh giá nội dung và hoàn thành yêu cầu
2. **Lexical Resource**: Đánh giá khả năng sử dụng từ vựng
3. **Grammatical Range and Accuracy**: Đánh giá ngữ pháp
4. **Coherence and Cohesion**: Đánh giá tính mạch lạc

#### 5.4.2. HSK-Specific Requirements

**HSK4 (430002)**:
- Sử dụng từ bắt buộc từ đề bài
- Mô tả chính xác nội dung hình ảnh
- Tối thiểu 8 ký tự Trung Quốc
- 1 câu hoàn chỉnh

**HSK5 (530002)**:
- Sử dụng đủ 5 từ bắt buộc từ đề bài
- Tối thiểu 80 ký tự Trung Quốc
- Định dạng đoạn văn (lùi đầu dòng 2 ô)
- Tối thiểu 2 câu hoàn chỉnh

**HSK5 (530003)**:
- Mô tả chi tiết và chính xác hình ảnh
- Tối thiểu 80 ký tự Trung Quốc
- Định dạng đoạn văn
- Nội dung liên quan đến hình ảnh

**HSK6 (630001)**:
- Tóm tắt chính xác tài liệu đọc
- Tối thiểu 400 ký tự Trung Quốc
- Không được có ý kiến cá nhân
- Định dạng đoạn văn chuẩn

### 5.5. Scoring Scales

#### 5.5.1. HSK4 Scale
- **0**: Không điểm - Bài làm không hợp lệ
- **1-5**: Cần cải thiện cơ bản - Nhiều lỗi ngữ pháp/từ vựng
- **6-8**: Tốt - Một số lỗi nhỏ, cần cải thiện
- **9-10**: Xuất sắc - Hoàn thành tốt yêu cầu

#### 5.5.2. HSK5 Scale  
- **0**: Không điểm - Bài làm không hợp lệ
- **1-10**: Cần cải thiện cơ bản - Thiếu từ bắt buộc, nhiều lỗi
- **11-20**: Khá tốt - Còn một số lỗi ngữ pháp/từ vựng
- **21-30**: Xuất sắc - Hoàn thành tốt yêu cầu

#### 5.5.3. HSK6 Scale
- **0**: Không điểm - Bài làm không hợp lệ
- **1-30**: Cần cải thiện nhiều - Không bám sát tài liệu, nhiều lỗi
- **31-50**: Cần cải thiện cơ bản - Một số lỗi ngữ pháp/từ vựng
- **51-80**: Khá tốt - Ít lỗi, cần hoàn thiện
- **81-100**: Xuất sắc - Hoàn thành tốt yêu cầu

### 5.6. Validation Rules

#### 5.6.1. Common Validation
- **Word Count**: Kiểm tra số lượng từ tối thiểu
- **Spam Detection**: Phát hiện từ/câu lặp lại quá nhiều (>3 lần)
- **Blacklist Check**: Kiểm tra từ ngữ không phù hợp
- **Punctuation**: Kiểm tra dấu câu hợp lý (không lặp >2 lần)
- **Format**: Kiểm tra định dạng trình bày

#### 5.6.2. Content Validation
- **Required Words**: Kiểm tra từ bắt buộc (HSK4, HSK5)
- **Image Relevance**: Kiểm tra liên quan đến hình ảnh (HSK4, HSK5-530003)
- **Personal Opinion**: Không được có ý kiến cá nhân (HSK6)
- **Summary Accuracy**: Tóm tắt chính xác tài liệu đọc (HSK6)

### 5.7. AI Enhancement Features

#### 5.7.1. Suggested Vocabulary
```json
{
    "term": "很美丽",
    "reason": "Thay 'очень美丽' bằng '美丽得令人惊叹' để tăng cường sức mạnh diễn đạt"
}
```

#### 5.7.2. Suggested Sentences
```json
[
    "这朵花的美丽太夺人眼球了。",
    "这朵花美丽得令人心醉。", 
    "这朵花美丽得令人惊叹。"
]
```

#### 5.7.3. Rewritten Paragraphs (HSK5/6)
- Đoạn văn được viết lại hoàn chỉnh
- Sửa lỗi ngữ pháp và từ vựng  
- Cải thiện tính mạch lạc
- Đảm bảo định dạng chuẩn

## 6. AI Result Module

### 6.1. Mô tả
Module quản lý kết quả chấm điểm AI, lưu trữ và cập nhật lịch sử các bài thi đã được chấm.

### 6.2. Database Schema

#### 6.2.1. AI Result Entity
```sql
CREATE TABLE ai_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    history_id INT,
    question_id INT NOT NULL,
    result TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    ai_type INT DEFAULT 1,
    ids_chatgpt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.3. API Endpoints

#### 6.3.1. Update AI Result History
**PUT** `/ai-result`

**Mô tả**: Cập nhật lịch sử chấm điểm cho các câu hỏi

**Headers**:
- `Authorization`: Bearer token

**Request Body**:
```json
{
    "aiScoringIds": [1, 2, 3, 4],
    "historyId": "history_id_123"
}
```

**Response**:
```json
{
    "message": "Update history for all questions successfully.",
    "data": {}
}
```

### 6.4. Key Features

- **Batch Update**: Cập nhật nhiều kết quả AI cùng lúc
- **History Tracking**: Theo dõi lịch sử chấm điểm
- **User Validation**: Kiểm tra quyền sở hữu kết quả
- **Error Handling**: Xử lý lỗi với Sentry integration

## 7. Awards Module

### 7.1. Mô tả
Module quản lý trao giải thưởng, khuyến mãi và các sự kiện đặc biệt cho người dùng.

### 7.2. API Endpoints

#### 7.2.1. Custom MIA Awards
**POST** `/awards/custom-mia`

**Mô tả**: Trao giải MIA tùy chỉnh theo email

**Middleware**: SupportAdminMiddleware

**Request Body**:
```json
{
    "eventName": "Sự kiện dùng thử",
    "premiumTime": "30",
    "miaTotal": "10",
    "emails": ["user1@example.com", "user2@example.com"]
}
```

#### 7.2.2. Trial MIA for Current User
**POST** `/awards/trial-mia`

**Mô tả**: Nhận gói dùng thử MIA cho tài khoản hiện tại

**Request Body**:
```json
{
    "info": "user_info_string"
}
```

**Response**:
```json
{
    "message": "Bạn đã nhận thành công lượt dùng thử.",
    "data": {
        "purchase_info": "..."
    }
}
```

#### 7.2.3. Get Trial Time
**POST** `/awards/get-time-trial`

**Mô tả**: Lấy thời gian kích hoạt sự kiện dùng thử

**Response**:
```json
{
    "message": "Get event custom time successfully.",
    "data": {
        "startTime": 1718278113000,
        "endTime": 1719791999000,
        "serverTime": 1672531200000
    }
}
```

#### 7.2.4. Award Online Test Prize
**POST** `/awards/award-test-online`

**Mô tả**: Trao giải cho kết quả thi thử online

**Response**:
```json
{
    "message": "Awards Prize successfully !!!",
    "data": {}
}
```

### 7.3. Award Types

#### 7.3.1. Event Name Enum
```typescript
enum EventNameEnum {
    TRIAL_EVENT = "Sự kiện dùng thử",
    ONLINE_EVENT = "Thi thử online",
    CUSTOM_ACTIVE = "Kích hoạt tài khoản công ty",
}
```

### 7.4. Prize Distribution Logic

- **TOP 1**: 10 lượt MIA + 30 ngày Premium (HSK4-6)
- **TOP 2-3**: 5 lượt MIA + 14 ngày Premium (HSK4-6)
- **TOP 4-20**: 1 lượt MIA + 5 ngày Premium (HSK4-6)
- **Minimum Score**: 50 điểm để nhận giải

## 8. Certificate Module

### 8.1. Mô tả
Module quản lý chứng chỉ HSK của người dùng, bao gồm tạo, duyệt và chia sẻ chứng chỉ.

### 8.2. Database Schema

#### 8.2.1. Certificate Entity
```sql
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(255),
    certificate_img VARCHAR(255),
    note TEXT,
    share INT,
    active INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 8.2.2. Certificate Time Entity
```sql
CREATE TABLE certificates_time (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_time BIGINT,
    end_time BIGINT,
    active INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 8.3. API Endpoints

#### 8.3.1. Create Certificate
**POST** `/certificate`

**Mô tả**: Tạo chứng chỉ mới cho người dùng

**Content-Type**: `multipart/form-data`

**Request Body**:
```json
{
    "username": "Nguyễn Văn A",
    "email": "user@example.com",
    "phoneNumber": "0123456789",
    "note": "Ghi chú",
    "share": "1",
    "certificateImg": "file_upload"
}
```

#### 8.3.2. Get Certificate Time Setup
**GET** `/certificate/setup-time`

**Mô tả**: Lấy thời gian thông báo người dùng gửi chứng chỉ

**Response**:
```json
{
    "message": "Get certificate time successfully.",
    "data": {
        "startTime": 1704868878000,
        "endTime": 1707547278000,
        "serverTime": 1672531200000
    }
}
```

#### 8.3.3. Get All Certificates
**GET** `/certificate`

**Mô tả**: Lấy ra tất cả các ảnh chứng chỉ đã được duyệt

**Query Parameters**:
- `page`: Số trang
- `limit`: Số lượng mỗi trang

**Response**:
```json
{
    "message": "Get all image of certificate successfully",
    "data": [
        "https://domain.com/certificate1.jpg",
        "https://domain.com/certificate2.jpg"
    ]
}
```

#### 8.3.4. Get Notification Status
**GET** `/certificate/notify`

**Mô tả**: Lấy trạng thái duyệt chứng chỉ

**Response**:
```json
{
    "message": "Get notify of certificate successfully.",
    "data": {
        "active": 1,
        "premiunTime": 30
    }
}
```

### 8.4. Certificate Status

#### 8.4.1. Status Enum
```typescript
enum CertificateStatusEnum {
    ACTIVE = 1,           // Kích hoạt
    DEACTIVE = -1,        // Không kích hoạt
    PEDNDING = 0,         // Trạng thái chờ
    DEACTIVE_PRCCESSED = -2, // Đã xử lý (Không duyệt)
    ACTIVE_PRCCESSED = 2,    // Đã xử lý (Duyệt)
}
```

### 8.5. Features

- **Image Upload**: Upload ảnh chứng chỉ
- **Status Management**: Quản lý trạng thái duyệt
- **Sharing Control**: Điều khiển chia sẻ chứng chỉ
- **Time Management**: Quản lý thời gian nhận chứng chỉ
- **Premium Reward**: Tặng 30 ngày Premium khi được duyệt

## 9. Device Module

### 9.1. Mô tả
Module quản lý thông tin thiết bị của người dùng và theo dõi hoạt động.

### 9.2. Database Schema

#### 9.2.1. Users Device Manager Entity
```sql
CREATE TABLE users_device_manager (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    device TEXT,
    device_id TEXT,
    platforms TEXT,
    platforms_version TEXT,
    app_version TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    active INT
);
```

### 9.3. Service Methods

#### 9.3.1. Get Device IDs
```typescript
async getDeviceId(userId: number): Promise<string[]>
```
- Lấy danh sách device IDs của user (tối đa 3 thiết bị)

#### 9.3.2. Save Device Info
```typescript
async save(input: DeviceInfo): Promise<any>
```
- Lưu thông tin thiết bị mới (không trùng lặp)

#### 9.3.3. Emoji Replacement
```typescript
replaceEmoji(str: string): string
```
- Thay thế emoji trong chuỗi text bằng ký tự '_'

### 9.4. Features

- **Multi-Device Support**: Hỗ trợ nhiều thiết bị cho một user
- **Platform Detection**: Phát hiện platform (iOS/Android)
- **Version Tracking**: Theo dõi phiên bản app và OS
- **Emoji Handling**: Xử lý emoji trong device names

## 10. Divination Module (Xem Bói HSK)

### 10.1. Mô tả
Module cung cấp tính năng xem bói dành cho người học HSK, tạo trải nghiệm thú vị và tăng tương tác.

### 10.2. Database Schema

#### 10.2.1. User History Divination Entity
```sql
CREATE TABLE user_history_divination (
    id INT AUTO_INCREMENT PRIMARY KEY,
    info_user_divination_id INT NOT NULL,
    divination_id INT NOT NULL,
    content_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 10.2.2. Info User Divination Entity
```sql
CREATE TABLE info_user_divination (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    birthday VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 10.3. API Endpoints

#### 10.3.1. Create History Divination
**POST** `/divination`

**Mô tả**: Tạo lịch sử xem bói cho người dùng

**Request Body**:
```json
{
    "infoUserId": 1,
    "divinationId": 1,
    "contentId": 1
}
```

#### 10.3.2. List History Divination
**GET** `/divination`

**Mô tả**: Lấy danh sách lịch sử xem bói

**Response**:
```json
[
    {
        "divinationId": 1,
        "userId": 123,
        "username": "Nguyễn Văn A",
        "birthday": "14/02/1990",
        "contentIds": "1,2,3",
        "createdAt": "2024-01-01"
    }
]
```

#### 10.3.3. Get User Info
**GET** `/divination/info-user`

**Mô tả**: Lấy thông tin người dùng cho tính năng xem bói

**Response**:
```json
{
    "id": 1,
    "userId": 123,
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990"
}
```

#### 10.3.4. Create User Info
**POST** `/divination/info-user`

**Mô tả**: Tạo thông tin người dùng cho xem bói

**Request Body**:
```json
{
    "username": "Nguyễn Văn A",
    "birthday": "14/02/1990"
}
```

#### 10.3.5. Get History Detail
**GET** `/divination/:divinationId`

**Mô tả**: Lấy chi tiết lịch sử xem bói theo ID

**Response**:
```json
[
    {
        "divinationId": 1,
        "username": "Nguyễn Văn A",
        "birthday": "14/02/1990",
        "contentId": 1,
        "createdAt": "2024-01-01"
    }
]
```

### 10.4. Features

- **Personal Info Management**: Quản lý thông tin cá nhân cho xem bói
- **History Tracking**: Theo dõi lịch sử các lần xem bói
- **Content Grouping**: Nhóm nội dung theo divination ID
- **Data Validation**: Kiểm tra duplicate và validate data

## 11. Ebook Module

### 11.1. Mô tả
Module quản lý sách điện tử, hỗ trợ đọc sách, audio và theo dõi tiến độ học tập.

### 11.2. Database Schema

#### 11.2.1. Ebook Entity
```sql
CREATE TABLE ebooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flag VARCHAR(255) NOT NULL,
    name TEXT,
    cover_img_url VARCHAR(255),
    pdf_url VARCHAR(255),
    audio_url TEXT,
    type VARCHAR(255) NOT NULL,
    type_lang TEXT,
    author VARCHAR(255),
    is_free TINYINT DEFAULT 0,
    priority INT NOT NULL,
    language VARCHAR(255) NOT NULL,
    level VARCHAR(255),
    skill VARCHAR(255),
    is_open_app TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 11.2.2. Ebooks Users Entity
```sql
CREATE TABLE ebooks_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    favourites TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 11.3. API Endpoints

#### 11.3.1. Get Ebooks
**GET** `/ebook`

**Mô tả**: Lấy danh sách ebook theo tùy chọn của user

**Query Parameters**:
- `page`: Số trang (default: 1)
- `limit`: Số lượng mỗi trang (default: 10)
- `lang`: Ngôn ngữ (default: "vi")
- `filter`: Bộ lọc (all/is_progress/favourite/newest)
- `type`: Loại sách (all/giáo trình/sách giải trí/...)

**Response**:
```json
{
    "ebooks": [
        {
            "id": 1,
            "name": {"vi": "Sách HSK4", "en": "HSK4 Book"},
            "cover_img_url": "https://domain.com/cover.jpg",
            "pdf_url": "https://domain.com/book.pdf",
            "audio_url": [
                {"url": "https://domain.com/audio1.mp3"},
                {"url": "https://domain.com/audio2.mp3"}
            ],
            "type": "giáo trình",
            "author": {"vi": "Tác giả", "en": "Author"},
            "is_favourite": 1,
            "progress": 75,
            "is_downloaded": 1,
            "page_checkpoint": 150
        }
    ],
    "progress": 5,
    "completed": 2
}
```

#### 11.3.2. Create New Ebook
**POST** `/ebook`

**Mô tả**: Tạo mới ebook (Admin only)

**Content-Type**: `multipart/form-data`

**Request Body**:
```json
{
    "ebookData": "json_file_upload"
}
```

#### 11.3.3. Update Ebook Detail
**PUT** `/ebook/:ebookId`

**Mô tả**: Cập nhật chi tiết ebook

**Middleware**: SupperKeyMiddleware

**Request Body**:
```json
{
    "cover_img_url": "https://domain.com/new-cover.jpg",
    "pdf_url": "https://domain.com/new-book.pdf",
    "audio_url": "https://domain.com/new-audio.mp3"
}
```

#### 11.3.4. Synchronize User Ebook
**POST** `/ebook/synchronize`

**Mô tả**: Đồng bộ ebook với user

**Request Body**:
```json
{
    "synchronizedEbook": [
        {
            "ebook_id": 1,
            "progress": 75,
            "is_favourite": 1,
            "page_checkpoint": 150,
            "is_downloaded": 1
        }
    ]
}
```

### 11.4. Ebook Types

#### 11.4.1. Type Enum
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

#### 11.4.2. Filter Options
```typescript
enum OptionEbookEnum {
    DEFAULT = "all",
    IN_PROGRESS = "is_progress",
    FAVOURITE = "favourite",
    NEWEST = "newest",
}
```

### 11.5. Features

- **Multi-format Support**: PDF và Audio
- **Progress Tracking**: Theo dõi tiến độ đọc
- **Bookmark System**: Lưu vị trí đọc
- **Favourite Management**: Quản lý sách yêu thích
- **Download Tracking**: Theo dõi sách đã tải về
- **Multi-language**: Hỗ trợ đa ngôn ngữ
- **Audio Sorting**: Sắp xếp file audio theo thứ tự

## 12. Event Module (Thi Thử Online)

### 12.1. Mô tả
Module quản lý các sự kiện thi thử HSK online, bao gồm ranking, lịch sử thi và theo dõi người dùng.

### 12.2. Database Schema

#### 12.2.1. Event Entity
```sql
CREATE TABLE event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    level INT,
    kind VARCHAR(225),
    active INT DEFAULT 1,
    start BIGINT,
    end BIGINT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    count_question INT,
    time INT,
    follower_count INT DEFAULT 0
);
```

### 12.3. API Endpoints

#### 12.3.1. Get Event List
**GET** `/event/event-list`

**Mô tả**: Lấy danh sách tất cả sự kiện đang có

**Query Parameters**:
- `language`: Ngôn ngữ (vi/en/zh-cn/...)

**Response**:
```json
{
    "message": "Get list event successfully !!!",
    "data": [
        {
            "event_id": 1,
            "kind": "HSK4",
            "start": 1672531200000,
            "end": 1672617600000,
            "count_question": 30,
            "time": 60,
            "follower_count": 150,
            "is_following": 1,
            "status": 0,
            "timeServer": 1672531200000,
            "image": "https://domain.com/event.jpg",
            "title": "Thi thử HSK4 tháng 1"
        }
    ]
}
```

#### 12.3.2. Get Event Detail
**GET** `/event/event-detail`

**Mô tả**: Lấy chi tiết một sự kiện thi thử

**Query Parameters**:
- `event_id`: ID sự kiện
- `language`: Ngôn ngữ

**Response**:
```json
{
    "message": "Get event detail successfully !!!",
    "data": {
        "event_id": 1,
        "kind": "HSK4",
        "start": 1672531200000,
        "end": 1672617600000,
        "title": "Thi thử HSK4",
        "image": "https://domain.com/event.jpg",
        "test_id": 101,
        "score": 300,
        "pass_score": 180,
        "count_users": 500
    }
}
```

#### 12.3.3. Get Exam Detail
**GET** `/event/exam-event-detail`

**Mô tả**: Lấy chi tiết đề thi của sự kiện

**Query Parameters**:
- `exam_event_id`: ID đề thi

**Response**:
```json
{
    "message": "Get event detail successfully !!!",
    "data": {
        "test_id": 101,
        "time": 60,
        "score": 300,
        "pass_score": 180,
        "parts": [
            {
                "name": "Listening",
                "content": [...]
            }
        ]
    }
}
```

#### 12.3.4. Get Event History
**GET** `/event/event-history`

**Mô tả**: Lấy lịch sử thi của user

**Query Parameters**:
- `event_id`: ID sự kiện

**Response**:
```json
{
    "message": "Get event result history successfully !!!",
    "data": [
        {
            "test_id": 101,
            "event_id": 1,
            "answer": [...],
            "result_score_total": 250,
            "result_score_parts": [...],
            "work_time": 3600,
            "correct_count_question": 25,
            "count_question": 30,
            "created_at": "2024-01-01"
        }
    ]
}
```

#### 12.3.5. Get Ranking
**GET** `/event/ranking`

**Mô tả**: Lấy bảng xếp hạng sự kiện

**Query Parameters**:
- `event_id`: ID sự kiện
- `page`: Số trang
- `limit`: Số lượng mỗi trang

**Response**:
```json
{
    "message": "Get ranking successfully !!!",
    "data": {
        "current_user_ranking": {
            "user_id": 123,
            "name": "Nguyễn Văn A",
            "work_time": 3600,
            "result_score_total": 250,
            "score": 300,
            "rank_index": 15
        },
        "event_online_ranking": [
            {
                "user_id": 456,
                "name": "Trần Thị B",
                "result_score_total": 280,
                "rank_index": 1
            }
        ]
    }
}
```

#### 12.3.6. Complete Exam
**POST** `/event/complete-exam`

**Mô tả**: Cập nhật kết quả thi

**Request Body**:
```json
{
    "test_id": 101,
    "event_id": 1,
    "answers": [
        {
            "id": 1,
            "answer": ["A", "B"],
            "correct": [1, 0]
        }
    ],
    "work_time": 3600
}
```

#### 12.3.7. Follow Event
**POST** `/event/follow`

**Mô tả**: Theo dõi/Bỏ theo dõi sự kiện

**Request Body**:
```json
{
    "event_id": "1",
    "follow": 1
}
```

### 12.4. Event Status

- **Status 0**: Đang diễn ra
- **Status 1**: Sắp diễn ra  
- **Status 2**: Đã kết thúc

### 12.5. Features

- **Real-time Ranking**: Xếp hạng thời gian thực
- **Multi-part Scoring**: Chấm điểm từng phần
- **Work Time Tracking**: Theo dõi thời gian làm bài
- **Follow System**: Hệ thống theo dõi sự kiện
- **History Management**: Quản lý lịch sử thi
- **Multi-language Support**: Hỗ trợ đa ngôn ngữ

## 13. Practice Writing Module

### 13.1. Mô tả
Module hỗ trợ luyện viết HSK với cộng đồng, bao gồm tạo câu hỏi, bình luận và tương tác.

### 13.2. API Endpoints

#### 13.2.1. Get Questions
**GET** `/practice-writing/question`

**Mô tả**: Lấy nhiều câu hỏi theo trang

**Query Parameters**:
- `page`: Số trang
- `limit`: Số lượng mỗi trang
- `kind`: Loại câu hỏi (430002/530002/530003/630001)
- `filter`: Bộ lọc (user/comment/like)

**Response**:
```json
{
    "message": "Get questions successfully",
    "data": [
        {
            "id": 1,
            "content": "Describe the image",
            "image_url": "https://domain.com/image.jpg",
            "kind": "430002",
            "user_name": "User123",
            "created_at": "2024-01-01",
            "like_count": 10,
            "comment_count": 5,
            "is_liked": 1
        }
    ]
}
```

#### 13.2.2. Get Comments
**GET** `/practice-writing/comment/:questionId`

**Mô tả**: Lấy tất cả bình luận của câu hỏi

**Query Parameters**:
- `page`: Số trang
- `limit`: Số lượng mỗi trang
- `filter`: Bộ lọc (upvote)

**Response**:
```json
{
    "message": "Get comments successfully",
    "data": [
        {
            "id": 1,
            "content": "这是一个很好的答案",
            "user_name": "Commenter",
            "created_at": "2024-01-01",
            "upvote_count": 3,
            "is_upvoted": 1,
            "child_count": 2
        }
    ]
}
```

#### 13.2.3. Get Child Comments
**GET** `/practice-writing/comment-child/:commentId`

**Mô tả**: Lấy bình luận con của một bình luận

**Response**:
```json
{
    "message": "Get child comments successfully",
    "data": [
        {
            "id": 2,
            "content": "我同意你的观点",
            "user_name": "Replier",
            "parent_id": 1,
            "created_at": "2024-01-01"
        }
    ]
}
```

#### 13.2.4. Add Comment
**POST** `/practice-writing/comment`

**Mô tả**: Thêm bình luận mới

**Request Body**:
```json
{
    "questionId": 1,
    "content": "这是我的答案：...",
    "parentId": 0,
    "language": "zh"
}
```

#### 13.2.5. Upvote Comment
**POST** `/practice-writing/comment/upvote`

**Mô tả**: Like/Unlike bình luận

**Request Body**:
```json
{
    "commentId": 1,
    "isLike": 1
}
```

#### 13.2.6. Upvote Question
**POST** `/practice-writing/question/upvote`

**Mô tả**: Like/Unlike câu hỏi

**Request Body**:
```json
{
    "questionId": 1,
    "isLike": 1
}
```

#### 13.2.7. Make Question (Premium)
**POST** `/practice-writing/make-question`

**Mô tả**: Tạo câu hỏi cho người dùng premium

**Content-Type**: `multipart/form-data`

**Query Parameters**:
- `kind`: Loại câu hỏi

**Request Body**:
```json
{
    "question": "Mô tả hình ảnh này",
    "img": "file_upload"
}
```

#### 13.2.8. Report Comment
**POST** `/practice-writing/report`

**Mô tả**: Báo cáo bình luận không phù hợp

**Request Body**:
```json
{
    "commentId": 1,
    "content": "Nội dung không phù hợp"
}
```

### 13.3. Question Limits per Day

```typescript
enum CountQuestionInDay {
    KIND_430002 = 3,  // HSK4: 3 câu/ngày
    KIND_530002 = 3,  // HSK5 văn bản: 3 câu/ngày
    KIND_530003 = 1,  // HSK5 hình ảnh: 1 câu/ngày
    KIND_630001 = 1,  // HSK6: 1 câu/ngày
}
```

### 13.4. Features

- **Community Questions**: Cộng đồng câu hỏi luyện tập
- **Hierarchical Comments**: Bình luận có cấu trúc cây
- **Voting System**: Hệ thống vote câu hỏi và bình luận
- **Premium Question Creation**: Tạo câu hỏi cho user premium
- **Content Moderation**: Báo cáo nội dung không phù hợp
- **Multi-language Support**: Hỗ trợ đa ngôn ngữ
- **Rate Limiting**: Giới hạn số câu hỏi tạo mỗi ngày

## 14. Purchase Module (IAP)

### 14.1. Mô tả
Module xử lý mua hàng trong ứng dụng (In-App Purchase) cho cả iOS và Android, cũng như thanh toán ngân hàng.

### 14.2. Database Schema

#### 14.2.1. Purchase Entity
```sql
CREATE TABLE purchase (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT,
    product_id TEXT,
    platforms VARCHAR(20),
    purchase_date BIGINT,
    time_expired BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active INT DEFAULT 1,
    appStoreReceipt LONGTEXT,
    transaction_id TEXT,
    product_id_sale TEXT,
    exchange INT DEFAULT 0,
    note TEXT,
    admin_id INT,
    country VARCHAR(2),
    price_sale INT DEFAULT 0,
    platform_pred VARCHAR(20),
    mia_total INT DEFAULT 0,
    product_type INT DEFAULT 1,
    bank INT DEFAULT 1,
    affiliate_code VARCHAR(50),
    affiliate_package_key VARCHAR(50),
    affiliate_discount INT,
    origin_mia_total INT DEFAULT 0,
    transaction_code VARCHAR(255)
);
```

### 14.3. API Endpoints

#### 14.3.1. Verify Google Play Purchase
**POST** `/purchase/verifiedGoogleStore`

**Mô tả**: Xác thực giao dịch Google Play Store

**Request Body**:
```json
{
    "subscriptionId": "migii_hsk_mia_lifetime",
    "token": "google_play_token",
    "device_id": "device_123",
    "device": "Samsung Galaxy S21",
    "platforms_version": "Android 12",
    "app_version": "1.0.0",
    "affiliate": {
        "code": "AFF123",
        "package_key": "PKG456",
        "discount": 10
    }
}
```

**Response**:
```json
{
    "premium": {
        "purchase_date": 1672531200000,
        "time_expired": 1672617600000,
        "product_id": "migii_hsk_mia_lifetime"
    }
}
```

#### 14.3.2. Verify Apple App Store Purchase
**POST** `/purchase/verifiedAppleStore`

**Mô tả**: Xác thực giao dịch Apple App Store

**Request Body**:
```json
{
    "receipt": "apple_receipt_data",
    "type": "sandbox",
    "device_id": "device_123",
    "device": "iPhone 13",
    "platforms_version": "iOS 15.0",
    "app_version": "1.0.0",
    "affiliate": {
        "code": "AFF123",
        "package_key": "PKG456",
        "discount": 10
    }
}
```

#### 14.3.3. Banking Active Premium
**POST** `/purchase/bankingActive`

**Mô tả**: Kích hoạt premium qua chuyển khoản ngân hàng

**Middleware**: BankingActiveKeyMiddleware

**Request Body**:
```json
{
    "virtual_bill": {
        "id": "bill_id",
        "user_id": "123",
        "email": "user@example.com",
        "product_id": "migii_hsk_mia_lifetime",
        "price": "878000",
        "currency": "VND",
        "transaction_code": "TX123456",
        "project_id": "MHSK",
        "affiliate": {
            "affiliate_code": "AFF123",
            "affiliate_package_key": "PKG456",
            "affiliate_discount": "10"
        }
    },
    "transaction": {
        "transactionStatus": "SUCCESS",
        "transactionChannel": "ACB",
        "transactionCode": "TX123456",
        "accountNumber": "12345678",
        "transactionDate": "2024-01-01T00:00:00Z",
        "effectiveDate": "2024-01-01T00:00:00Z",
        "debitOrCredit": "CREDIT",
        "amount": 878000,
        "transactionContent": "MIGII HSK TX123456",
        "transactionEntityAttribute": {
            "receiverBankName": "ACB",
            "issuerBankName": "Vietcombank",
            "remitterName": "Nguyen Van A",
            "remitterAccountNumber": "87654321"
        }
    }
}
```

#### 14.3.4. Get Virtual Bill
**POST** `/purchase/virtualBill`

**Mô tả**: Lấy thông tin đơn thanh toán ảo

**Request Body**:
```json
{
    "product_id": "migii_hsk_mia_lifetime",
    "price": 878000,
    "affiliate": {
        "affiliate_code": "AFF123",
        "affiliate_package_key": "PKG456",
        "affiliate_discount": "10"
    }
}
```

#### 14.3.5. Affiliate Orders
**POST** `/purchase/affiliateOrder`

**Mô tả**: Lấy danh sách đơn hàng affiliate

**Request Body**:
```json
{
    "key_project": "migii-hsk-affiliate",
    "start_time": 1570966746000,
    "end_time": 1770966746000
}
```

### 14.4. Product Configuration

#### 14.4.1. MIA Products
```typescript
const PURCHARSE_MIA_DETAIL = {
    "mia_token": 200,      // 200 lượt chấm
    "mia_1month": 250,     // 250 lượt chấm + 1 tháng premium
    "mia_3months": 250,    // 250 lượt chấm + 3 tháng premium
    "mia_12months": 300,   // 300 lượt chấm + 12 tháng premium
    "mia_lifetime": 400    // 400 lượt chấm + premium vĩnh viễn
}
```

#### 14.4.2. Product Types
```typescript
enum ProductTypeEnum {
    PRODUCT_TYPE_STANDARD = 1,  // Gói premium thông thường
    PRODUCT_TYPE_MIA = 2        // Gói MIA với lượt chấm AI
}
```

### 14.5. Purchase Flow

#### 14.5.1. Mobile IAP Flow
1. User mua gói trong app (iOS/Android)
2. App gửi receipt/token lên server
3. Server verify với Apple/Google
4. Tạo purchase record trong database
5. Kích hoạt premium cho user

#### 14.5.2. Banking Flow
1. User tạo virtual bill
2. Chuyển khoản theo thông tin
3. Ngân hàng webhook notify server
4. Server verify transaction
5. Kích hoạt premium cho user

### 14.6. Features

- **Multi-platform Support**: iOS, Android, Web
- **Receipt Verification**: Xác thực với Apple/Google
- **Banking Integration**: Thanh toán qua ngân hàng
- **Affiliate System**: Hệ thống tiếp thị liên kết
- **Premium Stacking**: Cộng dồn thời gian premium
- **MIA Token Management**: Quản lý lượt chấm AI
- **Anti-fraud**: Chống gian lận giao dịch
- **Telegram Notifications**: Thông báo giao dịch qua Telegram

## 15. Helper Services

### 15.1. DetailTasksService

#### 15.1.1. File Operations
- `readJsonFile(filePath)`: Đọc file JSON
- `writeJsonFile(filePath, jsonData)`: Ghi file JSON  
- `readFileLines(filePath)`: Đọc file theo từng dòng

#### 15.1.2. Text Processing
- `checkSpacesBeginOfLines(text)`: Kiểm tra khoảng trắng đầu dòng
- `removePersonalOpinionSentences(text)`: Loại bỏ câu ý kiến cá nhân
- `extractChineseCharacters(text)`: Trích xuất ký tự Trung Quốc
- `countTokenText(text)`: Đếm token trong text

#### 15.1.3. Data Processing
- `getRandomSubarray(arr, size)`: Lấy mảng con ngẫu nhiên
- `uniqueObjectsByTerm(arr)`: Loại bỏ object trùng lặp
- `checkUpgradeObj_HSK6(upgradeObjHSK6)`: Validate object HSK6
- `containsLatin(text)`: Kiểm tra có chứa ký tự Latin

### 15.2. KeyValueService

#### 15.2.1. Internationalization Methods
- `getValueFromKeyEnum(languageCode, keyword)`: Lấy giá trị theo ngôn ngữ
- `getValueFromKeyInputRoleChatGPTEnum(languageCode, keyword)`: Lấy prompt role
- `getValueFromKeyCriteriaEnum(languageCode, keyword)`: Lấy tiêu chí đánh giá

## 16. Cache Module

### 16.1. CacheService

#### 16.1.1. Redis Operations
- `get(key)`: Lấy giá trị từ cache
- `set(key, value, ttl?)`: Lưu vào cache với TTL tùy chọn
- `delete(key)`: Xóa khỏi cache
- `onModuleInit()`: Reset Redis khi khởi động

## 17. Data Validation với Zod

### 17.1. Schema Definitions

```typescript
// Grammatical Range Schema
const GRAMMATICAL_RANGE_SCHEMA = z.object({
    satisfy: z.string(),
    explain: z.string(), 
    analysis: z.string(),
});

// Lexical Resource Schema
const LEXICAL_RESOURCE_SCHEMA = z.object({
    errors: z.string(),
    analysis: z.array(z.string()),
});

// Advanced Vocabulary Schema
const ADVANCED_VOCABULARY_SCHEMA = z.object({
    suggestedVocabulary: z.array(z.object({
        term: z.string(),
        reason: z.string(),
    })),
});

// Rewritten Paragraph Schema
const ADVANCED_REWRITTEN_PARAGRAPH_SCHEMA = z.object({
    comment: z.string(),
    bestUpgradeAnswer: z.string(),
    vocabularies: z.array(z.object({
        vocabularyUse: z.string(),
        reasonUse: z.string(),
    })),
    sentences: z.array(z.object({
        sentencesUse: z.string(),
        reasonUse: z.string(), 
    })),
});
```

## 18. Security & Middleware

### 18.1. Authentication
- JWT-based authentication với custom prefix
- Token storage trong database với TTL
- Multiple token support cho mỗi user

### 18.2. Middleware Protection
- `UserIdMiddleware`: Xác thực user ID từ token
- `LimitedRequestsMiddleware`: Giới hạn số request
- `SupperKeyMiddleware`: Bảo vệ super key endpoints
- `TimeoutInterceptor`: Timeout protection (1 phút)
- `BankingActiveKeyMiddleware`: Bảo vệ banking endpoints

### 18.3. Rate Limiting
- Áp dụng cho các endpoint scoring sensitive
- Custom decorators để extract thông tin từ headers

## 19. OpenAI Service Integration

### 19.1. Mô tả
Service tích hợp với OpenAI API để thực hiện các tác vụ chấm điểm và phân tích văn bản.

### 19.2. Core Methods

#### 19.2.1. HSK5 Scoring Methods
```typescript
async getDataFromChatGPT_HSK5_530003(
    messages: any, 
    jsonSchema: any, 
    languageCode: I18NEnum = I18NEnum.EN,
    model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI,
    temperature = ChatGPTTemperatureEnum.T1
): Promise<any>
```

```typescript
async getDataFromChatGPT_HSK5_530002(
    requiredWords: string,
    messages: any, 
    jsonSchema: any, 
    languageCode: I18NEnum = I18NEnum.EN,
    model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI,
    temperature = ChatGPTTemperatureEnum.T1
): Promise<any>
```

#### 19.2.2. HSK6 Scoring Method
```typescript
async getDataFromChatGPT_HSK6_630001(
    messages: any, 
    jsonSchema: any, 
    languageCode: I18NEnum = I18NEnum.EN,
    model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI,
    temperature = ChatGPTTemperatureEnum.T1
): Promise<any>
```

#### 19.2.3. Error Checking Methods
```typescript
async getDataFromChatGPT_ForCheckErrorsSpelling(
    messages: any, 
    jsonSchema: any, 
    languageCode: I18NEnum = I18NEnum.EN,
    model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI,
    temperature = ChatGPTTemperatureEnum.T1
): Promise<any>
```

```typescript
async getDataFromChatGPT_ForCheckErrorsGrammar(
    messages: any, 
    jsonSchema: any, 
    languageCode: I18NEnum = I18NEnum.EN,
    model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI,
    temperature = ChatGPTTemperatureEnum.T1
): Promise<any>
```

### 19.3. Key Features

#### 19.3.1. Retry Mechanism
- Tự động retry tối đa 3 lần khi gặp lỗi
- Validation kết quả trước khi trả về
- Logging chi tiết các lần thử

#### 19.3.2. Content Filtering
- Lọc từ ngữ không phù hợp (trợ từ, giới từ, liên từ)
- Kiểm tra độ dài từ (tối đa 4 ký tự)
- Phát hiện từ trùng lặp
- Loại bỏ từ bắt buộc khỏi danh sách lỗi

#### 19.3.3. Quality Assurance
- Kiểm tra số lượng vocabulary suggestions tối thiểu
- Kiểm tra số lượng sentence suggestions tối thiểu
- Validate độ dài câu trả lời
- Kiểm tra có chứa ký tự Latin trong explanation

### 19.4. Error Handling
- Sentry integration cho error tracking
- JSON repair cho response không hợp lệ
- Fallback mechanism khi API thất bại