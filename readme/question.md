# Questions Management API Documentation

## Tổng quan

API quản lý hệ thống câu hỏi, bình luận, vote và báo cáo cho ứng dụng Migii HSK. Bao gồm tạo câu hỏi Premium, comment system, vote system và theory error reporting. Hệ thống hỗ trợ premium access control và community interaction.

## Mục lục

- [Question Management](#question-management)
  - [POST /question/check-exist](#post-questioncheck-exist)
  - [GET /question/get-question-practice](#get-questionget-question-practice)
  - [POST /question/report-theory](#post-questionreport-theory)
- [Comment System](#comment-system)
- [Vote System](#vote-system)
- [Report System](#report-system)
- [Data Transfer Objects](#data-transfer-objects)
- [Business Logic](#business-logic)

---

## Question Management

### POST `/question/check-exist`

Kiểm tra tồn tại của danh sách câu hỏi theo IDs.

**URL:** `/question/check-exist`  
**Method:** `POST`  
**Authentication:** None  

#### Request Body

```json
{
  "ids": ["123", "456", "789"]
}
```

#### Response

```json
{
  "message": "Get questions exist successfully",
  "data": [123, 456]
}
```

---

### GET `/question/get-question-practice`

Lấy câu hỏi luyện tập random theo kind và level.

**URL:** `/question/get-question-practice`  
**Method:** `GET`  
**Authentication:** Optional  

#### Query Parameters

| Parameter         | Type   | Required | Default | Description                    |
|-------------------|--------|----------|---------|--------------------------------|
| device_id         | string | No       | null    | ID thiết bị                    |
| platforms         | enum   | No       | "ios"   | ios/android                    |
| kind              | enum   | Yes      | -       | Loại câu hỏi (110001-750003)  |
| lang              | string | No       | null    | Ngôn ngữ                       |
| level             | enum   | No       | "1"     | Level HSK (1-7, 101-103)       |
| limit             | number | No       | 10      | Số lượng câu hỏi (max 50)     |

#### Response

```json
{
  "Err": null,
  "Questions": {
    "Time": 0,
    "Questions": [
      {
        "id": 123,
        "title": "HSK 4 Reading Question",
        "general": {
          "G_text": ["General text"],
          "G_audio": ["audio1.mp3"],
          "G_image": ["image1.jpg"]
        },
        "content": [
          {
            "Q_text": "Question text",
            "Q_audio": "question_audio.mp3",
            "Q_image": "question_image.jpg",
            "A_text": ["A", "B", "C", "D"],
            "A_audio": [],
            "A_image": [],
            "A_correct": [1, 0, 0, 0],
            "A_more_correct": [1, 0, 0, 0],
            "explain": {
              "vi": "Giải thích",
              "en": "Explanation"
            }
          }
        ],
        "level": 4,
        "kind": "420001",
        "countQuestion": 1
      }
    ]
  }
}
```

#### Error Response

**Premium Required:**
- **Code:** 402 Payment Required
- **Content:**
```json
{
  "message": "Please upgrade to Premium",
  "statusCode": 402
}
```

---

### POST `/question/report-theory`

Báo cáo lỗi trong phần lý thuyết HSK.

**URL:** `/question/report-theory`  
**Method:** `POST`  
**Authentication:** Optional  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "questionId": "123",
  "platform": "ios",
  "content": "Lỗi hiển thị từ vựng không chính xác",
  "kind": "0",
  "language": "vi",
  "appVersion": "2.1.0"
}
```

#### Request Body Fields

| Field      | Type   | Required | Description                      |
|------------|--------|----------|----------------------------------|
| questionId | string | Yes      | ID câu hỏi/lý thuyết             |
| platform   | string | Yes      | Platform (ios/android/web)       |
| content    | string | Yes      | Nội dung báo cáo lỗi             |
| kind       | enum   | Yes      | 0=Từ vựng, 1=Ngữ pháp            |
| language   | string | No       | Ngôn ngữ (vi/en)                 |
| appVersion | string | No       | Phiên bản app                    |

#### Response

```json
{
  "message": "Create new report for theory successfully!",
  "data": {
    "id": 456,
    "userId": 123,
    "questionId": "123",
    "platform": "ios",
    "content": "Lỗi hiển thị từ vựng",
    "kind": 0,
    "language": "vi"
  }
}
```

---

## Comment System

### Features (via Practice Writing API)

- **Nested Comments:** Support 2 levels (parent → child)
- **User Info:** Include user name, email, avatar
- **Vote Integration:** Like/unlike comments
- **Language Support:** Multi-language comments

### Database Schema

```sql
CREATE TABLE questions_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  content LONGTEXT NOT NULL,
  parent_id INT DEFAULT NULL,
  `like` INT DEFAULT 0,
  status TINYINT DEFAULT 0,
  language VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Vote System

### Features

- **Question Votes:** Like/unlike questions
- **Comment Votes:** Like/unlike comments
- **Vote Tracking:** Track user votes để prevent duplicate
- **Count Management:** Auto update like counts

### Database Schema

```sql
CREATE TABLE questions_comments_vote (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT DEFAULT NULL,
  comment_id INT DEFAULT NULL,
  upvote_question INT DEFAULT 1,
  upvote_comment INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Report System

### Comment Reports

```sql
CREATE TABLE questions_comments_report (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT DEFAULT NULL,
  comment_id INT DEFAULT NULL,
  content LONGTEXT DEFAULT NULL,
  active INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Theory Error Reports

```sql
CREATE TABLE theory_error (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  platform VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  note VARCHAR(255) DEFAULT "",
  status INT DEFAULT 1,
  kind INT DEFAULT 0,
  language VARCHAR(255) DEFAULT "vi",
  app_version VARCHAR(255) DEFAULT "",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Data Transfer Objects

### QuestionPracticeDto

```typescript
interface QuestionPracticeDto {
  device_id?: string;                    // Optional - Device ID
  platforms?: PlatformsEnum;             // Optional - ios/android
  kind: KindPracticeQuestionEnum;        // Required - Question type
  lang?: string;                         // Optional - Language
  level?: LevelHSKEnum;                  // Optional - HSK level
  limit?: number;                        // Optional - Max 50 questions
}
```

### TheoryReportDto

```typescript
interface TheoryReportDto {
  questionId: string;      // Required - Theory/question ID
  platform: string;       // Required - Platform
  content: string;         // Required - Error description
  kind: string;           // Required - 0=Vocabulary, 1=Grammar
  language?: string;      // Optional - Language (vi/en)
  appVersion?: string;    // Optional - App version
}
```

---

## Business Logic

### Premium Access Control

#### Free Users
- **Limited Access:** Chỉ access được các kind trong `KIND_NOT_LOCK`
- **Kind List:** `["110001", "110002", "120001", "120002", ...]`
- **Free Kinds:** Basic listening, reading questions

#### Premium Users  
- **Full Access:** Tất cả question kinds
- **Advanced Features:** Writing, speaking questions
- **Premium Kinds:** `["330001", "430001", "530002", "630001", ...]`

### Question Types

#### Question Structure
```javascript
{
  "general": {
    "G_text": ["General text content"],
    "G_audio": ["general_audio.mp3"],
    "G_image": ["general_image.jpg"]
  },
  "content": [
    {
      "Q_text": "Question text",
      "Q_audio": "question_audio.mp3", 
      "Q_image": "question_image.jpg",
      "A_text": ["Option A", "Option B", "Option C", "Option D"],
      "A_correct": [1, 0, 0, 0],
      "explain": {
        "vi": "Giải thích tiếng Việt",
        "en": "English explanation"
      }
    }
  ]
}
```

#### Kind Categories
- **110001-120004:** HSK 1-2 Listening & Reading
- **210001-220004:** HSK 2 Advanced
- **310001-330002:** HSK 3 All Skills
- **410001-430002:** HSK 4 All Skills + Writing
- **510001-530003:** HSK 5 All Skills + Advanced Writing
- **610001-630001:** HSK 6 All Skills + Advanced Writing

### Premium Question Creation

#### Daily Limits
- **HSK 4 Writing (430002):** 3 questions/day
- **HSK 5 Writing (530002):** 3 questions/day  
- **HSK 5 Essay (530003):** 1 question/day
- **HSK 6 Writing (630001):** 1 question/day

#### Image Requirements
- **Max Size:** 200KB
- **Required For:** HSK 5 Essay, HSK 4 Writing
- **Formats:** JPG, PNG, GIF
- **Storage:** Local với public URLs

### Random Question Selection

```javascript
// Special kind handling
if (kind === "410003") {
  kindFinal = ["410003_1", "410003_2"]; // Split into sub-types
  limitPerKind = Math.floor(limit / 2);
}

// Random selection with ORDER BY RAND()
const questions = await repository
  .createQueryBuilder("question")
  .where("question.kind = :kind", { kind })
  .andWhere("question.level = :level", { level })
  .andWhere("question.checkAdmin IN (1,3,4)")
  .orderBy("RAND()")
  .take(limit)
  .getMany();
```

### Error Reporting

#### Theory Error Types
- **Vocabulary Errors (kind=0):** Sai nghĩa, phát âm, ví dụ
- **Grammar Errors (kind=1):** Sai công thức, cách dùng, ví dụ
- **Platform Tracking:** ios/android/web
- **Version Tracking:** App version cho debugging

#### Comment Moderation
- **Report Reasons:** Inappropriate content, spam, harassment
- **Admin Review:** Manual review system
- **Auto Actions:** High report count → auto hide

Questions Management API cung cấp hệ thống comprehensive cho việc practice questions với premium access control, community features và comprehensive error reporting.