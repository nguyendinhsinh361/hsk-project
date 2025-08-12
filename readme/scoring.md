# Scoring API Documentation

## Tổng quan

API quản lý hệ thống chấm điểm AI cho bài viết HSK (4, 5, 6) của ứng dụng Migii HSK, sử dụng ChatGPT để đánh giá và cung cấp feedback chi tiết cho người học. Hệ thống hỗ trợ đa ngôn ngữ, quản lý lượt chấm MiA và tích hợp với Purchase system.

## Mục lục

- [Scoring Management](#scoring-management)
  - [POST /scoring/hsk4/430002](#post-scoringhsk4430002)
  - [POST /scoring/hsk5/530002](#post-scoringhsk5530002)
  - [POST /scoring/hsk5/530003](#post-scoringhsk5530003)
  - [POST /scoring/hsk6/630001](#post-scoringhsk6630001)
- [Data Transfer Objects](#data-transfer-objects)
- [Enums](#enums)
- [Business Logic](#business-logic)
- [Error Handling](#error-handling)

---

## Scoring Management

### POST `/scoring/hsk4/430002`

Chấm điểm bài viết HSK 4 - Task 2 (Viết câu mô tả tranh).

**URL:** `/scoring/hsk4/430002`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| aiType    | enum   | No       | 1       | 1=Luyện tập, 2=Thi thử         |

#### Request Body

```json
{
  "languageCode": "vi",
  "questionId": "40928",
  "imgUrl": "https://domain.com/images/hsk4_image.jpg",
  "requiredWord": "看书",
  "answer": "这个人在图书馆看书。"
}
```

#### Request Body Fields

| Field        | Type   | Required | Description              |
|--------------|--------|----------|--------------------------|
| languageCode | enum   | No       | Ngôn ngữ hiển thị (vi/en) |
| questionId   | string | Yes      | ID câu hỏi               |
| imgUrl       | string | Yes      | URL hình ảnh đề bài      |
| requiredWord | string | Yes      | Từ bắt buộc sử dụng      |
| answer       | string | Yes      | Câu trả lời của học viên |

#### Response

**Success Response:**
- **Code:** 200 OK (existing result) / 201 Created (new result)
```json
{
  "miaTotal": 45,
  "idAIScoring": 123,
  "status": true,
  "message": "SUCCESS",
  "data": {
    "answerEvaluation": [
      {
        "criteria": "Content and Task Response",
        "score": "Good",
        "analysis": "Bài viết mô tả đúng nội dung hình ảnh",
        "improvementTips": "Nên mô tả chi tiết hơn"
      }
    ],
    "overallEvaluation": "Bạn có kiến thức tốt...",
    "imageDescription": "Một người đang đọc sách trong thư viện",
    "suggestedVocabulary": [
      {
        "term": "图书馆",
        "reason": "tú shū guǎn"
      }
    ],
    "suggestedSentence": ["这个人正在图书馆里认真地看书。"],
    "score": "6-8",
    "scoreDetail": 7.5
  }
}
```

#### Error Responses

**Payment Required:**
- **Code:** 402 Payment Required
```json
{
  "isTurnScoring": true,
  "message": "Bạn đã sử dụng hết lượt chấm."
}
```

**Picture Invalid:**
- **Code:** 400 Bad Request
```json
{
  "miaTotal": 0,
  "idAIScoring": null,
  "status": false,
  "message": "PICTURE_INVALID",
  "data": {}
}
```

---

### POST `/scoring/hsk5/530002`

Chấm điểm bài viết HSK 5 - Task 2 (Viết đoạn văn với từ cho trước).

**URL:** `/scoring/hsk5/530002`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "languageCode": "vi",
  "questionId": "41542",
  "requiredWord": "环境、保护、污染、发展、责任",
  "answer": "  环境保护是每个人的责任。随着经济的快速发展，环境污染问题越来越严重。\n  我们应该采取有效措施来保护环境，减少污染。这不仅是为了我们自己，也是为了子孙后代。"
}
```

#### Response Fields

| Field                      | Type   | Description                |
|----------------------------|--------|----------------------------|
| topicWordInAnswer          | number | Số từ chủ đề có trong bài  |
| suggestedRewrittenParagraph| string | Đoạn văn được viết lại     |
| score                      | string | Thang điểm (1-10, 11-20, 21-30) |

---

### POST `/scoring/hsk5/530003`

Chấm điểm bài viết HSK 5 - Task 3 (Viết đoạn văn mô tả tranh).

**URL:** `/scoring/hsk5/530003`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "languageCode": "vi",
  "questionId": "41557",
  "imgUrl": "https://domain.com/images/hsk5_image.jpg",
  "answer": "  这幅图描述了一个美丽的公园场景。在图片中，我们可以看到许多人在享受户外活动。\n  有些人在散步，有些人在锻炼身体。这个公园有绿色的草地和高大的树木，环境非常优美。"
}
```

---

### POST `/scoring/hsk6/630001`

Chấm điểm bài viết HSK 6 - Task 1 (Viết bài tóm tắt).

**URL:** `/scoring/hsk6/630001`  
**Method:** `POST`  
**Authentication:** Required  
**Rate Limiting:** Yes  

#### Request Body

```json
{
  "languageCode": "vi",
  "questionId": "44836",
  "title": "科技发展对社会的影响",
  "requiredParagraph": "科技的快速发展给人类社会带来了巨大的变化...",
  "answer": "  科技发展对现代社会产生了深远的影响。随着人工智能、大数据等技术的普及，我们的生活方式发生了根本性的改变。\n  虽然科技带来了便利，但也带来了新的挑战。我们需要在享受科技带来的好处的同时，也要注意其可能产生的负面影响。"
}
```

#### Response Features

- **Character count:** Yêu cầu tối thiểu 400 ký tự
- **Score range:** 1-30, 31-50, 51-80, 81-100
- **Personal opinion detection:** Phát hiện ý kiến cá nhân không phù hợp

---

## Data Transfer Objects

### ScoringHSK4_430002InputDto

```typescript
interface ScoringHSK4_430002InputDto {
  languageCode?: I18NEnum;  // Optional - Ngôn ngữ hiển thị
  questionId: string;       // Required - ID câu hỏi
  imgUrl: string;          // Required - URL hình ảnh
  requiredWord: string;    // Required - Từ bắt buộc
  answer: string;          // Required - Câu trả lời
}
```

### AnswerEvaluationOutputDto

```typescript
interface AnswerEvaluationOutputDto {
  topicWordInAnswer?: number;              // Optional - Số từ chủ đề
  answerEvaluation: HSKAnswerEvaluationDto[]; // Required - Đánh giá chi tiết
  overallEvaluation: string;               // Required - Đánh giá tổng quan
  imageDescription?: string;               // Optional - Mô tả hình ảnh
  score: string;                          // Required - Thang điểm
  scoreDetail?: number;                   // Optional - Điểm chi tiết
  suggestedVocabulary: HSKSuggestedVocabularyDto[]; // Required - Từ vựng gợi ý
  suggestedSentence: any;                 // Required - Câu gợi ý
  suggestedRewrittenParagraph?: string;   // Optional - Đoạn văn viết lại
}
```

### HSKAnswerEvaluationDto

```typescript
interface HSKAnswerEvaluationDto {
  criteria: string;        // Required - Tiêu chí đánh giá
  score?: string;         // Optional - Điểm theo tiêu chí
  analysis: string;       // Required - Phân tích chi tiết
  improvementTips?: string; // Optional - Lời khuyên cải thiện
}
```

---

## Enums

### AITypeEnum

```typescript
enum AITypeEnum {
  PRACTICE = 1,  // Luyện tập
  EXAM = 2       // Thi thử
}
```

### I18NEnum

```typescript
enum I18NEnum {
  EN = "en",  // English
  VI = "vi"   // Tiếng Việt
}
```

### MessageScoringEnum

```typescript
enum MessageScoringEnum {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR", 
  INVALID = "INVALID",
  PICTURE_INVALID = "PICTURE_INVALID"
}
```

### Score Scales

```typescript
// HSK 4
enum ScaleScoreHSK4Enum {
  SCALE_0 = "0",
  SCALE_1_5 = "1-5",
  SCALE_6_8 = "6-8", 
  SCALE_9_10 = "9-10"
}

// HSK 5
enum ScaleScoreHS5KEnum {
  SCALE_0 = "0",
  SCALE_1_10 = "1-10",
  SCALE_11_20 = "11-20",
  SCALE_21_30 = "21-30"
}

// HSK 6
enum ScaleScoreHSK6Enum {
  SCALE_0 = "0",
  SCALE_1_30 = "1-30",
  SCALE_31_50 = "31-50",
  SCALE_51_80 = "51-80",
  SCALE_81_100 = "81-100"
}
```

---

## Business Logic

### MiA Token Management

#### Token Sources
- **Premium MiA:** Từ purchase subscription
- **Token MiA:** Từ purchase token packages  
- **Custom MiA:** Từ admin awards

#### Usage Priority
1. Check token packages first
2. Fallback to premium MiA
3. Deduct 1 token per scoring request

### Scoring Criteria

#### HSK 4 (430002)
- **Image relevance:** Bài viết có liên quan đến hình ảnh
- **Required word usage:** Sử dụng từ bắt buộc
- **Grammar accuracy:** Độ chính xác ngữ pháp
- **Vocabulary usage:** Sử dụng từ vựng phù hợp

#### HSK 5 (530002/530003)
- **Topic word coverage:** 5 từ chủ đề bắt buộc
- **Character count:** Tối thiểu 80 ký tự
- **Paragraph indentation:** Thụt đầu dòng
- **Coherence:** Tính mạch lạc

#### HSK 6 (630001)
- **Character count:** Tối thiểu 400 ký tự
- **Summary accuracy:** Độ chính xác tóm tắt
- **Personal opinion detection:** Tránh ý kiến cá nhân
- **Academic writing style:** Phong cách viết học thuật

### Pre-scoring Validation

#### Common Checks
- **Minimum word count:** Kiểm tra số từ tối thiểu
- **Spam detection:** Phát hiện từ/câu lặp lại
- **Blacklist words:** Kiểm tra từ ngữ không phù hợp
- **Punctuation usage:** Sử dụng dấu câu hợp lý
- **Presentation format:** Định dạng trình bày

#### Automatic Rejection
```javascript
if (checkInput.isNotEnoughRequiredWordCount || 
    checkInput.isSpamWord || 
    checkInput.isWordInBlaclist || 
    checkInput.isPresentationError) {
  // Return validation errors without AI scoring
  return response;
}
```

### Scoring Algorithm

#### HSK 4 Detailed Scoring
```javascript
const getScoringHSK4_Detail = (input, data) => {
  let score = 0;
  
  // Character count (0.5 points)
  if (textLength >= 8) score += 0.5;
  
  // Image relevance (3.5 points)
  if (isImageRelevant) score += 3.5;
  
  // Coherence (1 point) 
  if (isCoherent) score += 1;
  
  // Vocabulary (max 2 points)
  score += Math.max(0, 2 - vocabularyErrors);
  
  // Grammar (max 3 points)
  score += Math.max(0, 3 - grammarErrors * 1.5);
  
  return score;
};
```

### AI Integration

#### ChatGPT Usage
- **Model:** GPT-4o-mini for cost efficiency
- **Temperature:** 0 for consistent results
- **Schema validation:** Zod schemas for structured output
- **Usage tracking:** Save all API calls for monitoring

#### Multi-step Processing
1. **Criteria analysis:** Grammar, vocabulary, coherence, content
2. **Suggested improvements:** Vocabulary, sentences, paragraphs
3. **Overall evaluation:** Personalized feedback generation
4. **Score calculation:** Algorithmic scoring based on criteria

---

## Error Handling

### Payment Required (402)

```json
{
  "isTurnScoring": true,
  "message": "Bạn đã sử dụng hết lượt chấm."
}
```

**Cause:** User has no remaining MiA tokens  
**Solution:** Purchase more MiA packages

### Validation Errors (200 with invalid data)

```json
{
  "miaTotal": 0,
  "idAIScoring": 123,
  "status": false,
  "message": "INVALID",
  "data": {
    "isNotEnoughRequiredWordCount": true,
    "isNotEnoughRequiredWordCountData": 5,
    "isSpamWord": true,
    "isSpamWordData": [{"key": "好", "counts": 5}]
  }
}
```

### Request Timeout (408)

- **Timeout:** 60 seconds per request
- **Cause:** AI processing takes too long
- **Solution:** Retry or contact support
