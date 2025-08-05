import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, SerializeOptions, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiConsumes} from "@nestjs/swagger";
import { UserId } from "../../../decorators/get-current-user-id.decorator"
import { WrapUpService } from "./wrapup.service";
import { GetSupperKey } from "src/decorators/get-supper-key.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateMissionDto, CreateRankingnDto, MissionOptionDto, PaginateRankingFilterDto, SynchronizeMissionsUsersArrayDto } from "./dtos/wrapup.dto";

@ApiTags('Wrap Up')
@Controller("wrapup")
export class WrapUpController {
    constructor(
        private readonly wrapUpService: WrapUpService,        
    ) {}

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Get()
    async getInfoWrapUp(@UserId() user_id: string){
        return await this.wrapUpService.getInfoWrapUp(user_id)
    }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Lấy ra thông tin nhiệm vụ của người dùng'})
    @Get("mission")
    async getMission(@UserId() user_id: string, @Query() missionOptionDto: MissionOptionDto){
        return await this.wrapUpService.getMission(user_id, missionOptionDto)
    }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Đẩy data nhiệm vụ lên database'})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('missionData'))
    @Post("mission")
    async addDataMission(@UploadedFile() file: Express.Multer.File, @Body() createMissionDto: CreateMissionDto){
        return await this.wrapUpService.addDataMission(file)
    }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Đẩy data fake ranking'})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('rankingData'))
    @Post("fake-ranking")
    async addDataRanking(@UploadedFile() file: Express.Multer.File, @Body() createRankingnDto: CreateRankingnDto){
        return await this.wrapUpService.addDataRanking(file)
    }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Đồng bộ nhiệm vụ với người dùng'})
    @Put("mission/synchronize")
    async updateDataMission(@UserId() user_id: string, @Body() synchronizeMissionsUsersArrayDto: SynchronizeMissionsUsersArrayDto){
        return await this.wrapUpService.updateDataMission(user_id, synchronizeMissionsUsersArrayDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình tạo mới ebook' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @ApiOperation({summary: 'Xoá tất cả ranking, đồng bộ, nhiệm vụ Tết'})
    @Delete("/mission")
    async deleteEbookUser(@GetSupperKey() key_use: string) {
        return await this.wrapUpService.deleteWrapupMissions(key_use)
    }
    
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Lấy ra bảng xếp hạng top và của người dùng'})
    @Get("mission/ranking")
    async getRanking(@UserId() user_id: string, @Query() paginateRankingFilterDto: PaginateRankingFilterDto){
        return await this.wrapUpService.getRanking(user_id, paginateRankingFilterDto)
    }
}