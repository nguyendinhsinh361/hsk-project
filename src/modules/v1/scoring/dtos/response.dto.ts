import { ApiProperty } from "@nestjs/swagger";

export class ScoringResponseDto {
    @ApiProperty({
        description: 'Số lượt chấm còn lại',
        required: true,
        example: true
    })
    miaTotal: number;

    @ApiProperty({
        description: 'ID lần chấm',
        required: true,
        example: true
    })
    idAIScoring: any;

    @ApiProperty({
        description: 'Dữ liệu trả về',
        required: true,
        example: true
    })
    data: any;

    @ApiProperty({
        description: 'Có chấm điểm thành công hay không ?',
        required: true,
        example: true
    })
    status: any;

    @ApiProperty({
        description: 'Tin nhắn được hệ thống gửi đến',
        required: true,
        example: true
    })
    message: any;
}

export class CheckTotalScoreRemainngResponseDto {
    @ApiProperty({
        description: 'Bạn đã hết lượt chấm, vui lòng mua thêm lượt chấm',
        required: true,
        example: true
    })
    isTurnScoring: any;

    @ApiProperty({
        description: 'Tin nhắn được hệ thống gửi đến',
        required: true,
        example: true
    })
    message: any;
}