# Question Test API Documentation

## Tổng quan

API quản lý hệ thống đề thi HSK cho ứng dụng Migii HSK, bao gồm lấy đề thi theo level, type và ngôn ngữ. Hệ thống hỗ trợ đa ngôn ngữ, phân loại theo skill và premium access control.

## Mục lục

- [Question Test Management](#question-test-management)
  - [GET /question-test/:questionTestId](#get-question-testquestiontestid)
  - [GET /question-test/exam-detail/:examId](#get-question-testexam-detailexamid)
  - [GET /question-test/listExamIds/:level](#get-question-testlistexamidslevel)
  - [POST /question-test/list-ids](#post-question-testlist-ids)
  - [PUT /question-test/update-title](#put-question-testupdate-title)
  - [PUT /question-test/update-premium-type](#put-question-testupdate-premium-type)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Business Logic](#business-logic)

---

## Question Test Management

### GET `/question-test/:questionTestId`

Lấy chi tiết đề thi theo ID với filter skill và ngôn ngữ.

**URL:** `/question-test/:questionTestId`  
**Method:** `GET`  
**Authentication:** Required  

#### Path Parameters

| Parameter      | Type   | Required | Description |
|----------------|--------|----------|-------------|
| questionTestId | string | Yes      | ID đề thi   |

#### Query Parameters

| Parameter | Type   | Required | Default | Description                        |
|-----------|--------|----------|---------|------------------------------------|
| type      | number | No       | -       | 0=Listening, 1=Reading, 2=Writing |
| language  | enum   | No       | "en"    | Ngôn ngữ hiển thị                  |
| version   | enum   | No       | "1"     | Version API (1 hoặc 2)             |

#### Response

```json
{
  "Err": null,
  "Questions": {
    "id": 123,
    "title": "HSK 4 Test 1 (ID: 123)",
    "time": 105,
    "parts": [
      {
        "name": "Listening",
        "content": [
          {
            "Questions": [
              {
                "id": 1,
                "content": [
                  {
                    "question": "Question text",
                    "answers": ["A", "B", "C", "D"],
                    "explain": {
                      "vi": "Giải thích",
                      "en": "Explanation"
                    }
                  }
                ],
                "scores": [1, 0, 0, 0]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### GET `/question-test/exam-detail/:examId`

Lấy chi tiết đề thi V2 (không filter skill).

**URL:** `/question-test/exam-detail/:examId`  
**Method:** `GET`  
**Authentication:** Required  

#### Path Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| examId    | string | Yes      | ID đề thi   |

#### Query Parameters

| Parameter | Type   | Required | Default | Description            |
|-----------|--------|----------|---------|------------------------|
| language  | enum   | No       | "en"    | Ngôn ngữ hiển thị      |
| version   | enum   | No       | "1"     | Version API (1 hoặc 2) |

#### Response

```json
{
  "Err": null,
  "Questions": {
    "id": 123,
    "title": "HSK 4 Test 1 (ID: 123)",
    "time": 105,
    "parts": [
      {
        "name": "Listening",
        "content": [...]
      },
      {
        "name": "Reading", 
        "content": [...]
      },
      {
        "name": "Writing",
        "content": [...]
      }
    ]
  }
}
```

---

### GET `/question-test/listExamIds/:level`

Lấy danh sách ID đề thi theo level (chỉ Full Test).

**URL:** `/question-test/listExamIds/:level`  
**Method:** `GET`  
**Authentication:** Optional  

#### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| level     | number | Yes      | Level HSK (1-7) |

#### Response

```json
{
  "Err": null,
  "Questions": [
    {
      "id": 123,
      "title": "HSK 4 Test 1 (ID: 123)",
      "time": 105,
      "created_at": "2024-08-11T10:30:00Z",
      "updated_at": "2024-08-11T10:30:00Z",
      "linkPdfEN": "https://domain.com/pdf/en/hsk4_123.pdf?v=1.0",
      "linkPdfVI": "https://domain.com/pdf/vi/hsk4_123.pdf?v=1.0",
      "payment_type": "FREE",
      "tag": "Mới"
    }
  ]
}
```

---

### POST `/question-test/list-ids`

Lấy danh sách ID đề thi theo type và level.

**URL:** `/question-test/list-ids`  
**Method:** `POST`  
**Authentication:** Optional  

#### Query Parameters

| Parameter | Type   | Required | Default      | Description                    |
|-----------|--------|----------|--------------|--------------------------------|
| type      | enum   | Yes      | "1"          | 1=Full Test, 2=Skill Test, 3=Advance |
| level     | enum   | No       | "1"          | Level HSK (1-7, 101-103)       |
| language  | enum   | No       | "en"         | Ngôn ngữ hiển thị              |
| version   | enum   | No       | "1"          | Version API                    |

#### Response

```json
{
  "Err": null,
  "Questions": [
    {
      "id": 456,
      "title": "HSK 4 Listening Test 1 (ID: 456)",
      "time": 35,
      "created_at": "2024-08-11T10:30:00Z",
      "updated_at": "2024-08-11T10:30:00Z",
      "payment_type": "PREMIUM",
      "tag": null
    }
  ]
}
```

---

### PUT `/question-test/update-title`

Cập nhật title đa ngôn ngữ cho đề thi (Admin only).

**URL:** `/question-test/update-title`  
**Method:** `PUT`  
**Authentication:** None  

#### Query Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| type      | enum   | Yes      | Loại đề thi                    |
| level     | enum   | Yes      | Level HSK                      |
| language  | enum   | No       | Ngôn ngữ reference             |
| version   | enum   | No       | Version API                    |

#### Response

```json
[
  {
    "id": 123,
    "title": "HSK 4 Test 1",
    "title_lang": {
      "vi": "HSK 4 Đề thi 1",
      "en": "HSK 4 Test 1",
      "ja": "HSK4 テスト1",
      "ko": "HSK 4 시험 1",
      "fr": "HSK 4 Test 1",
      "ru": "HSK 4 Тест 1"
    }
  }
]
```

---

### PUT `/question-test/update-premium-type`

Cập nhật payment_type cho đề thi miễn phí (Admin only).

**URL:** `/question-test/update-premium-type`  
**Method:** `PUT`  
**Authentication:** None  

#### Response

```json
{
  "message": "Cập nhật thành công 15 đề thi"
}
```

---

## Data Transfer Objects

### InputGetQuestionTestCustomDto

```typescript
interface InputGetQuestionTestCustomDto {
  type?: number;                    // Optional - Skill filter
  language?: LanguageTitleEnum;     // Optional - Language
  version?: QuestionTestVersionEnum; // Optional - API version
}
```

### GetQuestionTestCustomByTypeDto

```typescript
interface GetQuestionTestCustomByTypeDto {
  type: QuestionTestKindEnum;       // Required - Test type
  level?: LevelHSKEnum;            // Optional - HSK level
  language?: LanguageTitleEnum;     // Optional - Language
  version?: QuestionTestVersionEnum; // Optional - API version
}
```

---

## Enums

### QuestionTestKindEnum

```typescript
enum QuestionTestKindEnum {
  FULL_TEST = "1",      // Đề thi đầy đủ
  SKILL_TEST = "2",     // Đề thi kỹ năng
  ADVANCE_TEST = "3"    // Đề thi nâng cao
}
```

### LanguageTitleEnum

```typescript
enum LanguageTitleEnum {
  VI = "vi",    // Tiếng Việt
  EN = "en",    // English
  JA = "ja",    // 日本語
  KO = "ko",    // 한국어
  FR = "fr",    // Français
  RU = "ru"     // Русский
}
```

### QuestionTestVersionEnum

```typescript
enum QuestionTestVersionEnum {
  V1 = "1",     // Version 1 (title field)
  V2 = "2"      // Version 2 (title_lang field)
}
```

---

## Business Logic

### Premium Access Control

- **Free Users:** Chỉ được xem đề thi trong `exam_free_2025.json`
- **Premium Users:** Truy cập tất cả đề thi với explain đầy đủ
- **Test Accounts:** Special access cho testing
- **Explain Removal:** Free users sẽ có explain = "X"

### Multi-language Support

- **Version 1:** Sử dụng `title` field (English only)
- **Version 2:** Sử dụng `title_lang` JSON field
- **Auto Translation:** Title được tự động translate theo language config
- **Skill Suffix:** Thêm skill name vào title cho Skill Tests

### Test Types

#### Full Test (Type 1)
- **Complete exam** với tất cả skills
- **PDF links** cho download
- **Time limit** thường 105-120 phút
- **Scoring system** đầy đủ

#### Skill Test (Type 2)  
- **Single skill** (Listening/Reading/Writing)
- **Shorter duration** 25-45 phút
- **Focused practice** cho skill cụ thể

#### Advance Test (Type 3)
- **Advanced level** tests
- **Special content** cho level cao
- **Extended time** và complex questions

### Question Structure

```javascript
// Parts → Content → Questions → Content Items
{
  "parts": [
    {
      "name": "Listening",
      "content": [
        {
          "Questions": [
            {
              "id": 1,
              "content": [
                {
                  "question": "...",
                  "answers": ["A", "B", "C", "D"],
                  "explain": {
                    "vi": "Giải thích tiếng Việt",
                    "en": "English explanation"
                  }
                }
              ],
              "scores": [1, 0, 0, 0]
            }
          ]
        }
      ]
    }
  ]
}
```

### PDF Generation

- **Dynamic URLs:** `${DOMAIN}/hsk{level}_{id}.pdf?v={VERSION}`
- **Multi-language:** Separate PDFs cho VI và EN
- **Version Control:** Query param để cache busting
- **Only Full Tests:** Skill tests không có PDF

### Title Processing

- **Test Numbering:** Auto-increment với "(New)" handling
- **Skill Suffix:** Auto-append skill name cho skill tests
- **Language Mapping:** JSON config cho multi-language titles
- **ID Suffix:** Version 2 thêm "(ID: xxx)" vào title

Question Test API cung cấp hệ thống quản lý đề thi HSK comprehensive với multi-language support, premium access control và flexible test types.