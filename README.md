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

## 6. Helper Services

### 6.1. DetailTasksService

#### 6.1.1. File Operations
- `readJsonFile(filePath)`: Đọc file JSON
- `writeJsonFile(filePath, jsonData)`: Ghi file JSON  
- `readFileLines(filePath)`: Đọc file theo từng dòng

#### 6.1.2. Text Processing
- `checkSpacesBeginOfLines(text)`: Kiểm tra khoảng trắng đầu dòng
- `removePersonalOpinionSentences(text)`: Loại bỏ câu ý kiến cá nhân
- `extractChineseCharacters(text)`: Trích xuất ký tự Trung Quốc
- `countTokenText(text)`: Đếm token trong text

#### 6.1.3. Data Processing
- `getRandomSubarray(arr, size)`: Lấy mảng con ngẫu nhiên
- `uniqueObjectsByTerm(arr)`: Loại bỏ object trùng lặp
- `checkUpgradeObj_HSK6(upgradeObjHSK6)`: Validate object HSK6
- `containsLatin(text)`: Kiểm tra có chứa ký tự Latin

### 6.2. KeyValueService

#### 6.2.1. Internationalization Methods
- `getValueFromKeyEnum(languageCode, keyword)`: Lấy giá trị theo ngôn ngữ
- `getValueFromKeyInputRoleChatGPTEnum(languageCode, keyword)`: Lấy prompt role
- `getValueFromKeyCriteriaEnum(languageCode, keyword)`: Lấy tiêu chí đánh giá

## 7. Cache Module

### 7.1. CacheService

#### 7.1.1. Redis Operations
- `get(key)`: Lấy giá trị từ cache
- `set(key, value, ttl?)`: Lưu vào cache với TTL tùy chọn
- `delete(key)`: Xóa khỏi cache
- `onModuleInit()`: Reset Redis khi khởi động

## 8. Data Validation với Zod

### 8.1. Schema Definitions

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

## 9. Security & Middleware

### 9.1. Authentication
- JWT-based authentication với custom prefix
- Token storage trong database với TTL
- Multiple token support cho mỗi user

### 9.2. Middleware Protection
- `UserIdMiddleware`: Xác thực user ID từ token
- `LimitedRequestsMiddleware`: Giới hạn số request
- `SupperKeyMiddleware`: Bảo vệ super key endpoints
- `TimeoutInterceptor`: Timeout protection (1 phút)

### 9.3. Rate Limiting
- Áp dụng cho các endpoint scoring sensitive
- Custom decorators để extract thông tin từ headers

## 10. Purchase & MIA Token System

### 10.1. MIA Token Types
- **MIA Premium**: Gói cơ bản
- **MIA Token**: Gói token riêng lẻ  
- **MIA Custom**: Gói tùy chỉnh

### 10.2. Usage Flow
1. Kiểm tra lượt chấm còn lại
2. Thực hiện chấm điểm
3. Trừ lượt chấm sau khi thành công
4. Cập nhật số lượt còn lại

## 11. Error Handling

### 11.1. Error Types
- **INVALID**: Dữ liệu đầu vào không hợp lệ
- **PICTURE_INVALID**: Hình ảnh không tồn tại
- **OUT_OF_TURNS**: Hết lượt chấm
- **TIMEOUT**: Quá thời gian xử lý

### 11.2. Error Monitoring
- **Sentry Integration**: Theo dõi lỗi tự động
- **File Logging**: Ghi log chi tiết để debug
- **Structured Responses**: Phản hồi lỗi có cấu trúc

## 12. Multi-language Support (I18N)

### 12.1. Supported Languages
- **English (EN)**: Ngôn ngữ mặc định cho người dùng quốc tế
- **Vietnamese (VI)**: Ngôn ngữ cho người dùng Việt Nam

### 12.2. Localized Content
- Prompt templates cho ChatGPT
- Error messages
- Evaluation criteria descriptions
- Overall evaluation feedback

## 13. Configuration

### 13.1. Database Configuration
- MySQL với TypeORM
- Database: `admin_hsk`
- Connection pooling và optimization

### 13.2. JWT Configuration
- Secret: Configurable via environment
- No expiration (noTimestamp: true)
- Custom prefix format: `${userId}.${token}`

### 13.3. OpenAI Configuration
- Base URL: `https://api.openai.com/v1`
- Multiple model support
- Temperature settings (0-2)
- Usage tracking và cost management

## 14. Deployment & Environment

### 14.1. Environment Variables
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=admin_hsk

# JWT
JWT_SECRET=your_jwt_secret_here

# OpenAI
OPENAI_API_KEY=your_openai_key_here

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 14.2. File Structure Requirements
```
uploads/
├── logs/
│   └── scoring.txt
└── mia/
    └── user-test.json

src/config/
├── blacklist/
│   └── zh.txt
└── translate/
    ├── HSK4_430002.json
    ├── HSK5_530003.json
    └── HSK6_630001.json
```

## 15. API Testing

### 15.1. Example Test Cases

#### 15.1.1. HSK4 Test
```bash
curl -X POST "http://localhost:3000/scoring/hsk4/430002?aiType=1" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "languageCode": "vi",
    "questionId": "40928",
    "imgUrl": "https://example.com/image.jpg",
    "requiredWord": "仔细",
    "answer": "女士仔细地欣赏画廊里的一幅画。"
  }'
```

#### 15.1.2. System Info Test
```bash
curl -X GET "http://localhost:3000/system/info"
```

### 15.2. Swagger Documentation
- Truy cập Swagger UI tại: `http://localhost:3000/api`
- Đầy đủ API documentation với examples
- Interactive testing interface

## 16. Performance & Optimization

### 16.1. Request Timeout
- Tất cả scoring endpoints có timeout 60 giây
- TimeoutInterceptor tự động hủy request quá thời gian

### 16.2. Database Optimization
- Indexing trên các trường quan trọng
- Connection pooling
- Query optimization

### 16.3. Caching Strategy
- Redis caching cho dữ liệu static
- In-memory caching cho user sessions
- File-based caching cho translation data

## 17. Monitoring & Logging

### 17.1. Application Monitoring
- Sentry error tracking
- Performance metrics
- Usage analytics

### 17.2. Logging
- Structured logging với timestamp
- Error logging với stack traces
- ChatGPT usage logging với tokens

### 17.3. Health Checks
- Database connectivity
- Redis connectivity (nếu enabled)
- OpenAI API status

---

## 📚 Additional Resources

- **Swagger API Docs**: `/api` endpoint
- **Health Check**: `/health` endpoint  
- **System Info**: `/system/info` endpoint

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment** 
   ```bash
   cp .env.example .env
   # Edit .env với thông tin database và API keys
   ```

3. **Run Database Migrations**
   ```bash
   npm run migration:run
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

5. **Access API Documentation**
   ```
   http://localhost:3000/api
   ```

## 📞 Support

Để được hỗ trợ kỹ thuật, vui lòng liên hệ team development hoặc tạo issue trong repository.

---

**© 2024 HSK API System - All Rights Reserved**