import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class HSKNotConditionCommentOutputDto {
    @ApiProperty({
        description: 'Câu có đủ số từ chủ đề không',
        required: false,
        example: true
    })
    @IsOptional()
    isNotContainsTopicWord?: boolean

    @ApiProperty({
        description: 'Danh sách các từ chưa có',
        required: false,
        example: true
    })
    @IsOptional()
    isNotContainsTopicWordData?: any;

    @ApiProperty({
        description: 'Câu có đủ số lượng từ mà giáo viên đề xuất hay không ?',
        required: true,
        example: true
    })
    isNotEnoughRequiredWordCount: boolean;

    @ApiProperty({
        description: 'Số lượng từ yêu cầu',
        required: true,
        example: true
    })
    isNotEnoughRequiredWordCountData: number;

    @ApiProperty({
        description: 'Bài làm có bị lặp từ, tần suất cao hay không ?',
        required: true,
        example: true
    })
    isSpamWord: boolean;

    @ApiProperty({
        description: 'Danh sách các từ bị spam và số lần của chúng',
        required: true,
        example: true
    })
    isSpamWordData: any;

    @ApiProperty({
        description: 'Bài làm có bị lặp câu, tần suất cao hay không ?',
        required: true,
        example: true
    })
    isSpamSentence: boolean;

    @ApiProperty({
        description: 'Danh sách các câu bị spam',
        required: true,
        example: true
    })
    isSpamSentenceData: string[];

    @ApiProperty({
        description: 'Có sử dụng từ khiếm nhã hay không ?',
        required: true,
        example: true
    })
    isWordInBlaclist: boolean;

    @ApiProperty({
        description: 'Danh sách các từ trong đoạn văn được cho là khiếm nhã',
        required: true,
        example: true
    })
    isWordInBlaclistData: string[];

    @ApiProperty({
        description: 'Có lỗi sử dụng dấu cấu hợp lý hay không ?',
        required: true,
        example: true
    })
    isNotUseReasonablePunctuation: boolean;

    @ApiProperty({
        description: 'Danh sách dấu chấm, dấu phẩy mà người làm sử dụng và số lượng của chúng',
        required: true,
        example: true
    })
    isNotUseReasonablePunctuationData: any;

    @ApiProperty({
        description: 'Có lỗi sử dụng dấu cách không hợp lý hay không ?',
        required: true,
        example: true
    })
    isNotUseReasonableSpacesPunctuation: boolean;

    @ApiProperty({
        description: 'Danh sách cách mà người làm sử dụng và số lượng của chúng',
        required: true,
        example: true
    })
    isNotUseReasonableSpacesPunctuationData: any;

    @ApiProperty({
        description: 'Có lỗi trình bày của dạng hay không ?',
        required: true,
        example: true
    })
    isPresentationError: boolean;

    @ApiProperty({
        description: 'Danh sách dấu chấm, dấu phẩy mà người làm sử dụng và số lượng của chúng',
        required: true,
        example: true
    })
    isPresentationErrorData: any;

}

export class HSKSuggestedVocabularyDto {
    @ApiProperty({
        description: 'Thuật ngữ hoặc từ',
        required: true,
        example: '你好'
    })
    @IsString()
    @IsNotEmpty()
    term: string;

    @ApiProperty({
        description: 'Lý do thay thế hoặc giải thích',
        required: true,
        example: 'nǐ hǎo'
    })
    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class HSKImprovementTipsnDto {
    @ApiProperty({
        description: 'Tiêu chí đánh giá (e.g., Grammatical Range and Accuracy)',
        required: true,
        example: 'Grammatical Range and Accuracy'
    })
    @IsString()
    @IsNotEmpty()
    criteria: string;

    @ApiProperty({
        description: 'Lời khuyên để cải thiện liên quan đến tiêu chí',
        required: false,
        example: 'Practice more complex sentence structures'
    })
    @IsString()
    @IsOptional()
    improvementTips?: string;
}

export class HSKAnswerEvaluationDto {
    @ApiProperty({
        description: 'Tiêu chí đánh giá (e.g., Grammatical Range and Accuracy)',
        required: true,
        example: 'Grammatical Range and Accuracy'
    })
    @IsString()
    @IsNotEmpty()
    criteria: string;

    @ApiProperty({
        description: 'Điểm theo tiêu chí',
        required: false,
        example: ''
    })
    @IsString()
    score?: string;

    @ApiProperty({
        description: 'Phân tích hoặc phản hồi liên quan đến tiêu chí',
        required: true,
        example: ''
    })
    @IsString()
    @IsNotEmpty()
    analysis: string;

    @ApiProperty({
        description: 'Lời khuyên để cải thiện liên quan đến tiêu chí',
        required: false,
        example: 'Practice more complex sentence structures'
    })
    @IsString()
    @IsOptional()
    improvementTips?: string;
}

export class AnswerEvaluationOutputDto {
    @ApiProperty({
        description: 'Số lượng từ bắt buộc có trong câu trả lời của người dùng',
    })
    @IsOptional()
    topicWordInAnswer?: number

    @ApiProperty({
        description: 'Danh sách đánh giá theo các tiêu chí khác nhau',
        type: [HSKAnswerEvaluationDto]
    })
    @IsNotEmpty()
    answerEvaluation: HSKAnswerEvaluationDto[];

    @ApiProperty({
        description: 'Đánh giá chung về câu trả lời',
        required: true,
        example: ''
    })
    @IsString()
    @IsNotEmpty()
    overallEvaluation: string;

    @ApiProperty({
        description: 'Mô tả bất kỳ hình ảnh nào liên quan đến câu trả lời',
        required: false,
        example: ''
    })
    @IsString()
    @IsOptional()
    imageDescription?: string;

    @ApiProperty({
        description: 'Khoảng điểm số của bạn',
        required: true,
        example: ''
    })
    @IsString()
    @IsNotEmpty()
    score: string;

    @ApiProperty({
        description: 'Điểm số chi tiết của bạn',
        required: false,
        example: ''
    })
    @IsNumber()
    scoreDetail?: number;


    @ApiProperty({
        description: 'Gợi ý những từ ngữ ',
        type: [HSKSuggestedVocabularyDto]
    })
    @IsNotEmpty()
    suggestedVocabulary: HSKSuggestedVocabularyDto[];
    

    @ApiProperty({
        description: 'Gợi ý những câu tương tự',
        required: true,
        example: ''
    })
    @IsNotEmpty()
    suggestedSentence: any;

    @ApiProperty({
        description: 'Gợi ý đoạn văn viết lại',
        required: false,
        example: ''
    })
    @IsString()
    @IsOptional()
    suggestedRewrittenParagraph?: string;
}
