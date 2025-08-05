import { ConsoleLogger, HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ChatGPTService } from '../chatgpt/chatgpt.service';
import { ScoringHSK4_430002InputDto, ScoringHSK5_530002InputDto, ScoringHSK5_530003InputDto, ScoringHSK6_630001InputDto } from './dtos/scoring-input.dto';
import * as path from 'path'
import * as fs from 'fs'
const BLACKLIST_ZH = 'src/config/blacklist/zh.txt'
const HSK4_430002 = 'src/config/translate/HSK4_430002.json'
const HSK5_530003 = 'src/config/translate/HSK5_530003.json'
const HSK6_630001 = 'src/config/translate/HSK6_630001.json'
const MIA_TEST = 'uploads/mia/user-test.json'
import * as readline from 'readline';
import { KindTestEnum } from './enums/kind.enum';
import { AnswerEvaluationOutputDto, HSKAnswerEvaluationDto, HSKNotConditionCommentOutputDto, HSKSuggestedVocabularyDto } from './dtos/scoring-output.dto';
import { ScaleScoreHS5KEnum, ScaleScoreHSK4Enum, ScaleScoreHSK6Enum } from './enums/scale-score.enum';
import { CheckTotalScoreRemainngResponseDto, ScoringResponseDto } from './dtos/response.dto';
import { MessageMIATotalEnum, MessageScoringEnum } from './enums/message-scoring.enum';
import { AIResultService } from '../ai-result/ai-result.service';
import { AIRessultDto } from '../ai-result/dtos/ai-result.dto';
import { HSK4OverallEvaluationENEnum, HSK4OverallEvaluationVIEnum, HSK5OverallEvaluationENEnum, HSK5OverallEvaluationVIEnum, HSK6OverallEvaluationENEnum, HSK6OverallEvaluationVIEnum } from './enums/overall-evaluation.enum';
import { OpenAIService } from '../openai/openai.server';
import { ChatGPTUsageRepository } from '../chatgpt/chatgpt.reponsitory';
import { ChatGPTModelEnum, ChatGPTProjectKeyEnum, ChatGPTTemperatureEnum } from '../chatgpt/enums/chatGPT.enum';
import { KeyRoleForKeyMessageConditionEnum } from '../../../modules/i18n/i18n.enum';
import { I18NEnum } from './enums/key.enum';
import { PurchaseService } from '../purchase/purchase.service';
import { AITypeDto } from './dtos/ai-type.dto';
import { AITypeEnum } from './enums/ai-type.enum';
import { CounCharacterHSKEnum } from './enums/count-character-hsk.enum';
import { KeyValueService } from '../../../modules/helper/key-value.service';
const projectPath = process.cwd()
import * as Sentry from "@sentry/node";
import { OVERALL_EVALUATION_SCHEMA } from '../chatgpt/zod/model.zod';
const fileBlacklistZhPath = path.resolve(projectPath, BLACKLIST_ZH)
const fileHSK4_430002Path = path.resolve(projectPath, HSK4_430002)
const fileHSK5_530003Path = path.resolve(projectPath, HSK5_530003)
const fileHSK6_630001Path = path.resolve(projectPath, HSK6_630001)

@Injectable()
export class ScoringService implements OnModuleInit{
    constructor(
        private readonly chatGPTService: ChatGPTService,
        private readonly aIResultService: AIResultService,
        private readonly openAIService: OpenAIService,
        private readonly chatGPTUsageRepository: ChatGPTUsageRepository,
        private readonly purchaseService: PurchaseService,
        private readonly keyValueService: KeyValueService,
    ) {}
    async onModuleInit() {}

    async readFileLines(filePath: string): Promise<string[]> {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });
    
        const lines: string[] = [];
        for await (const line of rl) {
          lines.push(line);
        }
    
        return lines;
    }

    async readJsonFile(filePath: string): Promise<any> {
        try {
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          return JSON.parse(fileContent);
        } catch (error) {
          console.error('Failed to read file:', error);
          throw new Error('Failed to read file');
        }
    }

    async writeJsonFile(filePath: string, jsonData: any) {
        try {
            const jsonString = JSON.stringify(jsonData, null, 2); // Thêm tham số null và 2 để định dạng đẹp JSON
            await fs.promises.writeFile(filePath, jsonString, 'utf8');
            console.log('File saved successfully.');
        } catch (error) {
            console.error('Failed to save file:', error);
            throw new Error('Failed to save file');
        }
    }

    async checkSpacesBeginOfLines(text) {
        const SPACE_BEGINING = "  "
        let paragraphArr = text.split("\n")
        if(paragraphArr.length <= 1) paragraphArr = text.split("\r")
        
        for (let index = 0; index < paragraphArr.length; index++) {
            if(!paragraphArr[index].startsWith(SPACE_BEGINING)) {
                return false
            }
        }
        return true
    }

    async getScoringHSK4(input: ScoringHSK4_430002InputDto, data: any, answerEvaluation: HSKAnswerEvaluationDto[]) {
        let score = ScaleScoreHSK4Enum.SCALE_1_5
        const {
            dataCriteria_GrammaticalRange, 
            dataCriteria_GrammaticalAccuracy, 
            dataCriteria_LexicalResource,
            dataCheckRelatedImage
        } = data
        
        console.log("HSK4_430002", dataCriteria_GrammaticalAccuracy, dataCriteria_GrammaticalRange, dataCriteria_LexicalResource, dataCheckRelatedImage)
        if(dataCriteria_GrammaticalRange > 1 || dataCriteria_LexicalResource >= 3 || !dataCheckRelatedImage) {
            score = ScaleScoreHSK4Enum.SCALE_1_5
        }
        else if(dataCriteria_GrammaticalRange <= 1 && dataCriteria_LexicalResource >= 1 && dataCheckRelatedImage) {
            score = ScaleScoreHSK4Enum.SCALE_6_8
        }
        else {
            score = ScaleScoreHSK4Enum.SCALE_9_10
        }
        return score

    }

    
    async getScoringHSK4_Detail(input: ScoringHSK4_430002InputDto, data: any, answerEvaluation: HSKAnswerEvaluationDto[]) {
        const { requiredWord, answer } = input
        let score = 0
        const {
            dataCriteria_GrammaticalRange, 
            dataCriteria_GrammaticalAccuracy, 
            dataCriteria_LexicalResource,
            dataCheckRelatedImage,
            dataCriteria_CoherenceAndCohesion
        } = data
        
        const regex  = new RegExp("[^a-zA-Z0-9\u4e00-\u9fa5]", "g")
        const textNotContainPunctuation = answer.replace(regex, "");
        const CONDITION_1_COMPLETE_SENTENCE = textNotContainPunctuation.length
        const CONDITION_2_MAKE_SURE_WORD_REQURIED = answer.includes(requiredWord)
        const CONDITION_3_MAKE_SURE_CONTENT_RELEVANT_PICTURE = dataCheckRelatedImage
        const CONDITION_4_MAKE_SURE_COHENRENCE_AND_COHENSION = dataCriteria_CoherenceAndCohesion
        const CONDITION_5_MAKE_SURE_GRAMMATIAL_RANGE = dataCriteria_GrammaticalRange
        const CONDITION_6_MAKE_SURE_WORD_SPELL = dataCriteria_LexicalResource
        const CONDITION_7_MAKE_SURE_GRAMMATIAL_ACCURARY = dataCriteria_GrammaticalAccuracy

        console.log("HSK4_430002", CONDITION_1_COMPLETE_SENTENCE, CONDITION_2_MAKE_SURE_WORD_REQURIED, dataCriteria_GrammaticalRange, 
            dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource, dataCheckRelatedImage, dataCriteria_CoherenceAndCohesion)

        if(CONDITION_1_COMPLETE_SENTENCE >= 8) score += 0.5
        else score += 0

        // if(CONDITION_2_MAKE_SURE_WORD_REQURIED) score += 0.5

        if(CONDITION_3_MAKE_SURE_CONTENT_RELEVANT_PICTURE) score +=3.5

        if(CONDITION_4_MAKE_SURE_COHENRENCE_AND_COHENSION) score += 1

        score += (2 - CONDITION_6_MAKE_SURE_WORD_SPELL*1) > 0 ? (2 - CONDITION_6_MAKE_SURE_WORD_SPELL*1) : 0
        score += (3 - CONDITION_5_MAKE_SURE_GRAMMATIAL_RANGE*1.5) > 0 ? (3 - CONDITION_5_MAKE_SURE_GRAMMATIAL_RANGE*1.5) : 0

        // if(CONDITION_7_MAKE_SURE_GRAMMATIAL_ACCURARY) score += 1


        return score

    }

    async getScoringHSK5_530002(input: ScoringHSK5_530002InputDto, data: any, answerEvaluation: HSKAnswerEvaluationDto[]) {
        let score = ScaleScoreHS5KEnum.SCALE_1_10
        const {
            dataCriteria_CoherenceAndCohesion,
            dataCriteria_GrammaticalAccuracy,
            dataCriteria_LexicalResource
        } = data

        const checkSpacesBeginOfLinesResult = await this.checkSpacesBeginOfLines(input.answer)

        const {requiredWord, answer} = input
        const {isNotContainsTopicWord, isNotContainsTopicWordData} = await this.checkContainsTopicWord(answer, requiredWord)
        if(isNotContainsTopicWord) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_LEXICAL_RESOURCE_HSK5)}: [${isNotContainsTopicWordData.join("，")}]` 
        }
        const countWordsInAnswer = this.countTokenText(answer)
        const iscountWordsInAnswer  = countWordsInAnswer < CounCharacterHSKEnum.HSK5
        if(iscountWordsInAnswer) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_HSK5)}`
        }
        if(!checkSpacesBeginOfLinesResult) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_1)}`
        }
        console.log("HSK5_530002", dataCriteria_CoherenceAndCohesion, dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource, isNotContainsTopicWord, countWordsInAnswer, checkSpacesBeginOfLinesResult)
        if(dataCriteria_GrammaticalAccuracy >= 8 || !dataCriteria_CoherenceAndCohesion || dataCriteria_LexicalResource >= 8 || (isNotContainsTopicWord && isNotContainsTopicWordData.length > 2) || iscountWordsInAnswer) {
            score = ScaleScoreHS5KEnum.SCALE_1_10
        }
        else if(dataCriteria_CoherenceAndCohesion && (dataCriteria_GrammaticalAccuracy >= 1 || dataCriteria_LexicalResource >= 1 || (isNotContainsTopicWordData.length <= 1 && isNotContainsTopicWordData.length != 0) || iscountWordsInAnswer || !checkSpacesBeginOfLinesResult)) {
            score = ScaleScoreHS5KEnum.SCALE_11_20
        }
        else if(dataCriteria_CoherenceAndCohesion && dataCriteria_GrammaticalAccuracy == 0 && dataCriteria_LexicalResource == 0 && !isNotContainsTopicWord && !iscountWordsInAnswer && checkSpacesBeginOfLinesResult) {
            score = ScaleScoreHS5KEnum.SCALE_21_30
        }
        return score
    }


    async getScoringHSK5_Detail_530002(input: ScoringHSK5_530002InputDto, data: any, answerEvaluation: HSKAnswerEvaluationDto[]) {
        const REQUIRED_WORD = 5
        let score = 0
        const {
            dataCriteria_CoherenceAndCohesion,
            dataCriteria_GrammaticalAccuracy,
            dataCriteria_LexicalResource
        } = data

        const checkSpacesBeginOfLinesResult = await this.checkSpacesBeginOfLines(input.answer)

        const {requiredWord, answer} = input
        const {isNotContainsTopicWord, isNotContainsTopicWordData} = await this.checkContainsTopicWord(answer, requiredWord)
        if(isNotContainsTopicWord) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_LEXICAL_RESOURCE_HSK5)}: [${isNotContainsTopicWordData.join("，")}]` 
        }
        const countWordsInAnswer = this.countTokenText(answer)
        const iscountWordsInAnswer  = countWordsInAnswer < CounCharacterHSKEnum.HSK5
        if(iscountWordsInAnswer) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_HSK5)}`
        }
        if(!checkSpacesBeginOfLinesResult) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_1)}`
        }

        const regex  = new RegExp("[^a-zA-Z0-9\u4e00-\u9fa5]", "g")
        const textNotContainPunctuation = answer.replace(regex, "");
        const CONDITION_1_COMPLETE_SENTENCE = textNotContainPunctuation.length
        const CONDITION_2_COUNT_WORD_REQURIED = await this.countTopicWord(answer, requiredWord)
        const CONDITION_3_MAKE_SURE_COHENRENCE_AND_COHENSION = dataCriteria_CoherenceAndCohesion
        const CONDITION_4_MAKE_SURE_WORD_SPELL = dataCriteria_LexicalResource
        const CONDITION_5_MAKE_SURE_GRAMMATIAL_ACCURARY = dataCriteria_GrammaticalAccuracy

        console.log("HSK5_530002", dataCriteria_CoherenceAndCohesion, dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource, isNotContainsTopicWord, countWordsInAnswer, checkSpacesBeginOfLinesResult)
        if(CONDITION_1_COMPLETE_SENTENCE < 80) score += 1
        else if(CONDITION_1_COMPLETE_SENTENCE > 200) score += 1.5
        else score += 2

        for(let index = 0; index < REQUIRED_WORD; index++) {
            if(CONDITION_2_COUNT_WORD_REQURIED == index+1) score += (index + 1)*2
        }


        if(CONDITION_3_MAKE_SURE_COHENRENCE_AND_COHENSION) score += 2
        else score += 0

        score += (8 - CONDITION_4_MAKE_SURE_WORD_SPELL*2) > 0 ? (8 - CONDITION_4_MAKE_SURE_WORD_SPELL*2) : 0
        score += (8 - CONDITION_5_MAKE_SURE_GRAMMATIAL_ACCURARY*2) > 0 ? (8 - CONDITION_5_MAKE_SURE_GRAMMATIAL_ACCURARY*2) : 0

        return score
    }

    async getScoringHSK5_530003(input: ScoringHSK5_530003InputDto, data: any, answerEvaluation: any) {
        let score = ScaleScoreHS5KEnum.SCALE_1_10
        const {
            dataCriteria_CoherenceAndCohesion,
            dataCriteria_GrammaticalAccuracy, 
            dataCriteria_LexicalResource,
            dataCheckRelatedImage
        } = data

        const checkSpacesBeginOfLinesResult = await this.checkSpacesBeginOfLines(input.answer)
        const {imgUrl, answer} = input
        const countWordsInAnswer = this.countTokenText(answer)
        const iscountWordsInAnswer  = countWordsInAnswer < CounCharacterHSKEnum.HSK5
        if(iscountWordsInAnswer) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_HSK5)}`
        }
        if(!checkSpacesBeginOfLinesResult) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_1)}`
        }
        console.log("HSK5_530003", dataCheckRelatedImage, dataCriteria_CoherenceAndCohesion, dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource, countWordsInAnswer, checkSpacesBeginOfLinesResult)
        if(!dataCheckRelatedImage || !dataCriteria_CoherenceAndCohesion ||dataCriteria_GrammaticalAccuracy >= 8 || dataCriteria_LexicalResource >= 8 || iscountWordsInAnswer) {
            score = ScaleScoreHS5KEnum.SCALE_1_10
        }
        else if(dataCheckRelatedImage && dataCriteria_CoherenceAndCohesion && (dataCriteria_GrammaticalAccuracy >= 1 || dataCriteria_LexicalResource >= 1 || iscountWordsInAnswer || !checkSpacesBeginOfLinesResult)) {
            score = ScaleScoreHS5KEnum.SCALE_11_20
        }
        else if(dataCheckRelatedImage && dataCriteria_CoherenceAndCohesion && dataCriteria_GrammaticalAccuracy == 0 && dataCriteria_LexicalResource == 0 && !iscountWordsInAnswer && checkSpacesBeginOfLinesResult) {
            score = ScaleScoreHS5KEnum.SCALE_21_30
        }
        return score
    }


    async getScoringHSK5_Detail_530003(input: ScoringHSK5_530003InputDto, data: any, answerEvaluation: any) {
        let score = 0
        const {
            dataCriteria_CoherenceAndCohesion,
            dataCriteria_GrammaticalAccuracy, 
            dataCriteria_LexicalResource,
            dataCheckRelatedImage
        } = data

        const checkSpacesBeginOfLinesResult = await this.checkSpacesBeginOfLines(input.answer)
        const {imgUrl, answer} = input
        const countWordsInAnswer = this.countTokenText(answer)
        const iscountWordsInAnswer  = countWordsInAnswer < CounCharacterHSKEnum.HSK5
        if(iscountWordsInAnswer) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_HSK5)}`
        }
        if(!checkSpacesBeginOfLinesResult) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_1)}`
        }

        const regex  = new RegExp("[^a-zA-Z0-9\u4e00-\u9fa5]", "g")
        const textNotContainPunctuation = answer.replace(regex, "");
        const CONDITION_1_COMPLETE_SENTENCE = textNotContainPunctuation.length
        const CONDITION_2_MAKE_SURE_CONTENT_RELEVANT_PICTURE = dataCheckRelatedImage
        const CONDITION_3_MAKE_SURE_COHENRENCE_AND_COHENSION = dataCriteria_CoherenceAndCohesion
        const CONDITION_4_MAKE_SURE_WORD_SPELL = dataCriteria_LexicalResource
        const CONDITION_5_MAKE_SURE_GRAMMATIAL_ACCURARY = dataCriteria_GrammaticalAccuracy

        console.log("HSK5_530003", dataCheckRelatedImage, dataCriteria_CoherenceAndCohesion, dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource, countWordsInAnswer, checkSpacesBeginOfLinesResult)
        if(CONDITION_1_COMPLETE_SENTENCE < 80) score += 1
        else if(CONDITION_1_COMPLETE_SENTENCE > 200) score += 1.5
        else score += 2

        if(CONDITION_2_MAKE_SURE_CONTENT_RELEVANT_PICTURE) score += 10
        else score += 1


        if(CONDITION_3_MAKE_SURE_COHENRENCE_AND_COHENSION) score += 2
        else score += 0

        score += (8 - CONDITION_4_MAKE_SURE_WORD_SPELL*2) > 0 ? (8 - CONDITION_4_MAKE_SURE_WORD_SPELL*2) : 0
        score += (8 - CONDITION_5_MAKE_SURE_GRAMMATIAL_ACCURARY*2) > 0 ? (8 - CONDITION_5_MAKE_SURE_GRAMMATIAL_ACCURARY*2) : 0

        return score
    }

    async getScoringHSK6_630001(input: ScoringHSK6_630001InputDto, data: any, answerEvaluation: any) {
        let score = ScaleScoreHSK6Enum.SCALE_1_30
        const {
            dataCriteria_CoherenceAndCohesion,
            dataCriteria_GrammaticalAccuracy, 
            dataCriteria_LexicalResource,
            dataPersonalOpinion
        } = data
        
        const checkSpacesBeginOfLinesResult = await this.checkSpacesBeginOfLines(input.answer)
        
        const {requiredParagraph, answer, title} = input
        const countWordsInAnswer = this.countTokenText(answer)
        const iscountWordsInAnswer  = countWordsInAnswer < CounCharacterHSKEnum.HSK6
        
        console.log("HSK6_630001", dataCriteria_CoherenceAndCohesion, dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource, countWordsInAnswer, checkSpacesBeginOfLinesResult, dataPersonalOpinion.length)
        if((dataCriteria_GrammaticalAccuracy >= 15 && iscountWordsInAnswer) || (dataCriteria_LexicalResource >= 15 && iscountWordsInAnswer)) {
            score = ScaleScoreHSK6Enum.SCALE_1_30
        }
        else if((dataCriteria_CoherenceAndCohesion && dataCriteria_GrammaticalAccuracy > 8 && dataCriteria_GrammaticalAccuracy < 15 && iscountWordsInAnswer) || (dataCriteria_CoherenceAndCohesion && dataCriteria_LexicalResource > 8 && dataCriteria_LexicalResource < 15 && iscountWordsInAnswer)) {
            score = ScaleScoreHSK6Enum.SCALE_31_50
        }
        else if((dataCriteria_CoherenceAndCohesion && dataCriteria_GrammaticalAccuracy >= 1 && dataCriteria_GrammaticalAccuracy <= 8 && !iscountWordsInAnswer && checkSpacesBeginOfLinesResult) || (dataCriteria_CoherenceAndCohesion && dataCriteria_LexicalResource >= 1 && dataCriteria_LexicalResource <= 8 && !iscountWordsInAnswer && checkSpacesBeginOfLinesResult)) {
            score = ScaleScoreHSK6Enum.SCALE_51_80
        }
        else if(title && dataCriteria_CoherenceAndCohesion && dataCriteria_GrammaticalAccuracy <= 0 && dataCriteria_LexicalResource <= 0 && !iscountWordsInAnswer && checkSpacesBeginOfLinesResult && !Boolean(dataPersonalOpinion.length)) {
            score = ScaleScoreHSK6Enum.SCALE_81_100
        }
        if(score == ScaleScoreHSK6Enum.SCALE_81_100) {
            answerEvaluation[3].analysis = `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_HSK6_SATISFY)}`
        } else if(score == ScaleScoreHSK6Enum.SCALE_51_80) {
            answerEvaluation[3].analysis = `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_HSK6_SATISFY_1)}`
        } else if(score == ScaleScoreHSK6Enum.SCALE_31_50 || score == ScaleScoreHSK6Enum.SCALE_1_30) {
            answerEvaluation[3].analysis = `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_HSK6_SATISFY)}`
        }
        
        if(dataPersonalOpinion.length) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_HSK6_PERSONAL_OPINION)}${dataPersonalOpinion.join("，")}`
        }
        if(iscountWordsInAnswer) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_HSK6)}`
        }
        if(!checkSpacesBeginOfLinesResult) {
            answerEvaluation[3].analysis += `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_1)}`
        }
        return score
    }

    async scoringHSK4_430002(input: ScoringHSK4_430002InputDto, user_id: string, aiTypeDto: AITypeDto) {
        try {
            const purcharseMia = await this.purchaseService.getPurchaseByUserIdMia(parseInt(user_id))
            const purcharseMiaToken = await this.purchaseService.getAllPurchaseByUserIdMiaToken(parseInt(user_id))
            const premiumUseMiaCustom = await this.purchaseService.getAllPurchaseByUserIdMiaCustom(parseInt(user_id))
            const allMiaPurchase = [...purcharseMiaToken, ...premiumUseMiaCustom]
            
            const responseCheckMiaTotal: CheckTotalScoreRemainngResponseDto = {
                isTurnScoring: true,
                message: MessageMIATotalEnum.OUT_OF_TURNS
            }
            let checkFlagToken = false
            for(let index=0; index < allMiaPurchase.length; index++) {
                if(allMiaPurchase[index].miaTotal > 0) {
                    checkFlagToken = true
                }
            }

            if((!purcharseMia || !purcharseMia.miaTotal) && (!allMiaPurchase.length || !checkFlagToken)) {
                throw new HttpException(responseCheckMiaTotal, HttpStatus.PAYMENT_REQUIRED)
            }

            let response : ScoringResponseDto = {
                miaTotal: 0,
                idAIScoring: null,
                data: {},
                status: false,
                message: MessageScoringEnum.INVALID
            }
            try {
                if(!input.answer) return response
                const checkInput: HSKNotConditionCommentOutputDto = await this.scoringHSKNotConditionCommon(input, KindTestEnum.HSK4)
                if(checkInput.isNotEnoughRequiredWordCount || checkInput.isNotUseReasonablePunctuation || checkInput.isNotUseReasonableSpacesPunctuation || checkInput.isPresentationError || checkInput.isNotContainsTopicWord || checkInput.isPresentationError || checkInput.isSpamSentence || checkInput.isSpamWord || checkInput.isWordInBlaclist) {
                    response.data = checkInput
                    const aiResultCurrent: AIRessultDto = {
                        userId: parseInt(user_id),
                        questionId: parseInt(input.questionId),
                        result: JSON.stringify(checkInput),
                        userAnswer: JSON.stringify(input),
                        aiType: +aiTypeDto?.aiType,
                        idsChatGPT: JSON.stringify([]),
                    }
                    const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
                    response.idAIScoring = newAIResult.id
                    return response
                }
                const {imgUrl, requiredWord, answer, questionId} = input
                const dataImageTransalte = await this.readJsonFile(fileHSK4_430002Path)
                const findImg = dataImageTransalte.find(ele => (ele.img_url).trim() === imgUrl.trim())
                if(!findImg) {
                    response.message = MessageScoringEnum.PICTURE_INVALID
                    throw new HttpException(response, HttpStatus.BAD_REQUEST) 
                }
                const {
                    dataAdvancedVocabularyResponse, 
                    dataAdvancedSentenceFinalResponse, 
                    dataCriteriaHSK4_430002,
                    listIdsChatGPT,
                    ...data
                } = await this.chatGPTService.scoringHSK4_430002({...input, answer: (input.answer).replace(/ /g, "").replace(/^\n+|\n+$/g, '')}, findImg.img_description)
                const answerEvaluation: HSKAnswerEvaluationDto[]= dataCriteriaHSK4_430002
                const score = await this.getScoringHSK4(input, data, answerEvaluation)
                const scoreDetail = await this.getScoringHSK4_Detail(input, data, answerEvaluation)
                let overallEvaluation = ""
                for (const key in ScaleScoreHSK4Enum) {
                    if (Object.hasOwnProperty.call(ScaleScoreHSK4Enum, key)) {
                        const value = ScaleScoreHSK4Enum[key];
                        if(score === value) {
                            overallEvaluation = HSK4OverallEvaluationENEnum[key]
                            if(input.languageCode == I18NEnum.VI) overallEvaluation = HSK4OverallEvaluationVIEnum[key]

                            const promptOverallEvaluation = await this.chatGPTService.getPromptCriteria_OverallEvaluation(overallEvaluation, input.languageCode)
                            const responseOverallEvaluation = await this.openAIService.getDataFromChatGPT(promptOverallEvaluation, OVERALL_EVALUATION_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0)
                            const saveData = await this.chatGPTService.createCustomChatGPTUsage(promptOverallEvaluation, responseOverallEvaluation,  ChatGPTProjectKeyEnum.HSK_430002)
                            const chatgptForOverallEvaluation = await this.chatGPTUsageRepository.create(saveData)
                            listIdsChatGPT.push(chatgptForOverallEvaluation.id)

                            const regex = /[^\sa-zA-Z0-9.,?!:;'()\u00C0-\u00FF\u0102\u0103\u0110\u0111\u0128-\u1EF9]/g;
                            if(responseOverallEvaluation?.data && responseOverallEvaluation?.data?.overallEvaluation && !(responseOverallEvaluation?.data?.overallEvaluation).match(regex)) {
                                overallEvaluation = responseOverallEvaluation?.data?.overallEvaluation
                            }
                        }
                    }
                }
                const suggestedVocabulary: HSKSuggestedVocabularyDto[] = dataAdvancedVocabularyResponse
                const suggestedSentence: string[] = dataAdvancedSentenceFinalResponse
                const { dataCriteria_GrammaticalRange, dataCriteria_LexicalResource } = data
                answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Tìm thấy \d+ lỗi chính tả trong bài làm\./, `Tìm thấy ${dataCriteria_LexicalResource} lỗi chính tả trong bài làm.`)
                answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Found \d+ spelling errors in the assignment\./, `Found ${dataCriteria_LexicalResource} spelling errors in the assignment.`)
                answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Tìm thấy \d+ lỗi ngữ pháp trong bài làm\./, `Tìm thấy ${dataCriteria_GrammaticalRange} lỗi ngữ pháp trong bài làm.`)
                answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Found \d+ grammatical errors in the assignment\./, `Found ${dataCriteria_GrammaticalRange} grammatical errors in the assignment.`)
                const output: AnswerEvaluationOutputDto = {
                    answerEvaluation: [answerEvaluation[3], answerEvaluation[1], answerEvaluation[0], answerEvaluation[2]],
                    overallEvaluation: overallEvaluation,
                    imageDescription: findImg.img_description,
                    suggestedVocabulary: suggestedVocabulary,
                    suggestedSentence: suggestedSentence,
                    score: score,
                    scoreDetail: scoreDetail
                }
                const aiResultCurrent: AIRessultDto = {
                    userId: parseInt(user_id),
                    questionId: parseInt(questionId),
                    result: JSON.stringify(output),
                    userAnswer: JSON.stringify(input),
                    aiType: +(aiTypeDto?.aiType ? aiTypeDto?.aiType : AITypeEnum.PRACTICE),
                    idsChatGPT: JSON.stringify(listIdsChatGPT),
                }
                const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)

                let checkMiaTokenOutOfTurns = null
                response.miaTotal = 0
                if(allMiaPurchase.length) {
                    checkMiaTokenOutOfTurns = allMiaPurchase.find(ele => ele?.miaTotal > 0)
                    const totalMiaToken = allMiaPurchase.reduce((accumulator, miaToken) => {
                        return accumulator + miaToken.miaTotal;
                    }, 0);
                    if(checkMiaTokenOutOfTurns) {
                        const miaTotalDetail = checkMiaTokenOutOfTurns.miaTotal - 1
                        await this.purchaseService.updateOption(checkMiaTokenOutOfTurns?.id, miaTotalDetail)
                        const miaPreToken = purcharseMia ? purcharseMia.miaTotal : 0
                        response.miaTotal = totalMiaToken + miaPreToken - 1
                    }
                } else if(purcharseMia && !checkMiaTokenOutOfTurns) {
                    const miaTotalDetail = purcharseMia.miaTotal - 1
                    await this.purchaseService.updateOption(purcharseMia?.id, miaTotalDetail)
                    response.miaTotal = miaTotalDetail - 1
                } 

                response.idAIScoring = newAIResult.id
                response.data = output
                response.status = true
                response.message = MessageScoringEnum.SUCCESS
                return response
            } catch (error) {
                response.message = `${error}`
                throw new HttpException(response, HttpStatus.BAD_REQUEST) 
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }

    async scoringHSK5_530002(input: ScoringHSK5_530002InputDto, user_id: string, aiTypeDto: AITypeDto) {
        const purcharseMia = await this.purchaseService.getPurchaseByUserIdMia(parseInt(user_id))
        const purcharseMiaToken = await this.purchaseService.getAllPurchaseByUserIdMiaToken(parseInt(user_id))
        const premiumUseMiaCustom = await this.purchaseService.getAllPurchaseByUserIdMiaCustom(parseInt(user_id))
        const allMiaPurchase = [...purcharseMiaToken, ...premiumUseMiaCustom]

        const responseCheckMiaTotal: CheckTotalScoreRemainngResponseDto = {
            isTurnScoring: true,
            message: MessageMIATotalEnum.OUT_OF_TURNS
        }
        let checkFlagToken = false
        for(let index=0; index < allMiaPurchase.length; index++) {
            if(allMiaPurchase[index].miaTotal > 0) {
                checkFlagToken = true
            }
        }
        if((!purcharseMia || !purcharseMia.miaTotal) && (!allMiaPurchase.length || !checkFlagToken)) {
            throw new HttpException(responseCheckMiaTotal, HttpStatus.PAYMENT_REQUIRED)
        }
        let response : ScoringResponseDto = {
            miaTotal: 0,
            idAIScoring: null,
            data: {},
            status: false,
            message: MessageScoringEnum.INVALID
        }
        const TOPIC_WORD = 5
        try {
            if(!input.answer) return response
            const {isNotContainsTopicWord, isNotContainsTopicWordData} = await this.checkContainsTopicWord(input.answer, input.requiredWord)
            const checkInput: HSKNotConditionCommentOutputDto = await this.scoringHSKNotConditionCommon(input, KindTestEnum.HSK5)
            if(checkInput.isNotEnoughRequiredWordCount || checkInput.isNotUseReasonablePunctuation || checkInput.isNotUseReasonableSpacesPunctuation || checkInput.isPresentationError || isNotContainsTopicWordData.length > 2 || checkInput.isPresentationError || checkInput.isSpamSentence || checkInput.isSpamWord || checkInput.isWordInBlaclist) {
                response.data = checkInput
                const aiResultCurrent: AIRessultDto = {
                    userId: parseInt(user_id),
                    questionId: parseInt(input.questionId),
                    result: JSON.stringify(checkInput),
                    userAnswer: JSON.stringify(input),
                    aiType: +aiTypeDto?.aiType,
                    idsChatGPT: JSON.stringify([]),
                }
                const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
                response.idAIScoring = newAIResult.id
                return response
            }
            const {
                dataAdvancedVocabularyResponse, 
                dataAdvancedSentenceFinalResponse, 
                dataAdvancedParagraphFinalResponse, 
                dataCriteriaHSK5_530002,
                listIdsChatGPT,
                ...data
            } = await this.chatGPTService.scoringHSK5_530002({...input, answer: (input.answer).replace(/ /g, "").replace(/^\n+|\n+$/g, '')})
            const answerEvaluation: HSKAnswerEvaluationDto[]= dataCriteriaHSK5_530002
            const score = await this.getScoringHSK5_530002(input, data, answerEvaluation)
            const scoreDetail = await this.getScoringHSK5_Detail_530002(input, data, answerEvaluation)
        
            const suggestedVocabulary: HSKSuggestedVocabularyDto[] = dataAdvancedVocabularyResponse
            const suggestedSentence: any = dataAdvancedSentenceFinalResponse
            const suggestedParagraph: string = dataAdvancedParagraphFinalResponse
            let overallEvaluation = ""

            for (const key in ScaleScoreHS5KEnum) {
                if (Object.hasOwnProperty.call(ScaleScoreHS5KEnum, key)) {
                    const value = ScaleScoreHS5KEnum[key];
                    if(score === value) {
                        overallEvaluation = HSK5OverallEvaluationENEnum[key]
                        if(input.languageCode == I18NEnum.VI) overallEvaluation = HSK5OverallEvaluationVIEnum[key]
                        const promptOverallEvaluation = await this.chatGPTService.getPromptCriteria_OverallEvaluation(overallEvaluation, input.languageCode)
                        const responseOverallEvaluation = await this.openAIService.getDataFromChatGPT(promptOverallEvaluation, OVERALL_EVALUATION_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0)
                        const saveData = await this.chatGPTService.createCustomChatGPTUsage(promptOverallEvaluation, responseOverallEvaluation,  ChatGPTProjectKeyEnum.HSK_530002)
                        const chatgptForOverallEvaluation = await this.chatGPTUsageRepository.create(saveData)
                        listIdsChatGPT.push(chatgptForOverallEvaluation.id)
                        const regex = /[^\sa-zA-Z0-9.,?!:;'()\u00C0-\u00FF\u0102\u0103\u0110\u0111\u0128-\u1EF9]/g;
                        if(responseOverallEvaluation?.data && responseOverallEvaluation?.data?.overallEvaluation && !(responseOverallEvaluation?.data?.overallEvaluation).match(regex)) {
                            overallEvaluation = responseOverallEvaluation?.data?.overallEvaluation
                        }
                    }
                }
            }
            const INDENTATION = "  "
            const { dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource } = data
            answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Tìm thấy \d+ lỗi chính tả trong bài làm\./, `Tìm thấy ${dataCriteria_LexicalResource} lỗi chính tả trong bài làm.`)
            answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Found \d+ spelling errors in the assignment\./, `Found ${dataCriteria_LexicalResource} spelling errors in the assignment.`)
            answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Tìm thấy \d+ lỗi ngữ pháp trong bài làm\./, `Tìm thấy ${dataCriteria_GrammaticalAccuracy} lỗi ngữ pháp trong bài làm.`)
            answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Found \d+ grammatical errors in the assignment\./, `Found ${dataCriteria_GrammaticalAccuracy} grammatical errors in the assignment.`)
            const output: AnswerEvaluationOutputDto = {
                topicWordInAnswer: TOPIC_WORD - isNotContainsTopicWordData.length,
                answerEvaluation: [answerEvaluation[3], answerEvaluation[1], answerEvaluation[0], answerEvaluation[2]],
                overallEvaluation: overallEvaluation,
                suggestedVocabulary: suggestedVocabulary,
                suggestedSentence: suggestedSentence,
                suggestedRewrittenParagraph: `${INDENTATION}${suggestedParagraph}`,
                score: score,
                scoreDetail: scoreDetail
            }
            const aiResultCurrent: AIRessultDto = {
                userId: parseInt(user_id),
                questionId: parseInt(input.questionId),
                result: JSON.stringify(output),
                userAnswer: JSON.stringify(input),
                aiType: +(aiTypeDto?.aiType ? aiTypeDto?.aiType : AITypeEnum.PRACTICE),
                idsChatGPT: JSON.stringify(listIdsChatGPT),
            }
            const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
            
            let checkMiaTokenOutOfTurns = null
            response.miaTotal = 0
            if(allMiaPurchase.length) {
                checkMiaTokenOutOfTurns = allMiaPurchase.find(ele => ele?.miaTotal > 0)
                const totalMiaToken = allMiaPurchase.reduce((accumulator, miaToken) => {
                    return accumulator + miaToken.miaTotal;
                }, 0);
                if(checkMiaTokenOutOfTurns) {
                    const miaTotalDetail = checkMiaTokenOutOfTurns.miaTotal - 1
                    await this.purchaseService.updateOption(checkMiaTokenOutOfTurns?.id, miaTotalDetail)
                    const miaPreToken = purcharseMia ? purcharseMia.miaTotal : 0
                    response.miaTotal = totalMiaToken + miaPreToken - 1
                }
            } else if(purcharseMia && !checkMiaTokenOutOfTurns) {
                const miaTotalDetail = purcharseMia.miaTotal - 1
                await this.purchaseService.updateOption(purcharseMia?.id, miaTotalDetail)
                response.miaTotal = miaTotalDetail - 1
            }
            response.idAIScoring = newAIResult.id
            response.data = output
            response.status = true
            response.message = MessageScoringEnum.SUCCESS
            return response
        } catch (error) {
            response.message = `${error}`
            throw new HttpException(response, HttpStatus.BAD_REQUEST) 
        }
    }

    async scoringHSK5_530003(input: ScoringHSK5_530003InputDto, user_id: string, aiTypeDto: AITypeDto) {
        const purcharseMia = await this.purchaseService.getPurchaseByUserIdMia(parseInt(user_id))
        const purcharseMiaToken = await this.purchaseService.getAllPurchaseByUserIdMiaToken(parseInt(user_id))
        const premiumUseMiaCustom = await this.purchaseService.getAllPurchaseByUserIdMiaCustom(parseInt(user_id))
        const allMiaPurchase = [...purcharseMiaToken, ...premiumUseMiaCustom]
        const responseCheckMiaTotal: CheckTotalScoreRemainngResponseDto = {
            isTurnScoring: true,
            message: MessageMIATotalEnum.OUT_OF_TURNS
        }
        let checkFlagToken = false
        for(let index=0; index < allMiaPurchase.length; index++) {
            if(allMiaPurchase[index].miaTotal > 0) {
                checkFlagToken = true
            }
        }
        if((!purcharseMia || !purcharseMia.miaTotal) && (!allMiaPurchase.length || !checkFlagToken)) {
            throw new HttpException(responseCheckMiaTotal, HttpStatus.PAYMENT_REQUIRED)
        }
        let response : ScoringResponseDto = {
            miaTotal: 0,
            idAIScoring: null,
            data: {},
            status: false,
            message: MessageScoringEnum.INVALID
        }
        try {
            if(!input.answer) return response
            const checkInput: HSKNotConditionCommentOutputDto = await this.scoringHSKNotConditionCommon(input, KindTestEnum.HSK5)
            if(checkInput.isNotEnoughRequiredWordCount || checkInput.isNotUseReasonablePunctuation || checkInput.isNotUseReasonableSpacesPunctuation || checkInput.isPresentationError || checkInput.isSpamSentence || checkInput.isSpamWord || checkInput.isWordInBlaclist) {
                response.data = checkInput
                const aiResultCurrent: AIRessultDto = {
                    userId: parseInt(user_id),
                    questionId: parseInt(input.questionId),
                    result: JSON.stringify(checkInput),
                    userAnswer: JSON.stringify(input),
                    aiType: +aiTypeDto?.aiType,
                    idsChatGPT: JSON.stringify([]),
                }
                const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
                response.idAIScoring = newAIResult.id
                return response
            }
            const dataImageTransalte = await this.readJsonFile(fileHSK5_530003Path)
            const {imgUrl, answer} = input
            const findImg = dataImageTransalte.find(ele => (ele.img_url).trim() === imgUrl.trim())
            if(!findImg) {
                response.message = MessageScoringEnum.PICTURE_INVALID
                throw new HttpException(response, HttpStatus.BAD_REQUEST) 
            }
            const {
                dataAdvancedVocabularyResponse, 
                dataAdvancedSentenceFinalResponse, 
                dataAdvancedParagraphFinalResponse, 
                dataCriteriaHSK5_530003,
                listIdsChatGPT,
                ...data
            } = await this.chatGPTService.scoringHSK5_530003({...input, answer: (input.answer).replace(/ /g, "").replace(/^\n+|\n+$/g, '')}, findImg.img_description)
        
            const answerEvaluation: HSKAnswerEvaluationDto[]= dataCriteriaHSK5_530003
            const score = await this.getScoringHSK5_530003(input, data, answerEvaluation)
            const scoreDetail = await this.getScoringHSK5_Detail_530003(input, data, answerEvaluation)

            const suggestedVocabulary: HSKSuggestedVocabularyDto[] = dataAdvancedVocabularyResponse
            const suggestedSentence: any = dataAdvancedSentenceFinalResponse
            const suggestedParagraph: string = dataAdvancedParagraphFinalResponse
            let overallEvaluation = ""
            for (const key in ScaleScoreHS5KEnum) {
                if (Object.hasOwnProperty.call(ScaleScoreHS5KEnum, key)) {
                    const value = ScaleScoreHS5KEnum[key];
                    if(score === value) {
                        overallEvaluation = HSK5OverallEvaluationENEnum[key]
                        if(input.languageCode == I18NEnum.VI) overallEvaluation = HSK5OverallEvaluationVIEnum[key]

                        const promptOverallEvaluation = await this.chatGPTService.getPromptCriteria_OverallEvaluation(overallEvaluation, input.languageCode)
                        const responseOverallEvaluation = await this.openAIService.getDataFromChatGPT(promptOverallEvaluation, OVERALL_EVALUATION_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0)
                        const saveData = await this.chatGPTService.createCustomChatGPTUsage(promptOverallEvaluation, responseOverallEvaluation,  ChatGPTProjectKeyEnum.HSK_530003)
                        const chatgptForOverallEvaluation = await this.chatGPTUsageRepository.create(saveData)
                        listIdsChatGPT.push(chatgptForOverallEvaluation.id)
                        const regex = /[^\sa-zA-Z0-9.,?!:;'()\u00C0-\u00FF\u0102\u0103\u0110\u0111\u0128-\u1EF9]/g;
                        if(responseOverallEvaluation?.data && responseOverallEvaluation?.data?.overallEvaluation && !(responseOverallEvaluation?.data?.overallEvaluation).match(regex)) {
                            overallEvaluation = responseOverallEvaluation?.data?.overallEvaluation
                        }
                    }
                }
            }
            const INDENTATION = "  "
            const { dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource } = data
            answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Tìm thấy \d+ lỗi chính tả trong bài làm\./, `Tìm thấy ${dataCriteria_LexicalResource} lỗi chính tả trong bài làm.`)
            answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Found \d+ spelling errors in the assignment\./, `Found ${dataCriteria_LexicalResource} spelling errors in the assignment.`)
            answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Tìm thấy \d+ lỗi ngữ pháp trong bài làm\./, `Tìm thấy ${dataCriteria_GrammaticalAccuracy} lỗi ngữ pháp trong bài làm.`)
            answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Found \d+ grammatical errors in the assignment\./, `Found ${dataCriteria_GrammaticalAccuracy} grammatical errors in the assignment.`)
            const output: AnswerEvaluationOutputDto = {
                answerEvaluation: [answerEvaluation[3], answerEvaluation[1], answerEvaluation[0], answerEvaluation[2]],
                overallEvaluation: overallEvaluation,
                suggestedVocabulary: suggestedVocabulary,
                suggestedSentence: suggestedSentence,
                suggestedRewrittenParagraph: `${INDENTATION}${suggestedParagraph}`,
                score: score,
                scoreDetail: scoreDetail
            }

            const aiResultCurrent: AIRessultDto = {
                userId: parseInt(user_id),
                questionId: parseInt(input.questionId),
                result: JSON.stringify(output),
                userAnswer: JSON.stringify(input),
                aiType: +(aiTypeDto?.aiType ? aiTypeDto?.aiType : AITypeEnum.PRACTICE),
                idsChatGPT: JSON.stringify(listIdsChatGPT),
            }
            const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
            let checkMiaTokenOutOfTurns = null
            response.miaTotal = 0
            if(allMiaPurchase.length) {
                checkMiaTokenOutOfTurns = allMiaPurchase.find(ele => ele?.miaTotal > 0)
                const totalMiaToken = allMiaPurchase.reduce((accumulator, miaToken) => {
                    return accumulator + miaToken.miaTotal;
                }, 0);
                if(checkMiaTokenOutOfTurns) {
                    const miaTotalDetail = checkMiaTokenOutOfTurns.miaTotal - 1
                    await this.purchaseService.updateOption(checkMiaTokenOutOfTurns?.id, miaTotalDetail)
                    const miaPreToken = purcharseMia ? purcharseMia.miaTotal : 0
                    response.miaTotal = totalMiaToken + miaPreToken - 1
                }
            } else if(purcharseMia && !checkMiaTokenOutOfTurns) {
                const miaTotalDetail = purcharseMia.miaTotal - 1
                await this.purchaseService.updateOption(purcharseMia?.id, miaTotalDetail)
                response.miaTotal = miaTotalDetail - 1
            }
            response.idAIScoring = newAIResult.id
            response.data = output
            response.status = true
            response.message = MessageScoringEnum.SUCCESS
            return response
        } catch (error) {
            response.message = `${error}`
            throw new HttpException(response, HttpStatus.BAD_REQUEST) 
        }
    }

    async scoringHSK6_630001(input: ScoringHSK6_630001InputDto, user_id: string, aiTypeDto: AITypeDto) {
        const purcharseMia = await this.purchaseService.getPurchaseByUserIdMia(parseInt(user_id))
        const purcharseMiaToken = await this.purchaseService.getAllPurchaseByUserIdMiaToken(parseInt(user_id))
        const premiumUseMiaCustom = await this.purchaseService.getAllPurchaseByUserIdMiaCustom(parseInt(user_id))
        const allMiaPurchase = [...purcharseMiaToken, ...premiumUseMiaCustom]
        const responseCheckMiaTotal: CheckTotalScoreRemainngResponseDto = {
            isTurnScoring: true,
            message: MessageMIATotalEnum.OUT_OF_TURNS
        }
        let checkFlagToken = false
        for(let index=0; index < allMiaPurchase.length; index++) {
            if(allMiaPurchase[index].miaTotal > 0) {
                checkFlagToken = true
            }
        }
        if((!purcharseMia || !purcharseMia.miaTotal) && (!allMiaPurchase.length || !checkFlagToken)) {
            throw new HttpException(responseCheckMiaTotal, HttpStatus.PAYMENT_REQUIRED)
        }
        
        let response : ScoringResponseDto = {
            miaTotal: 0,
            idAIScoring: null,
            data: {},
            status: false,
            message: MessageScoringEnum.INVALID
        }
        try {
            if(!input.answer) return response
            const checkInput: HSKNotConditionCommentOutputDto = await this.scoringHSKNotConditionCommon(input, KindTestEnum.HSK6)
            if(checkInput.isNotEnoughRequiredWordCount || checkInput.isNotUseReasonablePunctuation || checkInput.isNotUseReasonableSpacesPunctuation || checkInput.isPresentationError || checkInput.isSpamSentence || checkInput.isSpamWord || checkInput.isWordInBlaclist) {
                response.data = checkInput
                const aiResultCurrent: AIRessultDto = {
                    userId: parseInt(user_id),
                    questionId: parseInt(input.questionId),
                    result: JSON.stringify(checkInput),
                    userAnswer: JSON.stringify(input),
                    aiType: +aiTypeDto?.aiType,
                    idsChatGPT: JSON.stringify([]),
                }
                const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
                response.idAIScoring = newAIResult.id
                return response
            }

            const {
                dataAdvancedVocabularyResponse, 
                dataAdvancedSentenceFinalResponse, 
                dataAdvancedParagraphFinalResponse, 
                dataCriteriaHSK6_630001,
                listIdsChatGPT,
                ...data
            } = await this.chatGPTService.scoringHSK6_630001({...input, answer: (input.answer).replace(/ /g, "").replace(/\r/g, '\n').replace(/^\n+|\n+$/g, '')})
            const answerEvaluation: HSKAnswerEvaluationDto[]= dataCriteriaHSK6_630001
            const score = await this.getScoringHSK6_630001(input, data, answerEvaluation)
            const scoreDetail = null

            const suggestedVocabulary: HSKSuggestedVocabularyDto[] = dataAdvancedVocabularyResponse
            const suggestedSentence: any = dataAdvancedSentenceFinalResponse
            // const suggestedParagraph: string = `  ${dataAdvancedParagraphFinalResponse.replace(/ /g, "").split("\n").join("\n  ")}`
            
            let overallEvaluation = ""
            for (const key in ScaleScoreHSK6Enum) {
                if (Object.hasOwnProperty.call(ScaleScoreHSK6Enum, key)) {
                    const value = ScaleScoreHSK6Enum[key];
                    if(score === value) {
                        overallEvaluation = HSK6OverallEvaluationENEnum[key]
                        if(input.languageCode == I18NEnum.VI) overallEvaluation = HSK6OverallEvaluationVIEnum[key]

                        const promptOverallEvaluation = await this.chatGPTService.getPromptCriteria_OverallEvaluation(overallEvaluation, input.languageCode)
                        const responseOverallEvaluation = await this.openAIService.getDataFromChatGPT(promptOverallEvaluation, OVERALL_EVALUATION_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0)
                        const saveData = await this.chatGPTService.createCustomChatGPTUsage(promptOverallEvaluation, responseOverallEvaluation,  ChatGPTProjectKeyEnum.HSK_630001)
                        const chatgptForOverallEvaluation = await this.chatGPTUsageRepository.create(saveData)
                        listIdsChatGPT.push(chatgptForOverallEvaluation.id)
                        const regex = /[^\sa-zA-Z0-9.,?!:;'()\u00C0-\u00FF\u0102\u0103\u0110\u0111\u0128-\u1EF9]/g;
                        if(responseOverallEvaluation?.data && responseOverallEvaluation?.data?.overallEvaluation && !(responseOverallEvaluation?.data?.overallEvaluation).match(regex)) {
                            overallEvaluation = responseOverallEvaluation?.data?.overallEvaluation
                        }
                    }
                }
            }
            const { dataCriteria_GrammaticalAccuracy, dataCriteria_LexicalResource } = data
            answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Tìm thấy \d+ lỗi chính tả trong bài làm\./, `Tìm thấy ${dataCriteria_LexicalResource} lỗi chính tả trong bài làm.`)
            answerEvaluation[1].analysis = answerEvaluation[1].analysis.replace(/Found \d+ spelling errors in the assignment\./, `Found ${dataCriteria_LexicalResource} spelling errors in the assignment.`)
            answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Tìm thấy \d+ lỗi ngữ pháp trong bài làm\./, `Tìm thấy ${dataCriteria_GrammaticalAccuracy} lỗi ngữ pháp trong bài làm.`)
            answerEvaluation[0].analysis =answerEvaluation[0].analysis.replace(/Found \d+ grammatical errors in the assignment\./, `Found ${dataCriteria_GrammaticalAccuracy} grammatical errors in the assignment.`)
            const output: AnswerEvaluationOutputDto = {
                answerEvaluation: [answerEvaluation[3], answerEvaluation[1], answerEvaluation[0], answerEvaluation[2]],
                overallEvaluation: overallEvaluation,
                suggestedVocabulary: suggestedVocabulary,
                suggestedSentence: suggestedSentence,
                suggestedRewrittenParagraph: dataAdvancedParagraphFinalResponse,
                score: score,
                scoreDetail: scoreDetail
            }
            const aiResultCurrent: AIRessultDto = {
                userId: parseInt(user_id),
                questionId: parseInt(input.questionId),
                result: JSON.stringify(output),
                userAnswer: JSON.stringify(input),
                aiType: +(aiTypeDto?.aiType ? aiTypeDto?.aiType : AITypeEnum.PRACTICE),
                idsChatGPT: JSON.stringify(listIdsChatGPT),
            }
            const newAIResult = await this.aIResultService.createAIResult(aiResultCurrent)
            
            let checkMiaTokenOutOfTurns = null
            response.miaTotal = 0
            if(allMiaPurchase.length) {
                checkMiaTokenOutOfTurns = allMiaPurchase.find(ele => ele?.miaTotal > 0)
                const totalMiaToken = allMiaPurchase.reduce((accumulator, miaToken) => {
                    return accumulator + miaToken.miaTotal;
                }, 0);
                if(checkMiaTokenOutOfTurns) {
                    const miaTotalDetail = checkMiaTokenOutOfTurns.miaTotal - 1
                    await this.purchaseService.updateOption(checkMiaTokenOutOfTurns?.id, miaTotalDetail)
                    const miaPreToken = purcharseMia ? purcharseMia.miaTotal : 0
                    response.miaTotal = totalMiaToken + miaPreToken - 1
                }
            } else if(purcharseMia && !checkMiaTokenOutOfTurns) {
                const miaTotalDetail = purcharseMia.miaTotal - 1
                await this.purchaseService.updateOption(purcharseMia?.id, miaTotalDetail)
                response.miaTotal = miaTotalDetail - 1
            } 
            response.idAIScoring = newAIResult.id
            response.data = output
            response.status = true
            response.message = MessageScoringEnum.SUCCESS
            return response
        } catch (error) {
            response.message = `${error}`
            throw new HttpException(response, HttpStatus.BAD_REQUEST) 
        }
    }

    async findDuplicateWordsNotAllow(words: any, maxCountDulpicate: number) {
        words = this.splitLatinChars(words)
        let counts = {};
        let currentCount = 1;
        let currentMax = 1;
        const length = words.length - 1
        for (let i = 1; i < words.length; i++) {
            if (words[i] === words[i - 1]) {
                currentCount++;
                if (currentCount > currentMax) {
                    currentMax = currentCount;
                }
            } else {
                if (counts[words[i - 1]] === undefined || currentMax > counts[words[i - 1]]) {
                    counts[words[i - 1]] = currentMax;
                }
                currentCount = 1;
                currentMax = 1;
            }
        }

        // Kiểm tra xem phần tử cuối cùng có cần được thêm vào counts không
        if (counts[words[length]] === undefined || currentMax > counts[words[length]]) {
            counts[words[length]] = currentMax;
        }
        const duplicates = [];
        for (const word in counts) {
          if (counts[word] >= maxCountDulpicate) {
            duplicates.push({key: word, counts: counts[word]})
          }
        }
        
        return duplicates;
    }

    splitLatinChars(arr: any) {
        const newArr = [];
        arr.forEach(item => {
          if (this.isLatin(item)) {
            item.split('').forEach(char => {
              newArr.push(char);
            });
          } else {
            newArr.push(item);
          }
        });
        return newArr;
      }
      
      isLatin(str: string) {
        return /^[a-zA-Z]+$/.test(str);
    }

    countOccurrences(arr: any, element: any) {
        let count = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === element || arr[i].includes(element) || element.includes(arr[i])) {
                count++;
            }
        }
        return count;
    }

    async findDuplicateSentencesNotAllow(arr: any) {
        let duplicates = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
                if (i !== j && (arr[j] == arr[i])) {
                    duplicates.push(arr[i]);
                    break;
                }
            }
        }

        const uniqueSentences = [...new Set(duplicates)]
        const results = []
        for (const sentence of uniqueSentences) {
            const counts = this.countOccurrences(duplicates, sentence)
            if(sentence.trim() && sentence.trim().length > 1)
                results.push({
                    key: sentence,
                    counts: counts
                })
        }
        return results;
    }

    async checkContainsTopicWord(text: string, requiredWord: string = "") {
        const result = {
            isNotContainsTopicWord: false,
            isNotContainsTopicWordData: [] 
        }
        if(!requiredWord) return result
        const words = requiredWord.split("、")
        for (const word of words) {
            if(!text.includes(word)) {
                result.isNotContainsTopicWordData.push(word)
            }
        }
        if(result.isNotContainsTopicWordData.length) {
            result.isNotContainsTopicWord = true
        }
        return result
    }

    async countTopicWord(text: string, requiredWord: string = "") {
        let count = 0
        if(!requiredWord) return 0
        const words = requiredWord.split("、")
        for (const word of words) {
            if(text.includes(word)) {
                count += 1
            }
        }
        return count
    }

    countTokenText(text: string) {
        // const wordsToken = jieba.cut(text);
        // return wordsToken.length
        const regex  = new RegExp("[^a-zA-Z0-9\u4e00-\u9fa5]", "g")
        const textNotContainPunctuation = text.replace(regex, "");
        return textNotContainPunctuation.length
    }

    async checkRequiredWordsTotal(text: string, kind: number) {
        // const textNotContainPunctuation = text.replace(/[。？!，、；：“”.—…《》！"]/g, '');
        const regex  = new RegExp("[^a-zA-Z0-9\u4e00-\u9fa5]", "g")
        const textNotContainPunctuation = text.replace(regex, "");
        let requiredCount = 5
        if(kind === KindTestEnum.HSK5) {
            requiredCount = 40
        } 
        if(kind === KindTestEnum.HSK6) {
            requiredCount = 200
        }
        const result = {
            isNotEnoughRequiredWordCount: false,
            isNotEnoughRequiredWordCountData: requiredCount
        }
        if(textNotContainPunctuation.length <= requiredCount) {
            result.isNotEnoughRequiredWordCount = true
            result.isNotEnoughRequiredWordCountData = textNotContainPunctuation.length
        }
        return result
    }

    async checkSpamWords(text: string) {
        // Trong tiếng trung không có dấu cách
        const result = {
            isSpamWord: false,
            isSpamWordData: []
        }
        const MAX_COUNT_WORDS_ALLOW = 3
        text = text.replace(/\d+/g, '').replace(/\s+/g, "")
        const wordsToken = text.split("");
        const punctuations = /[。？，、；：“”—…！]/;
        const duplicateWordsAndPunctuation = await this.findDuplicateWordsNotAllow(wordsToken, MAX_COUNT_WORDS_ALLOW)
        const duplicateWords = duplicateWordsAndPunctuation.filter(item => !punctuations.test(item.key));
        if(Object.keys(duplicateWords).length) {
            result.isSpamWord = true
            result.isSpamWordData = duplicateWords
        }
        return result
    }

    async checkSpamSentences(text: string) {
        const result = {
            isSpamSentence: false,
            isSpamSentenceData: []
        }
        text = text.replace(/[“”]/g, '');
        const sentencesToken = text.split(/[。！？]/);
        const duplicateSentences = await this.findDuplicateSentencesNotAllow(sentencesToken.filter(ele => ele))
        if(duplicateSentences.length) {
            result.isSpamSentence = true
            result.isSpamSentenceData = duplicateSentences
        }
        return result
    }

    async checkUseReasonablePunctuation(text: string) {
        const MAX_COUNT_PUNCTUATION_ALLOW = 2
        const result = {
            isNotUseReasonablePunctuation: false,
            isNotUseReasonablePunctuationData: []
        }
        const wordsToken = text.split("");
        const punctuations = /[。？，、；：…！]/;
        const duplicateWordsAndPunctuation = await this.findDuplicateWordsNotAllow(wordsToken, MAX_COUNT_PUNCTUATION_ALLOW)
        const duplicatePunctuation = duplicateWordsAndPunctuation.filter(item => punctuations.test(item.key));
        if(Object.keys(duplicatePunctuation).length) {
            result.isNotUseReasonablePunctuation = true
            result.isNotUseReasonablePunctuationData = duplicatePunctuation
        }
        return result
    }

    async checkUseReasonableSpacesPunctuation(text: string) {
        const MAX_COUNT_PUNCTUATION_ALLOW = 5
        const result = {
            isNotUseReasonableSpacesPunctuation: false,
            isNotUseReasonableSpacesPunctuationData: []
        }
        const wordsToken = text.split("");
        const punctuations = /^\s+$/;
        const duplicateWordsAndPunctuation = await this.findDuplicateWordsNotAllow(wordsToken, MAX_COUNT_PUNCTUATION_ALLOW)
        const duplicateSpacesPunctuation = duplicateWordsAndPunctuation.filter(item => punctuations.test(item.key));
        if(Object.keys(duplicateSpacesPunctuation).length) {
            result.isNotUseReasonableSpacesPunctuation = true
            result.isNotUseReasonableSpacesPunctuationData = duplicateSpacesPunctuation
        }
        return result
    }

    async checkPresentationError(text: string, kind: number) {
        text = text.replace(" ", "").replace(/^\n+|\n+$/g, '')
        const result = {
            isPresentationError: false,
            isPresentationErrorData: {}
        }
        const DOT_REQUIRED_HSK4 = 1
        const DOT_REQUIRED_HSK5 = 2 
        const dots = text.split(/[。！？]/);
        let isNotSatisfyFinal = false

        if (!dots.length) {
            isNotSatisfyFinal = true
        }
        else if(kind === KindTestEnum.HSK4) {
            isNotSatisfyFinal = dots.length - 1 < DOT_REQUIRED_HSK4
        } 
        else if(kind === KindTestEnum.HSK5) {
            isNotSatisfyFinal = dots.length - 1 < DOT_REQUIRED_HSK5
        }
        result.isPresentationError = isNotSatisfyFinal
        result.isPresentationErrorData = [
            {
                key: "。！？",
                counts: dots.length - 1
            },
        ]
        return result
    }

    async checkSpamWordsInBlacklist(text) {
        const result = {
            isWordInBlaclist: false,
            isWordInBlaclistData: []
        }
        const blacklist_zh = await this.readFileLines(fileBlacklistZhPath)
        for (let forbiddenWord of blacklist_zh) {
            if (text.includes(forbiddenWord)) {
                result.isWordInBlaclistData.push(forbiddenWord);
            }
        }
        if(result.isWordInBlaclistData.length) {
            result.isWordInBlaclist = true
        }
        return result;
    }

    async scoringHSKNotConditionCommon(input: any, kind: number): Promise<HSKNotConditionCommentOutputDto> {
        try {
            let {answer} = input
            answer = answer.replace(" ", "").replace(/^\n+|\n+$/g, '')
            const {isNotEnoughRequiredWordCount, isNotEnoughRequiredWordCountData} = await this.checkRequiredWordsTotal(answer, kind)
            const {isNotContainsTopicWord, isNotContainsTopicWordData} = await this.checkContainsTopicWord(answer, input?.requiredWord)
            const {isSpamWord, isSpamWordData} = await this.checkSpamWords(answer)
            const {isSpamSentence, isSpamSentenceData} = await this.checkSpamSentences(answer)
            const {isNotUseReasonablePunctuation, isNotUseReasonablePunctuationData} = await this.checkUseReasonablePunctuation(answer)
            const {isNotUseReasonableSpacesPunctuation, isNotUseReasonableSpacesPunctuationData} = await this.checkUseReasonableSpacesPunctuation(answer)
            const {isPresentationError, isPresentationErrorData} = await this.checkPresentationError(answer, kind)
            const {isWordInBlaclist, isWordInBlaclistData} = await this.checkSpamWordsInBlacklist(answer)

            const responseNotConditon: HSKNotConditionCommentOutputDto = {
                isNotContainsTopicWord: isNotContainsTopicWord,
                isNotContainsTopicWordData: isNotContainsTopicWordData,
                isNotEnoughRequiredWordCount: isNotEnoughRequiredWordCount,
                isNotEnoughRequiredWordCountData: isNotEnoughRequiredWordCountData,
                isSpamWord: isSpamWord,
                isSpamWordData: isSpamWordData,
                isSpamSentence: isSpamSentence,
                isSpamSentenceData: isSpamSentenceData,
                isWordInBlaclist: isWordInBlaclist,
                isWordInBlaclistData: isWordInBlaclistData,
                isNotUseReasonablePunctuation: isNotUseReasonablePunctuation,
                isNotUseReasonablePunctuationData: isNotUseReasonablePunctuationData,
                isNotUseReasonableSpacesPunctuation: isNotUseReasonableSpacesPunctuation,
                isNotUseReasonableSpacesPunctuationData: isNotUseReasonableSpacesPunctuationData,
                isPresentationError: isPresentationError,
                isPresentationErrorData: isPresentationErrorData,
            }
            return responseNotConditon
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }
}