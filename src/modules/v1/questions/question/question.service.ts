import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionRepository } from './question.repository';
import { MakeQuestionDto } from '../../practice-writing/dtos/makeQuestion.dto';
import { KindQuestionDto } from '../../practice-writing/dtos/kindQuestion.dto';
import { IQuestion, IQuestionContent, IQuestionGeneral } from './interfaces/question.interface';
import { IResponse } from '../../../../common/interfaces/response.interface';
import { SystemService } from '../../../../modules/system/system.service';
import { PurchaseRepository } from '../../purchase/purchase.reponsitory';
import { AccountRepository } from '../../user/account/account.repository';
import { KindQuestion } from '../../practice-writing/enums/kindQuestion.enum';
import { CountQuestionInDay } from '../../practice-writing/enums/countQuestionInDay.enum';
import { ConfigService } from '@nestjs/config';
import { PaginateFilterDto } from '../../../../common/dtos/paginate.dto';
import { UpvoteQuestionDto } from '../../practice-writing/dtos/upvoteQuestion.dto';
import { QuestionCommentVoteService } from '../vote/comment-vote.service';
import { QuestionCommentService } from '../comment/comment.service';
import { IdsDto } from '../../../../common/dtos/ids.dto';
import { QuestionPracticeDto } from './dtos/question-practice.dto';
import { PurchaseService } from '../../purchase/purchase.service';
import * as Sentry from "@sentry/node";
const KIND_NOT_LOCK = [
    "110001", "110002", "120001", "120002",
    "210001", "210002", "220001", "220002",
    "310001", "320001",
    "410001", "420001",
    "510001", "520001",
    "610001", "620001",
    "HSKKSC1", "HSKKSC2",
    "HSKKTC1", "HSKKTC2",
    "HSKKCC1", "HSKKCC2",
]

const KIND_HAS_MORE_CORRECT_ANSWER = ["330001", "430001"]

@Injectable()
export class QuestionService {
    constructor(
        private readonly questionRepository: QuestionRepository,
        private readonly systemService: SystemService,
        private readonly purchaseRepository: PurchaseRepository,
        private readonly purchaseService: PurchaseService,
        private readonly accountRepository: AccountRepository,
        private readonly configService: ConfigService,
        private readonly questionCommentVoteService: QuestionCommentVoteService,
        private readonly questionCommentService: QuestionCommentService,
    ) { }

    async getAllQuestionOption(user_id: string, paginateFilterDto: PaginateFilterDto) {
        try {
            const { page, limit, filter, kind } = paginateFilterDto
            if (!kind || !user_id) {
                throw new HttpException(
                    `Bad request`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            const allQuestionByKind = await this.questionRepository.getAllQuestionOption(user_id, kind, limit, page, filter)
            const allQuestionByKindJson = await Promise.all(allQuestionByKind.map(async (ele) => {
                const questionVoteCommentDetail = await this.questionCommentVoteService.checkUserQuestionUpvote({ userId: +user_id, questionId: ele.id })
                const userId = ((ele.source).split("-"))[1]
                let detailUser = {}
                if (typeof (+userId) === 'number' && ele.source.includes("premium-"))
                    detailUser = await this.accountRepository.findOne({
                        where: { id: ((ele.source).split("-"))[1] },
                        select: ["id", "name", "email", "avatar"]
                    })
                const totalComment = await this.questionCommentService.getTotalComment(ele.id)
                await this.updateTotalComment(ele.id, totalComment)

                let isUpvote = 0
                if (questionVoteCommentDetail) {
                    isUpvote = questionVoteCommentDetail.upvoteQuestion
                }
                return {
                    ...ele,
                    general: JSON.parse(ele.general),
                    content: JSON.parse(ele.content),
                    isUpvote: isUpvote,
                    totalComment: totalComment,
                    infoUser: detailUser
                }
            }))
            const dataResponse: IResponse = {
                message: `Get questions by kind ${kind} successfully`,
                data: allQuestionByKindJson,
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async checkCountQuestionInDay(kindInput: string, currentQuestion: number, maxQuestion: number) {
        try {
            if (currentQuestion >= maxQuestion)
                throw new HttpException(
                    `The number of questions of type ${kindInput} reached the maximum during the day`,
                    HttpStatus.TOO_MANY_REQUESTS,
                );
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async createQuestionForPremium(user_id: string, kindQuestionDto: KindQuestionDto, makeQuestionDto: MakeQuestionDto, file: any) {
        try {
            if (!file && (kindQuestionDto.kind == KindQuestion.KIND_530003 || kindQuestionDto.kind == KindQuestion.KIND_430002)) {
                throw new HttpException(
                    `File is error`,
                    HttpStatus.NOT_ACCEPTABLE,
                );
            }
            let imagePath = ""
            let imageSize = 0
            let fullImagePath = ""
            if (file) {
                imagePath = file.path
                imageSize = file.size
                fullImagePath = `${this.configService.get<string>(
                    'app.domain',
                )}/${imagePath.replace(/\\/g, '/')}`;
            }
            try {
                if (!user_id) {
                    throw new HttpException(
                        `Invalid token`,
                        HttpStatus.FORBIDDEN,
                    );
                }
                const SIZE_LIMIT = 1024 * 200

                if (imageSize > SIZE_LIMIT) {
                    throw new HttpException(
                        `Please choose a file whose size does not exceed 200KB`,
                        HttpStatus.PAYLOAD_TOO_LARGE,
                    );
                }
                const detailUser = await this.accountRepository.findByCondition({ id: user_id })

                // Check User Premium
                const currentTime = await this.systemService.time()
                const checkIsPremium = await this.purchaseRepository.findOne({ where: { idUser: user_id }, order: { createdAt: 'DESC' } })
                if (!checkIsPremium || +checkIsPremium.timeExpired <= +currentTime)
                    throw new HttpException(
                        `Please upgrade to Premium`,
                        HttpStatus.BAD_REQUEST,
                    );

                // Check Total Question In Day
                const currentTimeDay = (new Date()).setHours(0, 0, 0, 0);
                const sourceData = `premium-${user_id}-${kindQuestionDto.kind}-${currentTimeDay}`

                const questionFromUserPremium = await this.questionRepository.findMultiple({ source: sourceData })
                let total_question_again = 0
                if (kindQuestionDto.kind == KindQuestion.KIND_430002) {
                    total_question_again = CountQuestionInDay.KIND_430002 - questionFromUserPremium.length
                    await this.checkCountQuestionInDay(kindQuestionDto.kind, questionFromUserPremium.length, CountQuestionInDay.KIND_430002)
                } else if (kindQuestionDto.kind == KindQuestion.KIND_530002) {
                    total_question_again = CountQuestionInDay.KIND_530002 - questionFromUserPremium.length
                    await this.checkCountQuestionInDay(kindQuestionDto.kind, questionFromUserPremium.length, CountQuestionInDay.KIND_530002)
                } else if (kindQuestionDto.kind == KindQuestion.KIND_530003) {
                    total_question_again = CountQuestionInDay.KIND_530003 - questionFromUserPremium.length
                    await this.checkCountQuestionInDay(kindQuestionDto.kind, questionFromUserPremium.length, CountQuestionInDay.KIND_530003)
                } else if (kindQuestionDto.kind == KindQuestion.KIND_630001) {
                    total_question_again = CountQuestionInDay.KIND_630001 - questionFromUserPremium.length
                    await this.checkCountQuestionInDay(kindQuestionDto.kind, questionFromUserPremium.length, CountQuestionInDay.KIND_630001)
                }

                const questionContent: IQuestionContent = {
                    Q_text: "",
                    Q_audio: "",
                    Q_image: fullImagePath,
                    A_text: [],
                    A_audio: [],
                    A_image: [],
                    A_correct: [],
                    explain: {
                        vi: "",
                        en: "",
                    }
                }

                const questionGeneral: IQuestionGeneral = {
                    G_text: [],
                    G_text_translate: {
                        vi: "",
                        en: "",
                    },
                    G_text_audio: "",
                    G_text_audio_translate: {
                        vi: "",
                        en: "",
                    },
                    G_audio: [],
                    G_image: [],
                }

                if (kindQuestionDto.kind !== KindQuestion.KIND_630001) {
                    questionContent.Q_text = makeQuestionDto.question
                } else {
                    questionGeneral.G_text = [makeQuestionDto.question]
                }

                const questionForm: IQuestion = {
                    title: detailUser.name,
                    general: JSON.stringify(questionGeneral),
                    content: JSON.stringify([questionContent]),
                    level: +kindQuestionDto.kind[0],
                    levelOfDifficult: null,
                    kind: kindQuestionDto.kind,
                    correctAnswers: null,
                    checkAdmin: 2,
                    countQuestion: 1,
                    tag: "Writing",
                    score: null,
                    checkExplain: 0,
                    titleTrans: null,
                    source: sourceData,
                    scoreDifficult: 0
                }

                const newQuestionFromUserPremium = await this.questionRepository.create(questionForm)
                const dataResponse: IResponse = {
                    message: `Create new question from for user_premium with id ${user_id} successfully`,
                    data: {
                        "total_question": total_question_again
                    },
                };
                return dataResponse
            } catch (error) {
                if (error.status === HttpStatus.PAYLOAD_TOO_LARGE) {
                    throw new HttpException(
                        `Please choose a file whose size does not exceed 200KB`,
                        HttpStatus.PAYLOAD_TOO_LARGE,
                    );
                }
                throw error
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async upvoteQuestion(user_id: string, upvoteQuestionDto: UpvoteQuestionDto) {
        try {
            if (!user_id) {
                throw new HttpException(
                    `Invalid token`,
                    HttpStatus.FORBIDDEN,
                );
            }

            const { questionId, isLike } = upvoteQuestionDto

            const findCommentDetail = await this.questionRepository.findOneById(questionId)
            const questionVoteCommentDetail = await this.questionCommentVoteService.checkUserQuestionUpvote({ userId: +user_id, questionId })

            if (isLike) {
                await this.questionRepository.update(questionId, { totalLike: findCommentDetail.totalLike + 1 })
                if (questionVoteCommentDetail) {
                    await this.questionCommentVoteService.updateUserQuestionUpvote(questionVoteCommentDetail.id, { upvoteQuestion: 1 })
                } else {
                    await this.questionCommentVoteService.createUserQuestionUpvote({ userId: +user_id, questionId, upvoteQuestion: 1 })
                }
            } else {
                if (findCommentDetail.totalLike > 0)
                    await this.questionRepository.update(questionId, { totalLike: findCommentDetail.totalLike - 1 })
                if (questionVoteCommentDetail) {
                    await this.questionCommentVoteService.updateUserQuestionUpvote(questionVoteCommentDetail.id, { upvoteQuestion: 0 })
                }
            }

            const dataResponse: IResponse = {
                message: `Update question has id ${upvoteQuestionDto.questionId} successfully`,
                data: [],
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async checkExistQuestion(idsDto: IdsDto) {
        try {
            const { ids } = idsDto
            const questionExistCheck = await this.questionRepository.checkExistQuestion(ids)
            const questionExistResult = questionExistCheck.map(ele => ele.id)
            const dataResponse: IResponse = {
                message: `Get questions exist successfully`,
                data: questionExistResult,
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async updateTotalComment(id: number, totalComment: number) {
        try {
            await this.questionRepository.update(id, { totalComment })
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async getQuestionPractice(user_id: string, questionPracticeDto: QuestionPracticeDto) {
        try {
            const { kind } = questionPracticeDto
            let checkIsPremium = []
            if (user_id) checkIsPremium = await this.purchaseService.getPurchaseByUserId(+user_id)
            const listQuestionRandomRaw = await this.questionRepository.getQuestionPracticeRandom(questionPracticeDto)

            const listQuestionRandomClean = listQuestionRandomRaw.map(ele => {
                const content = JSON.parse(ele.content)
                const eleMap = {
                    ...ele,
                    general: JSON.parse(ele.general),
                    content: content.map(eleContent => {
                        return {
                            ...eleContent,
                            A_more_correct: eleContent.A_correct
                        }
                    }),
                }
                return eleMap
            })
            const result = {
                "Err": null,
                "Questions": {
                    "Time": 0,
                    "Questions": listQuestionRandomClean
                }
            }
            if (!user_id || !checkIsPremium.length || !checkIsPremium[0].is_premium) {
                if (KIND_NOT_LOCK.includes(kind)) {
                    return result
                }
                throw new HttpException(
                    `Please upgrade to Premium`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            return result
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async fixContentQuestionForPdf(id: number, replaceText: string) {
        // 42941, 42945, 43017
        const queryT = `SELECT * FROM admin_hsk.questions where id = ?;`
        const questions = await this.questionRepository.query(queryT, [id])
        let newQuestion = questions[0]
        newQuestion.content = JSON.parse(newQuestion.content)
        newQuestion.content[0].Q_text = newQuestion.content[0].Q_text.replace(replaceText, "\n[[\u2605")
        await this.questionRepository.update(+id, { content: JSON.stringify(newQuestion.content) })
        return { message: 'Success' }
    }
}