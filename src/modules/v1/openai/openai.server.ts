import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatGPTModelEnum, ChatGPTTemperatureEnum } from '../chatgpt/enums/chatGPT.enum';
import { jsonrepair } from 'jsonrepair';
import { FileService } from '../file/file.service';
import { I18NEnum } from '../scoring/enums/key.enum';
import { MessageConditionCustomEN, MessageConditionCustomVI } from '../../../modules/i18n/i18n.enum';
import { CounCharacterHSKEnum } from '../scoring/enums/count-character-hsk.enum';
import { DetailTasksService } from '../../../modules/helper/detail-tasks.service';
import * as Sentry from "@sentry/node";
const LOG_FILE = "uploads/logs/scoring.txt"
import { zodResponseFormat } from 'openai/helpers/zod';

const WORD_NOT_ERROR_SPELLING = [
  // Trợ từ
  "的", "地", "得", "着", "了", "过", "的", "了", "呢",
  "吧", "吗", "啊", "所", "给", "连", "们", "似的", "一样",
  // Giới từ
  "在", "从", "当", "自从", "于", "自", "至", "直到", "到",
  "在", "从", "到", "自", "朝", "往", "由", "给", "替",
  "为", "对", "把", "将", "被", "叫", "让", "由", "以",
  "通过", "靠", "为了", "因为", "由于", "比", "跟", "比较", "离",
  "距离", "拿", "依", "靠", "依照", "依照", "按", "按照", "根据",
  "遵照", "趁", "凭借", "本着", "除了", "和", "同", "跟", "与",
  "连", "经", "经过", "通过", "关于", "对于", "至于", "就",
  // Liên từ
  "和", "同", "跟", "与", "及", "以及"
]

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private readonly fileService: FileService,
    private readonly detailTasksService: DetailTasksService,
    
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('chatGPT.key'),
    });
  }

  async getDataFromChatGPT_HSK5_530003(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      const MIN_VOCABULARIES_LENGTH = 3
      const MIN_SENTENCES_LENGTH = 2
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry(messages, jsonSchema, languageCode, model, temperature)
          if(
            dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length && 
            dataChatGPT_JSON.hasOwnProperty("data") && this.detailTasksService.checkUpgradeObj_HSK6(dataChatGPT_JSON.data) && 
            (dataChatGPT_JSON.data.hasOwnProperty("vocabularies") && dataChatGPT_JSON.data.vocabularies && dataChatGPT_JSON.data.vocabularies.length >= MIN_VOCABULARIES_LENGTH && this.detailTasksService.containsLatin(dataChatGPT_JSON.data.vocabularies[0].reasonUse)) && 
            (dataChatGPT_JSON.data.hasOwnProperty("sentences") && dataChatGPT_JSON.data.sentences && dataChatGPT_JSON.data.sentences.length >= MIN_SENTENCES_LENGTH && this.detailTasksService.containsLatin(dataChatGPT_JSON.data.sentences[0].reasonUse)) &&
            (this.detailTasksService.extractChineseCharacters(dataChatGPT_JSON.data.bestUpgradeAnswer)).length > 0 && this.detailTasksService.countTokenText(dataChatGPT_JSON.data.bestUpgradeAnswer) >= CounCharacterHSKEnum.HSK5
          ) {
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(dataChatGPT_JSON)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  
  async getDataFromChatGPT_HSK5_530002(requiredWords: string, messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      const MIN_VOCABULARIES_LENGTH = 3
      const MIN_SENTENCES_LENGTH = 2
      
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry(messages, jsonSchema, languageCode, model, temperature)
          if(dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length && 
            dataChatGPT_JSON.hasOwnProperty("data") && this.detailTasksService.checkUpgradeObj_HSK6(dataChatGPT_JSON.data) && 
            (dataChatGPT_JSON.data.hasOwnProperty("vocabularies") && dataChatGPT_JSON.data.vocabularies && dataChatGPT_JSON.data.vocabularies.length >= MIN_VOCABULARIES_LENGTH && this.detailTasksService.containsLatin(dataChatGPT_JSON.data.vocabularies[0].reasonUse)) && 
            (dataChatGPT_JSON.data.hasOwnProperty("sentences") && dataChatGPT_JSON.data.sentences && dataChatGPT_JSON.data.sentences.length >= MIN_SENTENCES_LENGTH && this.detailTasksService.containsLatin(dataChatGPT_JSON.data.sentences[0].reasonUse)) &&
            this.detailTasksService.checkEnoughRequiredWords(requiredWords, dataChatGPT_JSON.data.bestUpgradeAnswer) && this.detailTasksService.countTokenText(dataChatGPT_JSON.data.bestUpgradeAnswer) >= CounCharacterHSKEnum.HSK5
          ){
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(dataChatGPT_JSON)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataFromChatGPT_HSK6_630001(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      const MIN_VOCABULARIES_LENGTH = 1
      const MIN_SENTENCES_LENGTH = 1
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry(messages, jsonSchema, languageCode, model, temperature)
          if(
            dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length && 
            dataChatGPT_JSON.hasOwnProperty("data") && this.detailTasksService.checkUpgradeObj_HSK6(dataChatGPT_JSON.data) && 
            (dataChatGPT_JSON.data.hasOwnProperty("vocabularies") && dataChatGPT_JSON.data.vocabularies && dataChatGPT_JSON.data.vocabularies.length >= MIN_VOCABULARIES_LENGTH && this.detailTasksService.containsLatin(dataChatGPT_JSON.data.vocabularies[0].reasonUse)) && 
            (dataChatGPT_JSON.data.hasOwnProperty("sentences") && dataChatGPT_JSON.data.sentences && dataChatGPT_JSON.data.sentences.length >= MIN_SENTENCES_LENGTH && this.detailTasksService.containsLatin(dataChatGPT_JSON.data.sentences[0].reasonUse))
          ) {
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(dataChatGPT_JSON)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataFromChatGPT_ForCheckErrorsSpelling(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry(messages, jsonSchema, languageCode, model, temperature)
          if(dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length) {
            const dataAnalysis = dataChatGPT_JSON.data.analysis
            let dataAnalysisFinal = []
            for(let index = 0; index < dataAnalysis.length; index++) {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(dataAnalysis[index])
              const flagNotError = checkChineseWords.some(word => WORD_NOT_ERROR_SPELLING.includes(word));
              const flagLengthWord = checkChineseWords.some(word => word.length > 4);
              const flagDuplicateCharacter = checkChineseWords.some((word, i) => 
                checkChineseWords.some((otherWord, j) => i !== j && word.includes(otherWord))
              );

              if(checkChineseWords.length === 2 && !flagNotError && !flagLengthWord && !flagDuplicateCharacter && this.detailTasksService.checkEqualLength(checkChineseWords)) {
                dataAnalysisFinal.push(dataAnalysis[index])
              }
            }
            dataChatGPT_JSON.data.errors = dataAnalysisFinal.length
            let dataAnalysisFinalText = `Found ${dataAnalysisFinal.length} spelling errors in the assignment.\n`
            if(languageCode == I18NEnum.VI) dataAnalysisFinalText = `Tìm thấy ${dataAnalysisFinal.length} lỗi chính tả trong bài làm.\n`
            if(dataAnalysisFinal.length) {
              dataChatGPT_JSON.data.analysis = `${dataAnalysisFinalText}${dataAnalysisFinal.join("\n")}`
            } else {
              dataAnalysisFinalText += languageCode == I18NEnum.VI ? `${MessageConditionCustomVI.LEXICAL_RESOURCE}\n` : `${MessageConditionCustomEN.LEXICAL_RESOURCE}\n`
              dataChatGPT_JSON.data.analysis = dataAnalysisFinalText
            }
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(messages)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataFromChatGPT_ForCheckErrorsGrammar(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry(messages, jsonSchema, languageCode, model, temperature)
          if(dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length) {
            const dataAnalysis = dataChatGPT_JSON.data.analysis
            let dataAnalysisFinal = []
            for(let index = 0; index < dataAnalysis.length; index++) {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(dataAnalysis[index])
              const flagDuplicateCharacter = checkChineseWords.length !== new Set(checkChineseWords).size;
              if(!flagDuplicateCharacter && checkChineseWords.length) {
                dataAnalysisFinal.push(dataAnalysis[index])
              }
            }
            dataChatGPT_JSON.data.errors = dataAnalysisFinal.length
            let dataAnalysisFinalText = `Found ${dataAnalysisFinal.length} grammatical errors in the assignment.\n`
            if(languageCode == I18NEnum.VI) dataAnalysisFinalText = `Tìm thấy ${dataAnalysisFinal.length} lỗi ngữ pháp trong bài làm.\n`
            if(dataAnalysisFinal.length) {
              dataChatGPT_JSON.data.analysis = `${dataAnalysisFinalText}${dataAnalysisFinal.join("\n")}`
            } else {
              dataAnalysisFinalText += languageCode == I18NEnum.VI ? `${MessageConditionCustomVI.GRAMMATICAL_RANGE_AND_ACCURACY}\n` : `${MessageConditionCustomEN.GRAMMATICAL_RANGE_AND_ACCURACY}\n`
              dataChatGPT_JSON.data.analysis = dataAnalysisFinalText
            }
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(messages)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, requiredWords: any = [], model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T0): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry_HSK56(messages, jsonSchema, languageCode, model, temperature)
          if(dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length) {
            const dataAnalysis = dataChatGPT_JSON.data.analysis
            let dataAnalysisFinal = []
            for(let index = 0; index < dataAnalysis.length; index++) {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(dataAnalysis[index])
              const flagNotError = checkChineseWords.some(word => WORD_NOT_ERROR_SPELLING.includes(word));
              const flagLengthWord = checkChineseWords.some(word => word.length > 4);
              const flagDuplicateCharacter = checkChineseWords.some((word, i) => 
                checkChineseWords.some((otherWord, j) => i !== j && word.includes(otherWord))
              );
              const checkContainRequiredWord = requiredWords.length ? requiredWords.some(element => checkChineseWords.join("").includes(element)) : false;

              if(checkChineseWords.length === 2 && !flagNotError && !flagLengthWord && !flagDuplicateCharacter && this.detailTasksService.checkEqualLength(checkChineseWords) && !checkContainRequiredWord) {
                dataAnalysisFinal.push(dataAnalysis[index])
              }
            }
            dataChatGPT_JSON.data.errors = dataAnalysisFinal.length
            let dataAnalysisFinalText = `Found ${dataAnalysisFinal.length} spelling errors in the assignment.\n`
            if(languageCode == I18NEnum.VI) dataAnalysisFinalText = `Tìm thấy ${dataAnalysisFinal.length} lỗi chính tả trong bài làm.\n`
            if(dataAnalysisFinal.length) {
              dataChatGPT_JSON.data.analysis = `${dataAnalysisFinalText}${dataAnalysisFinal.join("\n")}`
            } else {
              dataAnalysisFinalText += languageCode == I18NEnum.VI ? `${MessageConditionCustomVI.LEXICAL_RESOURCE}\n` : `${MessageConditionCustomEN.LEXICAL_RESOURCE}\n`
              dataChatGPT_JSON.data.analysis = dataAnalysisFinalText
            }
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(messages)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, requiredWords: any = [], model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T0): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry_HSK56(messages, jsonSchema, languageCode, model, temperature)
          if(dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length) {
            const dataAnalysis = dataChatGPT_JSON.data.analysis
            let dataAnalysisFinal = []
            for(let index = 0; index < dataAnalysis.length; index++) {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(dataAnalysis[index])
              const flagDuplicateCharacter = checkChineseWords.length !== new Set(checkChineseWords).size;
              const checkContainRequiredWord = requiredWords.length ? requiredWords.some(element => checkChineseWords.join("").includes(element)) : false;
              if(!flagDuplicateCharacter && checkChineseWords.length && !checkContainRequiredWord) {
                dataAnalysisFinal.push(dataAnalysis[index])
              }
            }
            dataChatGPT_JSON.data.errors = dataAnalysisFinal.length
            let dataAnalysisFinalText = `Found ${dataAnalysisFinal.length} grammatical errors in the assignment.\n`
            if(languageCode == I18NEnum.VI) dataAnalysisFinalText = `Tìm thấy ${dataAnalysisFinal.length} lỗi ngữ pháp trong bài làm.\n`
            if(dataAnalysisFinal.length) {
              dataChatGPT_JSON.data.analysis = `${dataAnalysisFinalText}${dataAnalysisFinal.join("\n")}`
            } else {
              dataAnalysisFinalText += languageCode == I18NEnum.VI ? `${MessageConditionCustomVI.GRAMMATICAL_RANGE_AND_ACCURACY}\n` : `${MessageConditionCustomEN.GRAMMATICAL_RANGE_AND_ACCURACY}\n`
              dataChatGPT_JSON.data.analysis = dataAnalysisFinalText
            }
            return dataChatGPT_JSON
          }
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(messages)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataFromChatGPT(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1): Promise<any> {
    try {
      const RETRY_CHATGPT_API = 3
      for(let index = 0; index < RETRY_CHATGPT_API; index++) {
        try {
          const dataChatGPT_JSON = await this.getDataRetry(messages, jsonSchema, languageCode, model, temperature)
          if(dataChatGPT_JSON && Object.keys(dataChatGPT_JSON) && Object.keys(dataChatGPT_JSON).length) return dataChatGPT_JSON
          await this.fileService.addValueToFile(`Call ChatGPT For Message: ${JSON.stringify(messages)} Failed Part ${index+2}`, LOG_FILE)
        } catch (error) {
          return {}
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
  async getDataRetry_HSK56(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1) {
    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        temperature: temperature,
        messages: messages,
        response_format: zodResponseFormat(jsonSchema, "response_schema"),
      });
      try {
        if (response.choices && response.choices.length > 0) {
          return {
              data: JSON.parse(jsonrepair(response.choices[0].message.content)),
              prompt_tokens: response.usage.prompt_tokens,
              completion_tokens: response.usage.completion_tokens,
              model: response.model
          };
        }
        return null
      } catch (error) {
        try {
          let data_raw = response.choices[0].message.content
          const quoute_chinese = data_raw.match(/"[^"]*"/g)
          for (const ele of quoute_chinese) {
            if(/^[\u4e00-\u9fa5\d]+$/.test(ele)) {
              data_raw = data_raw.replace(ele, `“${ele.replace(/"/g, '')}”`)
            }
          }
          return {
            data: JSON.parse(data_raw),
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            model: response.model
          };
        } catch (error) {
          return null
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async getDataRetry(messages: any, jsonSchema: any, languageCode: I18NEnum = I18NEnum.EN, model: ChatGPTModelEnum = ChatGPTModelEnum.GPT_4O_MINI, temperature = ChatGPTTemperatureEnum.T1) {
    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        temperature: temperature,
        messages: messages,
        response_format: zodResponseFormat(jsonSchema, "response_schema"),
      });
      try {
        if (response.choices && response.choices.length > 0) {
          return {
              data: JSON.parse(jsonrepair(response.choices[0].message.content)),
              prompt_tokens: response.usage.prompt_tokens,
              completion_tokens: response.usage.completion_tokens,
              model: response.model
          };
        }
        return null
      } catch (error) {
        try {
          let data_raw = response.choices[0].message.content
          const quoute_chinese = data_raw.match(/"[^"]*"/g)
          for (const ele of quoute_chinese) {
            if(/^[\u4e00-\u9fa5\d]+$/.test(ele)) {
              data_raw = data_raw.replace(ele, `“${ele.replace(/"/g, '')}”`)
            }
          }
          return {
            data: JSON.parse(data_raw),
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            model: response.model
          };
        } catch (error) {
          return null
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
