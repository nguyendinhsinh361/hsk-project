import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionTestRepository } from './question-test.repository';
import { PurchaseService } from '../purchase/purchase.service';
import { json } from 'stream/consumers';
import { KindTestEnum } from '../scoring/enums/kind.enum';
import { AccountRepository } from '../user/account/account.repository';
import { idQuestionTestBeforeGenAI, testAccount, idsQuestionTestGenAiAvailable, HSK_PDF_VERSION } from 'src/common/constants/constant';
import * as Sentry from "@sentry/node";
import { TYPE_SKILL_MAP } from 'src/common/constants/constant';
import { GetQuestionTestCustomByTypeDto, InputGetQuestionTestCustomDto, InputGetQuestionTestCustomLanguageDto } from './dtos/question-test.dto';
import { LanguageTitleEnum, QuestionTestKindEnum, QuestionTestVersionEnum } from './enum/question-test.enum';
import * as fs from 'fs'
import * as path from 'path'
import { In } from 'typeorm';
import { LevelHSKEnum } from '../practice-writing/enums/kindQuestion.enum';
const projectPath = process.cwd()
const HSK_TITLE_EXAM = 'src/config/translate/hsk_title_exam.json'
const EXAM_FREE_2025 = 'src/config/exam/exam_free_2025.json'
const fileHSK_TITLE_EXAMPath = path.resolve(projectPath, HSK_TITLE_EXAM)
const fileEXAM_FREE_2025Path = path.resolve(projectPath, EXAM_FREE_2025)

@Injectable()
export class QuestionTestService {
    constructor(
        private readonly questionTestRepository: QuestionTestRepository,
        private readonly purchaseService: PurchaseService,
        private readonly accountRepository: AccountRepository,
    ) { }

    async getTitleExamLanguage(title: string, language: string): Promise<any> {
        try {
            const titleCheck = title.trim().toLowerCase()
            if (titleCheck.includes("hsk")) {
                return title
            }
            const regex = /test\s*(\d+)/i;
            const match = title.match(regex);
            const number = match ? match[1] : null;
            const fileContent = await fs.promises.readFile(fileHSK_TITLE_EXAMPath, 'utf8');
            const languaeTitle = JSON.parse(fileContent);
            const findIndexExamSkill = ["listening", "reading", "writing"].findIndex(item => titleCheck.toLowerCase().includes(item))
            let eleSkill = ""
            if (findIndexExamSkill > -1) {
                eleSkill = ` - ${languaeTitle[language].skill[findIndexExamSkill]}`
            }

            if (titleCheck.includes("new")) {
                return languaeTitle[language].new.replace("___", number) + eleSkill
            } else if (titleCheck.includes("advance")) {
                return languaeTitle[language].advance.replace("___", number) + eleSkill
            } 
            return languaeTitle[language].original.replace("___", number) + eleSkill
        } catch (error) {
          throw new Error('Error get title exam language');
        }
    }

    removeExplainField(data) {
        for (let i = 0; i < data.length; i++) {
            let content = data[i].content;
            for (let j = 0; j < content.length; j++) {
                let questions = content[j].Questions;
                for (let k = 0; k < questions.length; k++) {
                    let contentItems = questions[k].content;
                    for (let l = 0; l < contentItems.length; l++) {
                        contentItems[l].explain = {
                            vi: "X",
                            en: "X",
                            ko: "X",
                            fr: "X",
                            ja: "X",
                            ru: "X"
                        }
                    }
                }
            }
        }
        return data;
    }

    async getQuestionTestCustom(user_id: string, questionTestId: string, inputGetQuestionTestCustomDto: InputGetQuestionTestCustomDto) {
        try {
            const {type, language, version} = inputGetQuestionTestCustomDto
            const questionTestDetail = await this.questionTestRepository.findOneById(+questionTestId)
            const ADVANCE_TEST = 3
            const checkPremiumUser = await this.purchaseService.getPurchaseByUserId(+user_id)
            let flagPremium = false
            if (checkPremiumUser.length) {
                flagPremium = checkPremiumUser[0].is_premium
            }
            const questionPartsRaw = JSON.parse(questionTestDetail.parts)
            const questionParts = questionPartsRaw.map(part => {
                return {
                    ...part,
                    content: part.content.map(questions => {
                        return {
                            ...questions,
                            Questions: questions.Questions.map(question => {
                                return {
                                    ...question,
                                    scores: question.scores.length && (question.scores[0] == null || question.scores[0] == "null") ? [] : question.scores
                                }
                            })
                        }
                    })
                }
            })
            
            const responseResult = {
                "Err": null,
                "Questions": {
                    "id": questionTestDetail.id,
                    // "title": questionTestDetail.title,
                    "title": version == QuestionTestVersionEnum.V1 ? questionTestDetail.title : JSON.parse(questionTestDetail.title_lang)[language] + ` (ID: ${questionTestDetail.id})`,
                    "time": questionTestDetail.time,
                    "parts": questionParts,
                },
            }
            const fileContent = await fs.promises.readFile(fileEXAM_FREE_2025Path, 'utf8');
            const examFree2025 = JSON.parse(fileContent);
            const isCheckQuestionTestFirstFromLevel = examFree2025.some(ele => ele.ids.includes(+questionTestDetail.id))
            if (!flagPremium && !isCheckQuestionTestFirstFromLevel) {
                const newParts = this.removeExplainField(responseResult.Questions.parts)
                responseResult.Questions.parts = newParts
            }

            if (type) {
                const parts_name = TYPE_SKILL_MAP[type]
                responseResult.Questions.parts = responseResult.Questions.parts.filter(item => item.name == parts_name)
            }

            return responseResult
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async getExamV2Custom(user_id: string, examId: string, inputGetQuestionTestCustomLanguageDto: InputGetQuestionTestCustomLanguageDto) {
        try {
            const {language, version} = inputGetQuestionTestCustomLanguageDto
            const questionTestDetail = await this.questionTestRepository.findOneById(+examId)
            const ADVANCE_TEST = 3
            const checkPremiumUser = await this.purchaseService.getPurchaseByUserId(+user_id)
            let flagPremium = false
            if (checkPremiumUser.length) {
                flagPremium = checkPremiumUser[0].is_premium
            }

            const responseResult = {
                "Err": null,
                "Questions": {
                    "id": questionTestDetail.id,
                    // "title": questionTestDetail.title,
                    "title": version == QuestionTestVersionEnum.V1 ? questionTestDetail.title : JSON.parse(questionTestDetail.title_lang)[language] + ` (ID: ${questionTestDetail.id})`,
                    "time": questionTestDetail.time,
                    "parts": JSON.parse(questionTestDetail.parts),
                },
            }
            const fileContent = await fs.promises.readFile(fileEXAM_FREE_2025Path, 'utf8');
            const examFree2025 = JSON.parse(fileContent);
            const isCheckQuestionTestFirstFromLevel = examFree2025.some(ele => ele.ids.includes(+examId))
            if (!flagPremium && !isCheckQuestionTestFirstFromLevel) {
                const newParts = this.removeExplainField(responseResult.Questions.parts)
                responseResult.Questions.parts = newParts
            }
            return responseResult
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }


    async getIdQuestionTest(userId: string, level: number, inputGetQuestionTestCustomLanguageDto: InputGetQuestionTestCustomLanguageDto) {
        try {
            const {language, version} = inputGetQuestionTestCustomLanguageDto
            const questionTestDetail = await this.questionTestRepository.query(`SELECT id, title, title_lang, time, created_at, updated_at, payment_type FROM questions_test WHERE level = ? and active = 1 and type = 1 ORDER BY CASE WHEN title LIKE '%(New)' THEN 0 ELSE 1 END, CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(title, 'Test ', -1), ' ', 1) AS UNSIGNED) ASC`, [level])
            questionTestDetail.forEach((item, index) => {
                questionTestDetail[index].linkPdfEN = `${process.env.FOLDER_HSK_PDF_EN}/hsk${level}_${item.id}.pdf?v=${HSK_PDF_VERSION}`
                questionTestDetail[index].linkPdfVI = `${process.env.FOLDER_HSK_PDF_VI}/hsk${level}_${item.id}.pdf?v=${HSK_PDF_VERSION}`
            })

            if (userId) {
                const user = await this.accountRepository.findOne({ where: { id: userId } })
                if (testAccount.includes(user.email)) {
                    return {
                        Err: null,
                        Questions: questionTestDetail.map((item) => {
                            return {
                                id: item.id,
                                // title: item.title,
                                title: version == QuestionTestVersionEnum.V1 ? item.title : JSON.parse(item.title_lang)[language] + ` (ID: ${item.id})`,
                                time: item.time,
                                created_at: item.created_at,
                                updated_at: item.updated_at,
                                linkPdfEN: item.linkPdfEN,
                                linkPdfVI: item.linkPdfVI,
                                payment_type: item.payment_type,
                                tag: item.title.includes("(New)") ? (language == LanguageTitleEnum.VI ? "Mới" : "New") : null
                            }
                        })
                    }

                }
            }
            return {
                Err: null,
                Questions: questionTestDetail.map((item) => {
                    return {
                        id: item.id,
                        // title: item.title,
                        title: version == QuestionTestVersionEnum.V1 ? item.title : JSON.parse(item.title_lang)[language] + ` (ID: ${item.id})`,
                        time: item.time,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        linkPdfEN: item.linkPdfEN,
                        linkPdfVI: item.linkPdfVI,
                        payment_type: item.payment_type,
                        tag: item.title.includes("(New)") ? (language == LanguageTitleEnum.VI ? "Mới" : "New") : null
                    }
                })
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }

    async getListExamIdsByType(userId: string, getQuestionTestCustomByTypeDto: GetQuestionTestCustomByTypeDto) {
        const {level, type, language, version} = getQuestionTestCustomByTypeDto
        try {
            const questionTestDetail = await this.questionTestRepository.query(`SELECT id, title, title_lang, time, type, created_at, updated_at, payment_type FROM questions_test WHERE level = ? and active = 1 and type = ? ORDER BY CASE WHEN title LIKE '%(New)' THEN 0 ELSE 1 END, CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(title, 'Test ', -1), ' ', 1) AS UNSIGNED) ASC`, [level, +type])
            if(+type == +QuestionTestKindEnum.FULL_TEST) {
                questionTestDetail.forEach((item, index) => {
                    questionTestDetail[index].linkPdfEN = `${process.env.FOLDER_HSK_PDF_EN}/hsk${level}_${item.id}.pdf?v=${HSK_PDF_VERSION}`
                    questionTestDetail[index].linkPdfVI = `${process.env.FOLDER_HSK_PDF_VI}/hsk${level}_${item.id}.pdf?v=${HSK_PDF_VERSION}`
                })
            }

            if (userId) {
                const user = await this.accountRepository.findOne({ where: { id: userId } })
                if (testAccount.includes(user.email)) {
                    return {
                        Err: null,
                        Questions: questionTestDetail.map((item) => {
                            return {
                                id: item.id,
                                // title: item.title,
                                title: version == QuestionTestVersionEnum.V1 ? item.title : JSON.parse(item.title_lang)[language] + ` (ID: ${item.id})`,
                                time: item.time,
                                created_at: item.created_at,
                                updated_at: item.updated_at,
                                linkPdfEN: item.linkPdfEN,
                                linkPdfVI: item.linkPdfVI,
                                payment_type: item.payment_type,
                                tag: item.title.includes("(New)") ? (language == LanguageTitleEnum.VI ? "Mới" : "New") : null
                            }
                        })
                    }

                }
            }
            return {
                Err: null,
                Questions: questionTestDetail.map((item) => {
                    return {
                        id: item.id,
                        // title: item.title,
                        title: version == QuestionTestVersionEnum.V1 ? item.title : JSON.parse(item.title_lang)[language] + ` (ID: ${item.id})`,
                        time: item.time,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        linkPdfEN: item.linkPdfEN,
                        linkPdfVI: item.linkPdfVI,
                        payment_type: item.payment_type,
                        tag: item.title.includes("(New)") ? (language == LanguageTitleEnum.VI ? "Mới" : "New") : null
                    }
                })
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
        }
    }
    processTestArray(arrTitle, level) {
        if (+level == +LevelHSKEnum.HSK7) {
            return arrTitle
        }
        // Tìm số thứ tự lớn nhất của các test không có từ "New"
        const maxNonNewTest = arrTitle
            .filter(item => !item.title.includes('(New)'))
            .map(item => parseInt(item.title.match(/\d+/)[0]))
            .reduce((max, current) => Math.max(max, current), 0)
    
        // Xử lý các test có từ "(New)"
        const processedArray = arrTitle
            .filter(item => item.title.includes('(New)'))
            .map(item => {
                const number = parseInt(item.title.match(/\d+/)[0])
                return {
                    ...item,
                    title: `Test ${number + maxNonNewTest}`
                };
            });
    
        return [...arrTitle.filter(item => !item.title.includes('(New)')), ...processedArray].sort((a, b) => a.id - b.id)
    }

    async updateTitle(getQuestionTestCustomByTypeDto: GetQuestionTestCustomByTypeDto) {
        const {language, type, level, version} = getQuestionTestCustomByTypeDto
        const allQuestionTestRawV1 = await this.questionTestRepository.query(`SELECT id, title, parts FROM questions_test WHERE active = 1 and type = ? and level = ? ORDER BY created_at desc`, [type, level])
        let allQuestionTestRaw = allQuestionTestRawV1.map(item => {
            return {
                id: item.id,
                title: `${item.title}`
            }
        })
        if(+type == +QuestionTestKindEnum.SKILL_TEST) {
            allQuestionTestRaw = allQuestionTestRawV1.map(item => {
                const parts = JSON.parse(item.parts)
                return {
                    id: item.id,
                    title: `${item.title} - ${parts[0].name}`
                }
            })
        }

        const fileContent = await fs.promises.readFile(fileHSK_TITLE_EXAMPath, 'utf8');
        const languaeTitle = JSON.parse(fileContent);
        const results = []
        const allQuestionTest = this.processTestArray(allQuestionTestRaw, level)

        for (const item of allQuestionTest) {
            const titleCheck = item.title.trim().toLowerCase()

            const regex = /test\s*(\d+)/i;

            const match = item.title.match(regex);

            const number = match ? match[1] : null;
            const titleLanguageNew = Object.fromEntries(
                Object.entries(languaeTitle).map(([lang, data]) => {
                    const findIndexExamSkill = ["listening", "reading", "writing", "speaking", "translation"].findIndex(item => titleCheck.toLowerCase().includes(item))
                    let eleSkill = ""
                    if (findIndexExamSkill > -1) {
                        eleSkill = ` - ${languaeTitle[lang]["skill"][findIndexExamSkill]}`
                    }
                    if (titleCheck.includes("null") || titleCheck.includes("hsk") || titleCheck.includes("sample")) {
                        return [lang, eleSkill ? data["key_exam_sample"] + eleSkill : data["key_exam_sample"]] 
                    }
                    
                    if (titleCheck.includes("new")) {
                        return [lang, data["new"].replace("___", number) + eleSkill]
                    } 
                    return [lang, data["original"].replace("___", number) + eleSkill]
                })
            );
            results.push({
                id: item.id,
                title: titleLanguageNew.en,
                title_lang: titleLanguageNew
            })
        }
        
        // Build SQL query for batch update
        const updateQueries = results.map(item => {
            return this.questionTestRepository.query(
                `UPDATE questions_test SET title = ?, title_lang = ? WHERE id = ?`,
                [item.title, JSON.stringify(item.title_lang), item.id]
            );
        });
        
        // Execute all updates in parallel
        await Promise.all(updateQueries);
        return results
    }

    async updatePremiumTypeQuestionTest() {
        const fileContent = await fs.promises.readFile(fileEXAM_FREE_2025Path, 'utf8');
        const examFree2025 = JSON.parse(fileContent);
        const ids = examFree2025.flatMap(ele => ele.ids);
        
        if (ids.length > 0) {
            // Sử dụng một câu query duy nhất với mệnh đề IN
            await this.questionTestRepository.query(
                `UPDATE questions_test SET payment_type = "FREE" WHERE id IN (?)`,
                [ids]
            );
        }
        
        return {
            message: `Cập nhật thành công ${ids.length} đề thi`
        };
    }
}