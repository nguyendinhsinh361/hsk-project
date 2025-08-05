import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { QuestionCommentService } from "../questions/comment/comment.service";
import { QuestionCommentReportService } from "../questions/report/comment-report.service";
import { QuestionService } from "../questions/question/question.service";
import { CreateCommentDto } from "./dtos/createComment.dto";
import { KindQuestionDto } from "./dtos/kindQuestion.dto";
import { CreateCommentReportDto } from "./dtos/createCommentReport.dto";
import { MakeQuestionDto } from "./dtos/makeQuestion.dto";
import { UserId } from "../../../decorators/get-current-user-id.decorator";
import { PaginateCommentFilterDto, PaginateDto, PaginateFilterDto } from "../../../common/dtos/paginate.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { fileUploadPremiumOptions } from "../../../middleware/file.middleware";
import { UpvoteCommentDto } from "./dtos/upvoteComment.dto";
import { UpvoteQuestionDto } from "./dtos/upvoteQuestion.dto";
import { PracticeWritingService } from "./practice-writing.service";



@ApiTags('Practice-writing')
@Controller("practice-writing")
export class PracticeWritingController {
    constructor(
        private readonly questionCommentService: QuestionCommentService,
        private readonly questionCommentReportService: QuestionCommentReportService,
        private readonly questionService: QuestionService,
        private readonly practiceWritingService: PracticeWritingService
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Lấy nhiều câu hỏi theo các trang'})
    @Get('question')
    async getAllQuestionOption(@UserId() user_id: string, @Query() paginateFilterDto: PaginateFilterDto) {
        return await this.questionService.getAllQuestionOption(user_id, paginateFilterDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Lấy tất cả các bình luận của câu hỏi có id truyền vào'})
    @Get('comment/:questionId')
    async getAllComment(@UserId() user_id: string, @Query() paginateDto: PaginateCommentFilterDto,  @Param("questionId") questionId: string) {
        return await this.questionCommentService.getAllComment(user_id, paginateDto, questionId)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Lấy ra tất cả các bình luận con của một bình luận cụ thể của một câu hỏi cụ thể'})
    @Get('comment-child/:commentId')
    async getAllCommentChild(@UserId() user_id: string,  @Query() paginateDto: PaginateDto, @Param("commentId") commentId: string) {
        return await this.questionCommentService.getAllCommentChild(user_id, paginateDto, commentId)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Thêm một bình luận mới'})
    @Post('comment')
    async addComment(@UserId() user_id: string, @Body() createCommentDto: CreateCommentDto) {
        return await this.questionCommentService.createComment(user_id, createCommentDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Thực hiện like một bình luận cụ thể. isLike = 1/0(tương ứng với like và không like)'})
    @Post('comment/upvote')
    async addCommentUpvote(@UserId() user_id: string, @Body() upvoteCommentDto: UpvoteCommentDto) {
        return await this.questionCommentService.upvoteComment(user_id, upvoteCommentDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Thực hiện like một câu hỏi cụ thể. isLike = 1/0(tương ứng với like và không like)'})
    @Post('question/upvote')
    async addQuestionUpvote(@UserId() user_id: string, @Body() upvoteQuestionDto: UpvoteQuestionDto) {
        return await this.questionService.upvoteQuestion(user_id, upvoteQuestionDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Yêu câu đăng nhập' })
    @ApiResponse({ status: HttpStatus.PAYLOAD_TOO_LARGE, description: 'Vượt quá giới hạn tải lên của file' })
    @ApiResponse({ status: HttpStatus.TOO_MANY_REQUESTS, description: 'Vượt quá số lượng tạo câu hỏi của dạng' })
    @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'File tải lên bị lỗi' })
    @ApiOperation({summary: 'Tạo câu hỏi cho người dùng premium'})
    @ApiConsumes('multipart/form-data')
    @Post('/make-question')
    @UseInterceptors(FileInterceptor('img', fileUploadPremiumOptions))
    async makeQuestionForPremium(
        @UploadedFile() file: Express.Multer.File,
        @UserId() user_id: string, 
        @Query() kindQuestionDto: KindQuestionDto, 
        @Body() makeQuestionDto: MakeQuestionDto,
    ) {
        return await this.questionService.createQuestionForPremium(user_id, kindQuestionDto, makeQuestionDto, file)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @Post('report')
    async reportComment(@UserId() user_id: string, @Body() createCommentReportDto: CreateCommentReportDto) {
        return await this.questionCommentReportService.reportComment(user_id, createCommentReportDto)
    }
}