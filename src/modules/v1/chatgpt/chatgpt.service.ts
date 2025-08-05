import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatGPTModelEnum, ChatGPTTemperatureEnum, ChatGPTTypeEnum, ChatGPTProjectKeyEnum } from './enums/chatGPT.enum';
import { ChatGPTUsageRepository } from './chatgpt.reponsitory';
import { ChatGPTUsageDto } from './dtos/chatgpt-usage.dto';
import { ScoringHSK4_430002InputDto, ScoringHSK5_530002InputDto, ScoringHSK5_530003InputDto, ScoringHSK6_630001InputDto } from '../scoring/dtos/scoring-input.dto';
import { KeyForKeyCriteriaEnum } from '../scoring/enums/kind.enum';
import { FileService } from '../file/file.service';
import { OpenAIService } from '../openai/openai.server';
import { HSKAnswerEvaluationDto } from '../scoring/dtos/scoring-output.dto';
import { I18NEnum, KeyForKeyEnum} from '../scoring/enums/key.enum';
import { KeyRoleForKeyMessageConditionEnum, KeyRoleForKeyRoleEnum} from '../../i18n/i18n.enum';
import { KeyValueService } from '../../../modules/helper/key-value.service';
import { DetailTasksService } from '../../../modules/helper/detail-tasks.service';
const LOG_FILE = "uploads/logs/scoring.txt"
import * as path from 'path'
import * as Sentry from "@sentry/node";
import { ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530002_SCHEMA, ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530003_SCHEMA, ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_SCHEMA, ADVANCED_SENTENCE_SCHEMA, ADVANCED_VOCABULARY_SCHEMA, COHERENCE_AND_COHESION_SCHEMA, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, GRAMMATICAL_ACCURACY_SCHEMA, GRAMMATICAL_RANGE_SCHEMA, LEXICAL_RESOURCE_HSK56_SCHEMA, LEXICAL_RESOURCE_SCHEMA, RELATED_IMAGE_SCHEMA } from './zod/model.zod';
const projectPath = process.cwd()
const HSK6_630001 = 'src/config/translate/HSK6_630001.json'
const fileHSK6_630001Path = path.resolve(projectPath, HSK6_630001)

const PERSONAL_OPINION = [
  "我觉得这个故事",
  "我觉得",
  "从我的角度来看",
  "这个故事告诉我们",
  "这个故事使我们",
  "这个故事表示",
  "通过这个故事",
  "总结",
  "总的来说"
]

@Injectable()
export class ChatGPTService {
    constructor(
        private readonly chatGPTUsageRepository: ChatGPTUsageRepository,
        private readonly fileService: FileService,
        private readonly openAIService: OpenAIService,        
        private readonly keyValueService: KeyValueService,   
        private readonly detailTasksService: DetailTasksService,   
             
    ) {}

    createCustomChatGPTUsage(inputPrompt: any, data: any, project_key: string) {
      const chatGPTUsage: ChatGPTUsageDto = {
        input: JSON.stringify(inputPrompt),
        output: JSON.stringify(data?.data) || "",
        model: data?.model || "",
        project_key: project_key,
        type: ChatGPTTypeEnum.HSK456_SCORING,
        prompt_tokens: data?.prompt_tokens || 0,
        completion_tokens: data?.completion_tokens || 0,
      }
      return chatGPTUsage
    }

    async getPromptCriteria_GrammaticalRange(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_RANGE)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """他喜欢读书。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_RANGE)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalRangePart2(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_RANGE_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """尽管他非常努力地工作，他还是没有达到他的目标，这让他感到非常失望。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_RANGE_PART2)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalRangePart3(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_RANGE_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """虽然外面下着雨，但他仍决定去跑步，因为他认为运动对健康有益。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_RANGE_PART3)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracy(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """握很像去北京参观胡同和吃娜些北京地道采药。我参考国大概五个左右写于北京的材料了，单丝我还知道该去那玩二。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracyPart2(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """大概三天后，我回去北京见面小明。一知道这个消息，就他发给我一份参考材料，里面有北京地道菜名单和一些有名胡同的照片等内容。他还跟我说：“那天晚饭，我请客！”"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART2)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracyPart3(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """家人知间由时候也免不聊抱怨河吵架。经常小明地爸爸妈妈如此。小明故起勇气坐起来好好说话。从词，他们很趁惜彼此。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART3)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracyPart4(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_PART4)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """毕业大学后，窝进了一个公四当密书。我第领导是一个女是。它在工做下给了我恨大的半助。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART4)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracyPart5(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_PART5)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """图片中的男士正在给一个坐在电脑前的女士看文件。男的看来很年经。她一定在女士请教问题。在工作中，同事间应该互相帮助。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART5)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracy_HSK56(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_HSK56)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_GRAMMATICAL_ACCURACY_PART4_HSK56)}"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART4_HSK56)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracyPart2_HSK56(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_HSK56)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_GRAMMATICAL_ACCURACY_PART2_HSK56)}"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART2_HSK56)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        },
      ]
      return messages
    }

    async getPromptCriteria_GrammaticalAccuracyPart3_HSK56(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_GRAMMATICAL_ACCURACY_HSK56)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_GRAMMATICAL_ACCURACY_PART3_HSK56)}"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_GRAMMATICAL_ACCURACY_PART3_HSK56)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResource(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """握很像去北京参观胡同和吃娜些北京地道采药。我参考国大概五个左右写于北京的材料了，单丝我还知道该去那玩二。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResourcePart2(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """大概三天后，我回去北京见面小明.一知道这个消息，就他发给我一份参考材料，里面有北京地道菜名单和一些有名胡同的照片等内容。他还跟我说：“那天晚饭，我请客！” """`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART2)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResourcePart3(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """今天握闺蜜很高兴，之所以他笑地很大。我不知道她为什么这吗高兴，单丝她高新我也高兴。我觉的她很票量。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART3)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResourcePart4(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_PART4)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """图片中的男士正在给一个坐在电脑前的女士看文件。男的看来很年经。她一定在女士请教问题。在工作中，同事间应该互相帮助。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART4)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResourcePart5(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_PART5)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """一个晴朗的午后，小明呆着一束绚丽的鲜花和一盒精致的礼物，来到了小红家门前。她准备像小红告白。当小红打开门，他毫不犹豫地说出心里的话。从此成了一对。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART5)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResource_HSK56(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_HSK56)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: ${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_LEXICAL_RESOURCE_PART4_HSK56)}`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART4_HSK56)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: ${input}`
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResourcePart2_HSK56(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_HSK56)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_LEXICAL_RESOURCE_PART2_HSK56)}"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART2_HSK56)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        },
      ]
      return messages
    }

    async getPromptCriteria_LexicalResourcePart3_HSK56(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_LEXICAL_RESOURCE_HSK56)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_LEXICAL_RESOURCE_PART3_HSK56)}"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_LEXICAL_RESOURCE_PART3_HSK56)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        },
      ]
      return messages
    }

    async getPromptCriteria_CoherenceAndCohesion(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_COHERENCE_AND_COHESION)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """家人知间由时候也免不聊抱怨河吵架。经常小明地爸爸妈妈如此。小明故起勇气坐起来好好说话。从词，他们很趁惜彼此."""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_COHERENCE_AND_COHESION)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }
    
    async getPromptCriteria_CoherenceAndCohesionPart2(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_COHERENCE_AND_COHESION_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """在一个小村庄里，有一个家庭，他们总是在抱怨和吵架中度过大部分时间。妻子总是抱怨丈夫只知道工作，丈夫则抱怨妻子的脾气越来越不好。家庭氛围紧张得很，但在一次偶然的谈话中，他们决定停止抱怨，而是开始沟通。他们坐在一起，倾听彼此的想法和感受，理解对方的困境。这种新的沟通方式改变了他们的生活，他们开始珍惜彼此，共同努力创造更美好的未来。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_COHERENCE_AND_COHESION_PART2)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_CoherenceAndCohesionPart3(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_COHERENCE_AND_COHESION_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """湖同理开了俱乐部。参加这哥俱乐部，我又了很大的权利，即使有了跟多锻炼身体第动力，还叫了不少新的朋友。握不喜欢这家俱乐部。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_COHERENCE_AND_COHESION_PART3)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptPersonalOpinion(input: any, languageCode: I18NEnum) {
      const content_raw = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_PERSONAL_OPINION)
      const messages = [
        {
          "role": "system",
          "content": `${content_raw}`
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """我昨天去了超市买水果，但是自行车的轮胎却是空的。"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_PERSONAL_OPINION)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptAdvancedVocabulary(input: any, img_description: string, languageCode: I18NEnum) {
      const contentUserInput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """这朵话美丽太漂亮了。"""`
        }
      ]
      const contentUserOutput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        }
      ] 
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_VOCABULARY)
      if(img_description) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """描述花的形状。"""`
        })

        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${JSON.stringify(img_description)}"""`
        })
      }
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": contentUserInput
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_VOCABULARY)
        },
        {
          "role": "user",
          "content": contentUserOutput
        },
      ]
      return messages
    }

    async getPromptAdvancedVocabularyPart2(input: any, img_description: string, languageCode: I18NEnum) {
      const contentUserInput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """仔细的看看刮在墙上的一幅画。"""`
        }
      ]
      const contentUserOutput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        }
      ] 
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_VOCABULARY_PART2)
      if(img_description) {
         
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一个女孩聚精会神地看着墙上挂着的一幅画。"""`
        })

        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${JSON.stringify(img_description)}"""`
        })
      }
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": contentUserInput
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_VOCABULARY_PART2)
        },
        {
          "role": "user",
          "content": contentUserOutput
        },
      ]
      return messages
    }

    async getPromptAdvancedVocabularyPart3(input: any, img_description: string, languageCode: I18NEnum) {
      const contentUserInput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """这朵话美丽太漂亮了。"""`
        }
      ]
      const contentUserOutput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        }
      ] 
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_VOCABULARY_PART3)
      if(img_description) {
         
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """描述花的形状。"""`
        })

        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${JSON.stringify(img_description)}"""`
        })
      }
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": contentUserInput
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_VOCABULARY_PART3)
        },
        {
          "role": "user",
          "content": contentUserOutput
        },
      ]
      return messages
    }

    async getPromptAdvancedSentence(input: any, requiredWord: string, optionWords: any, img_description: string, languageCode: I18NEnum) {
      const contentUserInput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """这朵话美丽太漂亮了。"""`
        }
      ]
      const contentUserOutput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        }
      ]

      if(requiredWord) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """美丽"""`
        })
        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """${requiredWord}"""`
        })
      }
      
      if(optionWords) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.OPTION_WORDS)}: """["花", "这朵", "公园"]"""`
        })
        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.OPTION_WORDS)}: """${JSON.stringify(optionWords)}"""`
        })
      }
      if(img_description) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """描述花的形状。"""`
        })

        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${JSON.stringify(img_description)}"""`
        })
      }
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_SENTENCE)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": contentUserInput
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_SENTENCE)
        },
        {
          "role": "user",
          "content": contentUserOutput
        },
      ]
      return messages
    }

    async getPromptAdvancedSentencePart2(input: any, requiredWord: string, optionWords: any, img_description: string, languageCode: I18NEnum) {
      const contentUserInput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """仔细的看看刮在墙上的一幅画。"""`
        }
      ]
      const contentUserOutput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        }
      ]

      if(requiredWord) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """仔细"""`
        })
        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """${requiredWord}"""`
        })
      }
      
      if(optionWords) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.OPTION_WORDS)}: """["一个", "姑娘", "墙", "画"]"""`
        })
        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.OPTION_WORDS)}: """${JSON.stringify(optionWords)}"""`
        })
      }
      if(img_description) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一个女孩聚精会神地看着墙上挂着的一幅画。"""`
        })

        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${JSON.stringify(img_description)}"""`
        })
      }
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_SENTENCE_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": contentUserInput
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_SENTENCE_PART2)
        },
        {
          "role": "user",
          "content": contentUserOutput
        },
      ]
      return messages
    }

    async getPromptAdvancedSentencePart3(input: any, requiredWord: string, optionWords: any, img_description: string, languageCode: I18NEnum) {
      const contentUserInput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """21世纪信息技术飞速发展，已广泛应用于教育、医疗、商业和娱乐等多个领域，极大地便利了信息交流和在线学习，帮助人们跨越地域限制。然而，这也带来了对电子设备的过度依赖和个人信息安全的问题。面对这些挑战，我们需寻找平衡，提高对技术的合理使用意识，并学会如何保护自己。"""`
        }
      ]
      const contentUserOutput = [
        {
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.INPUT)}: """${input}"""`
        }
      ]

      if(requiredWord) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """技术"""`
        })
        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """${requiredWord}"""`
        })
      }
      
      if(optionWords) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.OPTION_WORDS)}: """["社会", "挑战", "教育"]"""`
        })
        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.OPTION_WORDS)}: """${JSON.stringify(optionWords)}"""`
        })
      }
      if(img_description) {
        contentUserInput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """在21世纪，信息技术迅速发展，成为生活中不可或缺的一部分，广泛应用于教育、医疗、商业和娱乐等领域。这种技术使得信息交流更为快速和便捷，人们可以轻松与全球任何地方的人联系，同时，它也推动了在线学习的普及，让更多人能够突破时间和空间的限制来学习。然而，信息技术也带来了挑战，比如过度依赖电子设备可能会影响人际交流和社交技能，个人信息安全问题也日益严重。尽管面临这些挑战，信息技术仍然为社会发展开辟了新的机会。为了最大化利用这些技术带来的好处并减少其负面影响，人们需要找到一种平衡，提高对技术使用的意识，并学习如何在数字时代保护自己。"""`
        })

        contentUserOutput.push({
          "type": "text",
          "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${JSON.stringify(img_description)}"""`
        })
      }
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_SENTENCE_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": contentUserInput
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_SENTENCE_PART3)
        },
        {
          "role": "user",
          "content": contentUserOutput
        },
      ]
      return messages
    }

    async getPromptRelatedImage(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, requiredWord, answer} = input
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_RELATED_IMAGE)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """女士专注地观赏画廊里一幅描绘窗户和花瓶的绘画作品。"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一名登山者正在陡峭的悬崖上冒险。 他们穿着攀岩装备，包括头盔和安全带，并用手臂和腿抓住岩石表面。 背景是黄昏或黎明时分的多云天空，阳光的照射营造出令人惊叹的黄橙色绚丽景象。"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_RELATED_IMAGE)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${answer}"""${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
        },
      ]
      return messages
    }

    async getPromptRelatedImagePart2(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, requiredWord, answer} = input
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_RELATED_IMAGE_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """女士在画廊里仔细欣赏一幅描绘窗户和花瓶的画作。"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一名登山者正在陡峭的悬崖上冒险。 他们穿着攀岩装备，包括头盔和安全带，并用手臂和腿抓住岩石表面。 背景是黄昏或黎明时分的多云天空，阳光的照射营造出令人惊叹的黄橙色绚丽景象。"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_RELATED_IMAGE_PART2)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${answer}"""${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
        },
      ]
      return messages
    }

    async getPromptRelatedImagePart3(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, requiredWord, answer} = input
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_RELATED_IMAGE_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """他们决定爬山，去探索陡峭的山崖。"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一名登山者正在陡峭的悬崖上冒险。 他们穿着攀岩装备，包括头盔和安全带，并用手臂和腿抓住岩石表面。 背景是黄昏或黎明时分的多云天空，阳光的照射营造出令人惊叹的黄橙色绚丽景象。"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_RELATED_IMAGE_PART3)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${answer}"""${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
        },
      ]
      return messages
    }

    async getPromptAdvancedSentenceException(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, requiredWord, answer} = input
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_SENTENCE_EXCEPTION)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """爬山"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一名登山者正在陡峭的悬崖上冒险。 他们穿着攀岩装备，包括头盔和安全带，并用手臂和腿抓住岩石表面。 背景是黄昏或黎明时分的多云天空，阳光的照射营造出令人惊叹的黄橙色绚丽景象。"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_SENTENCE_EXCEPTION)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """${requiredWord}"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
        },
      ]
      return messages
    }

    async getPromptAdvancedSentenceExceptionPart2(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, requiredWord, answer} = input
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_SENTENCE_EXCEPTION_PART2)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """仔细"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """一个艺术画廊，一个人正在观看一幅画。 这幅画充满活力，描绘了窗边有鲜花的花瓶，背景中有山景的暗示。 观众站在右侧，穿着黑色服装，背着单肩包，全神贯注地观看艺术品。 该环境在文化或教育空间内传达了一种安静沉思的感觉。"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_SENTENCE_EXCEPTION_PART2)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """${requiredWord}"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
        },
      ]
      return messages
    }

    async getPromptAdvancedSentenceExceptionPart3(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, requiredWord, answer} = input
      let contentSystem = this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_SENTENCE_EXCEPTION_PART3)
      const messages = [
        {
          "role": "system",
          "content": `${contentSystem}`
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """电脑"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """两个人坐在一台台式电脑前，似乎正在屏幕上进行一项活动，屏幕上似乎是一个覆盖在类似于“我的世界”的游戏上的编码界面。他们专注于显示器，其中一个 他们正在使用鼠标，而其他人则密切注视。 这表明学习或游戏环境。"""`
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_SENTENCE_EXCEPTION_PART3)
        },
        {
          "role": "user",
          "content": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORD)}: """${requiredWord}"""\n${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
        },
      ]
      return messages
    }

    async getPromptAdvancedRewrittenParagraph_HSK5_530002(input: any, languageCode: I18NEnum) {
      const {requiredWord, answer} = input
      const messages = [
        {
          "role": "system",
          "content": this.keyValueService.getInputPromptCustomForHSK5_530002(languageCode, requiredWord)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """握很像去北京参观胡同和吃娜些北京地道采药。我参考国大概五个左右写于北京的材料了，单丝我还知道该去那玩二。"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORDS)}: """地道、胡同、参考、请客、大概"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_1_ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530002)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """大概三天后，我回去北京见面小明.一知道这个消息，就他发给我一份参考材料，里面有北京地道菜名单和一些有名胡同的照片等内容。他还跟我说：“那天晚饭，我请客！”"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORDS)}: """地道、胡同、参考、请客、大概"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_2_ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530002)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${answer}"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.REQUIRED_WORDS)}: """${requiredWord}"""`
            }
          ]
        },
      ]
      return messages
    }
    
    async getPromptAdvancedRewrittenParagraph_HSK5_530003(input: any, img_description: string, languageCode: I18NEnum) {
      const {imgUrl, answer} = input
      const messages = [
        {
          "role": "system",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530003)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """房间里，坐着一个穿着婚纱的女孩，笑容灿烂。"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """今天握闺蜜很高兴，之所以他笑地很大。我不知道她为什么这吗高兴，单丝她高新我也高兴。我觉的她很票量。"""`
            },
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530003)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PICTURE_CONTENT)}: """${img_description}"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${answer}"""`
            }
          ]
        },
      ]
      return messages
    }
    
    async getPromptAdvancedRewrittenParagraph_HSK6_630001(answerClearBreak: string, miaTitile: string, miaAnswer: string, languageCode: I18NEnum) {
      const messages = [
        {
          "role": "system",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PARAGRAPH_TOPIC)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_TOPIC_PART1)}"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.MIA_ANSWER)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_MIA_ANSWER_PART1)}"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.LEARN_SUMMARY)}: """${this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.USER_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_SUMMARY_PART1)}"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_PART1)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.PARAGRAPH_TOPIC)}: """${miaTitile}"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.MIA_ANSWER)}: """${miaAnswer}"""`
            },
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.LEARN_SUMMARY)}: """${answerClearBreak}"""`
            }
          ]
        },
      ]
      return messages
    }

    async getPromptCriteria_OverallEvaluation(input: any, languageCode: I18NEnum) {
      const messages = [
        {
          "role": "system",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.SYSTEM_INPUT_OVERALL_EVALUATION)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${this.keyValueService.getInputPromptCustomForOverallEvaluation(languageCode)}"""`
            }
          ]
        },
        {
          "role": "assistant",
          "content": this.keyValueService.getValueFromKeyInputRoleChatGPTEnum(languageCode, KeyRoleForKeyRoleEnum.ASSISTANT_INPUT_OVERALL_EVALUATION)
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `${this.keyValueService.getValueFromKeyEnum(languageCode, KeyForKeyEnum.ANSWER)}: """${input}"""`
            }
          ]
        },
      ]
      return messages
    }

    async scoringHSK4_430002(input: ScoringHSK4_430002InputDto, img_description: string) {
      try {
        const dataCriteriaHSK4_430002_AnswerEvaluation: HSKAnswerEvaluationDto[] = [
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.GRAMMATICAL_RANGE_AND_ACCURACY),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.GRAMMATICAL_RANGE_AND_ACCURACY)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.LEXICAL_RESOURCE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.LEXICAL_RESOURCE)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.COHERENCE_AND_COHERENCE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.COHERENCE_AND_COHERENCE_HSK4)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.CONTENT_AND_TASK_RESPONSE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_HSK4_SATISFY)}`
          }
        ]
        const [
          promptCriteria_GrammaticalRange,
          promptCriteria_GrammaticalRangePart2,
          promptCriteria_GrammaticalRangePart3,
          promptCriteria_GrammaticalAccuracy,
          promptCriteria_GrammaticalAccuracyPart2,
          promptCriteria_GrammaticalAccuracyPart3,
          promptCriteria_GrammaticalAccuracyPart4,
          promptCriteria_GrammaticalAccuracyPart5,
          promptCriteria_LexicalResource,
          promptCriteria_LexicalResourcePart2,
          promptCriteria_LexicalResourcePart3,
          promptCriteria_LexicalResourcePart4,
          promptCriteria_LexicalResourcePart5,
          promptCriteria_CoherenceAndCohesion,
          promptCriteria_CoherenceAndCohesionPart2,
          promptCriteria_CoherenceAndCohesionPart3,
        ] = await Promise.all([
          this.getPromptCriteria_GrammaticalRange(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalRangePart2(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalRangePart3(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracy(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart2(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart3(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart4(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart5(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResource(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart2(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart3(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart4(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart5(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesion(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesionPart2(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesionPart3(input.answer, input.languageCode),
        ])
        
        try {
            const [
              responseCriteria_GrammaticalRange, 
              responseCriteria_GrammaticalRangePart2, 
              responseCriteria_GrammaticalRangePart3, 
              responseCriteria_GrammaticalAccuracy,
              responseCriteria_GrammaticalAccuracyPart2,
              responseCriteria_GrammaticalAccuracyPart3,
              responseCriteria_GrammaticalAccuracyPart4,
              responseCriteria_GrammaticalAccuracyPart5,
              responseCriteria_LexicalResource,
              responseCriteria_LexicalResourcePart2,
              responseCriteria_LexicalResourcePart3,
              responseCriteria_LexicalResourcePart4,
              responseCriteria_LexicalResourcePart5,
              responseCriteria_CoherenceAndCohesion,
              responseCriteria_CoherenceAndCohesionPart2,
              responseCriteria_CoherenceAndCohesionPart3,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptCriteria_GrammaticalRange, GRAMMATICAL_RANGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_GrammaticalRangePart2, GRAMMATICAL_RANGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_GrammaticalRangePart3, GRAMMATICAL_RANGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar(promptCriteria_GrammaticalAccuracy, GRAMMATICAL_ACCURACY_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar(promptCriteria_GrammaticalAccuracyPart2, GRAMMATICAL_ACCURACY_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar(promptCriteria_GrammaticalAccuracyPart3, GRAMMATICAL_ACCURACY_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar(promptCriteria_GrammaticalAccuracyPart4, GRAMMATICAL_ACCURACY_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar(promptCriteria_GrammaticalAccuracyPart5, GRAMMATICAL_ACCURACY_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling(promptCriteria_LexicalResource, LEXICAL_RESOURCE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling(promptCriteria_LexicalResourcePart2, LEXICAL_RESOURCE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling(promptCriteria_LexicalResourcePart3, LEXICAL_RESOURCE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling(promptCriteria_LexicalResourcePart4, LEXICAL_RESOURCE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling(promptCriteria_LexicalResourcePart5, LEXICAL_RESOURCE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesion, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart2, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart3, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
            ]) 
            const chatGPTUsageAll = [
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalRange, responseCriteria_GrammaticalRange, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalRangePart2, responseCriteria_GrammaticalRangePart2, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalRangePart3, responseCriteria_GrammaticalRangePart3, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracy, responseCriteria_GrammaticalAccuracy, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart2, responseCriteria_GrammaticalAccuracyPart2, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart3, responseCriteria_GrammaticalAccuracyPart3, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart4, responseCriteria_GrammaticalAccuracyPart4, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart5, responseCriteria_GrammaticalAccuracyPart5, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResource, responseCriteria_LexicalResource, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart2, responseCriteria_LexicalResourcePart2, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart3, responseCriteria_LexicalResourcePart3, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart4, responseCriteria_LexicalResourcePart4, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart5, responseCriteria_LexicalResourcePart5, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesion, responseCriteria_CoherenceAndCohesion, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart2, responseCriteria_CoherenceAndCohesionPart2, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart3, responseCriteria_CoherenceAndCohesionPart3, ChatGPTProjectKeyEnum.HSK_430002)
            ]
            const [
              promptRelatedImage,
              promptRelatedImagePart2,
              promptRelatedImagePart3,
            ] = await Promise.all([
              this.getPromptRelatedImage(input, img_description, input.languageCode),
              this.getPromptRelatedImagePart2(input, img_description, input.languageCode),
              this.getPromptRelatedImagePart3(input, img_description, input.languageCode),
            ])

            const [
              responseRelatedImage,
              responseRelatedImagePart2,
              responseRelatedImagePart3,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptRelatedImage, RELATED_IMAGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptRelatedImagePart2, RELATED_IMAGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptRelatedImagePart3, RELATED_IMAGE_SCHEMA, input.languageCode),
            ])

            const responseRelatedImageArr = [responseRelatedImage.data, responseRelatedImagePart2.data, responseRelatedImagePart3.data]
            const satisfyRelatedImageFinal = ([
              (responseRelatedImageArr[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseRelatedImageArr[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseRelatedImageArr[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseRelatedImageArr[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseRelatedImageArr[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseRelatedImageArr[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
            if(satisfyRelatedImageFinal) {
              const analysisRelatedImag = responseRelatedImageArr.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.explain && ele?.explain !== "0")
              if(analysisRelatedImag) dataCriteriaHSK4_430002_AnswerEvaluation[3].analysis += `\n${analysisRelatedImag?.explain}`
            } else {
              const analysisRelatedImag = responseRelatedImageArr.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.explain && ele?.explain !== "0")
              if(analysisRelatedImag) dataCriteriaHSK4_430002_AnswerEvaluation[3].analysis += `\n${analysisRelatedImag?.explain}`
            }
            let dataAdvancedSentenceRawResponse = null
            let dataAdvancedVocabularyResponse = null
            const [
              promptAdvancedVocabulary,
              promptAdvancedVocabularyPart2,
              promptAdvancedVocabularyPart3,
            ] = await Promise.all([
              this.getPromptAdvancedVocabulary(input.answer, img_description, input.languageCode),
              this.getPromptAdvancedVocabularyPart2(input.answer, img_description, input.languageCode),
              this.getPromptAdvancedVocabularyPart3(input.answer, img_description, input.languageCode),
            ])

            const [
              responseAdvancedVocabulary,
              responseAdvancedVocabularyPart2,
              responseAdvancedVocabularyPart3,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptAdvancedVocabulary, ADVANCED_VOCABULARY_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0),
              this.openAIService.getDataFromChatGPT(promptAdvancedVocabularyPart2, ADVANCED_VOCABULARY_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0),
              this.openAIService.getDataFromChatGPT(promptAdvancedVocabularyPart3, ADVANCED_VOCABULARY_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0),
            ])
            const wordsOptionRaw = []
            const dataAdvancedVocabularyResponseRaw = [
              ...responseAdvancedVocabulary.data.suggestedVocabulary,
              ...responseAdvancedVocabularyPart2.data.suggestedVocabulary,
              ...responseAdvancedVocabularyPart3.data.suggestedVocabulary
            ].filter(item => {
              if(item.term.includes(input.requiredWord)) return false
              const matches = (item?.reason.toString()).match(/\[(.*?)\]/g);
              const matches1 = (item?.reason.toString()).match(/\'(.*?)\'/g);
              if(matches) {
                  const extractedTerms = matches.map((match) => match.replace(/[\[\]]/g, ''));
                  wordsOptionRaw.push(...extractedTerms.filter(value => !/^[a-zA-Z\s]+$/.test(value)));

              }
              if(matches1) {
                  const extractedTerms1 = matches1.map((match) => match.replace(/[\'\']/g, ''));
                  wordsOptionRaw.push(...extractedTerms1.filter(value => !/^[a-zA-Z\s]+$/.test(value)));
              }
              return true
            })
            // dataAdvancedVocabularyResponse = this.uniqueObjectsByTerm(dataAdvancedVocabularyResponseRaw)
            dataAdvancedVocabularyResponse = dataAdvancedVocabularyResponseRaw.filter(ele => /[\u4E00-\u9FFF]/.test(ele.reason) && (!(ele.reason?.toUpperCase()).includes("LỖI") && !(ele.reason?.toUpperCase()).includes("ERROR")) && !(this.detailTasksService.extractChineseCharacters(ele.reason).length == 1 && this.detailTasksService.extractChineseCharacters(ele.reason)[0] == ele.term))
            chatGPTUsageAll.push(
              this.createCustomChatGPTUsage(promptRelatedImage, responseRelatedImage, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptRelatedImagePart2, responseRelatedImagePart2, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptRelatedImagePart3, responseRelatedImagePart3, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptAdvancedVocabulary, responseAdvancedVocabulary, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptAdvancedVocabularyPart2, responseAdvancedVocabularyPart2, ChatGPTProjectKeyEnum.HSK_430002),
              this.createCustomChatGPTUsage(promptAdvancedVocabularyPart3, responseAdvancedVocabularyPart3, ChatGPTProjectKeyEnum.HSK_430002)
            )
            if(satisfyRelatedImageFinal) {
              const wordsOption = [...new Set(wordsOptionRaw)]
              const [
                promptAdvancedSentence,
                promptAdvancedSentencePart2,
                promptAdvancedSentencePart3,
              ] = await Promise.all([
                this.getPromptAdvancedSentence(input.answer, input.requiredWord, wordsOption, img_description, input.languageCode),
                this.getPromptAdvancedSentencePart2(input.answer, input.requiredWord, wordsOption, img_description, input.languageCode),
                this.getPromptAdvancedSentencePart3(input.answer, input.requiredWord, wordsOption, img_description, input.languageCode)
              ])
              const [
                responseAdvancedSentence,
                responseAdvancedSentencePart2,
                responseAdvancedSentencePart3,
              ] = await Promise.all([
                this.openAIService.getDataFromChatGPT(promptAdvancedSentence, ADVANCED_SENTENCE_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
                this.openAIService.getDataFromChatGPT(promptAdvancedSentencePart2, ADVANCED_SENTENCE_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
                this.openAIService.getDataFromChatGPT(promptAdvancedSentencePart3, ADVANCED_SENTENCE_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
              ]);
              chatGPTUsageAll.push(
                this.createCustomChatGPTUsage(promptAdvancedSentence, responseAdvancedSentence, ChatGPTProjectKeyEnum.HSK_430002),
                this.createCustomChatGPTUsage(promptAdvancedSentencePart2, responseAdvancedSentencePart2, ChatGPTProjectKeyEnum.HSK_430002),
                this.createCustomChatGPTUsage(promptAdvancedSentencePart3, responseAdvancedSentencePart3, ChatGPTProjectKeyEnum.HSK_430002),
              )
              dataAdvancedSentenceRawResponse = [...new Set([
                ...responseAdvancedSentence.data.suggestedSentence,
                ...responseAdvancedSentencePart2.data.suggestedSentence,
                ...responseAdvancedSentencePart3.data.suggestedSentence,
              ])].filter(ele => {
                let requiredWordArr = (input.requiredWord).split("、")
                if((input.requiredWord).includes("，")) {
                  requiredWordArr = (input.requiredWord).split("，")
                }
                for (const requiredWord of requiredWordArr) {
                  if (ele.includes(requiredWord)) return true
                }
                return false
              })
            }
            else {
              const [
                promptAdvancedSentenceException,
                promptAdvancedSentenceExceptionPart2,
                promptAdvancedSentenceExceptionPart3,
              ] = await Promise.all([
                this.getPromptAdvancedSentenceException(input, img_description, input.languageCode),
                this.getPromptAdvancedSentenceExceptionPart2(input, img_description, input.languageCode),
                this.getPromptAdvancedSentenceExceptionPart3(input, img_description, input.languageCode)
              ])
              const [
                responseAdvancedSentenceException,
                responseAdvancedSentenceExceptionPart2,
                responseAdvancedSentenceExceptionPart3,
              ] = await Promise.all([
                this.openAIService.getDataFromChatGPT(promptAdvancedSentenceException, ADVANCED_SENTENCE_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
                this.openAIService.getDataFromChatGPT(promptAdvancedSentenceExceptionPart2, ADVANCED_SENTENCE_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
                this.openAIService.getDataFromChatGPT(promptAdvancedSentenceExceptionPart3, ADVANCED_SENTENCE_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
              ]);
              chatGPTUsageAll.push(
                this.createCustomChatGPTUsage(promptAdvancedSentenceException, responseAdvancedSentenceException, ChatGPTProjectKeyEnum.HSK_430002),
                this.createCustomChatGPTUsage(promptAdvancedSentenceExceptionPart2, responseAdvancedSentenceExceptionPart2, ChatGPTProjectKeyEnum.HSK_430002),
                this.createCustomChatGPTUsage(promptAdvancedSentenceExceptionPart3, responseAdvancedSentenceExceptionPart3, ChatGPTProjectKeyEnum.HSK_430002),
              )
              dataAdvancedSentenceRawResponse = [...new Set([
                ...responseAdvancedSentenceException.data.suggestedSentence,
                ...responseAdvancedSentenceExceptionPart2.data.suggestedSentence,
                ...responseAdvancedSentenceExceptionPart3.data.suggestedSentence,
              ])].filter(ele => {
                let requiredWordArr = (input.requiredWord).split("、")
                if((input.requiredWord).includes("，")) {
                  requiredWordArr = (input.requiredWord).split("，")
                }
                for (const requiredWord of requiredWordArr) {
                  if (ele.includes(requiredWord)) return true
                }
                return false
              })
            }
            const dataAdvancedSentenceFinalResponse = dataAdvancedSentenceRawResponse.map(ele => {
              return {
                "sentencesUse": ele,
                "reasonUse": null
              }
            })

            const listUseChatGPT = await this.chatGPTUsageRepository.create(chatGPTUsageAll)
            const listIdsChatGPT = listUseChatGPT.map(ele => ele.id)

            const responseCheckSpellingArr = [responseCriteria_LexicalResource.data, responseCriteria_LexicalResourcePart2.data, responseCriteria_LexicalResourcePart3.data, responseCriteria_LexicalResourcePart4.data, responseCriteria_LexicalResourcePart5.data]
            const totalSpellingError = parseInt(Boolean(responseCheckSpellingArr[0]?.errors) ? (!isNaN(responseCheckSpellingArr[0]?.errors) ? responseCheckSpellingArr[0]?.errors : 1): 0)
            const totalSpellingErrorPart2 = parseInt(Boolean(responseCheckSpellingArr[1]?.errors) ? (!isNaN(responseCheckSpellingArr[1]?.errors) ? responseCheckSpellingArr[1]?.errors : 1): 0)
            const totalSpellingErrorPart3 = parseInt(Boolean(responseCheckSpellingArr[2]?.errors) ? (!isNaN(responseCheckSpellingArr[2]?.errors) ? responseCheckSpellingArr[2]?.errors : 1): 0)
            const totalSpellingErrorPart4 = parseInt(Boolean(responseCheckSpellingArr[3]?.errors) ? (!isNaN(responseCheckSpellingArr[3]?.errors) ? responseCheckSpellingArr[3]?.errors : 1): 0)
            const totalSpellingErrorPart5 = parseInt(Boolean(responseCheckSpellingArr[4]?.errors) ? (!isNaN(responseCheckSpellingArr[4]?.errors) ? responseCheckSpellingArr[4]?.errors : 1): 0)
            let totalSpellingErrorsFinal = Math.round((totalSpellingError+totalSpellingErrorPart2+totalSpellingErrorPart3+totalSpellingErrorPart4+totalSpellingErrorPart5)/responseCheckSpellingArr.length)
            // const totalSpellingErrorArr = [totalSpellingError, totalSpellingErrorPart2, totalSpellingErrorPart3, totalSpellingErrorPart4, totalSpellingErrorPart5]
            // if(totalSpellingErrorArr.filter(ele => ele === 0).length >= 3 || (totalSpellingErrorArr.filter(ele => ele === 0).length >= 1 && totalSpellingErrorsFinal <= 1)) totalSpellingErrorsFinal = 0
            
            if(totalSpellingErrorsFinal > 0) {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalSpellingErrorsFinal) && ele?.analysis)
              if(analysisSpell) {
                dataCriteriaHSK4_430002_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            } else {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalSpellingErrorsFinal) && ele?.analysis)
              if(analysisSpell) {
                dataCriteriaHSK4_430002_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            }

            const responseCheckGrammaticalErrors = [responseCriteria_GrammaticalAccuracy.data, responseCriteria_GrammaticalAccuracyPart2.data, responseCriteria_GrammaticalAccuracyPart3.data, responseCriteria_GrammaticalAccuracyPart4.data, responseCriteria_GrammaticalAccuracyPart5.data]
            const totalGrammaticalErrors = parseInt(Boolean(responseCheckGrammaticalErrors[0]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[0]?.errors) ? responseCheckGrammaticalErrors[0]?.errors : 1): 0)
            const totalGrammaticalErrorsPart2 = parseInt(Boolean(responseCheckGrammaticalErrors[1]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[1]?.errors) ? responseCheckGrammaticalErrors[1]?.errors : 1): 0)
            const totalGrammaticalErrorsPart3 = parseInt(Boolean(responseCheckGrammaticalErrors[2]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[2]?.errors) ? responseCheckGrammaticalErrors[2]?.errors : 1): 0)
            const totalGrammaticalErrorsPart4 = parseInt(Boolean(responseCheckGrammaticalErrors[3]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[3]?.errors) ? responseCheckGrammaticalErrors[3]?.errors : 1): 0)
            const totalGrammaticalErrorsPart5 = parseInt(Boolean(responseCheckGrammaticalErrors[4]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[4]?.errors) ? responseCheckGrammaticalErrors[4]?.errors : 1): 0)
            let totalGrammaticalErrorsFinal = Math.round((totalGrammaticalErrors+totalGrammaticalErrorsPart2+totalGrammaticalErrorsPart3+totalGrammaticalErrorsPart4+totalGrammaticalErrorsPart5)/responseCheckGrammaticalErrors.length)
            // const totalGrammaticalErrorsArr = [totalGrammaticalErrors, totalGrammaticalErrorsPart2, totalGrammaticalErrorsPart3, totalGrammaticalErrorsPart4, totalGrammaticalErrorsPart5]
            // if(totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 3 || (totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 1 && totalGrammaticalErrorsFinal <= 1)) totalGrammaticalErrorsFinal = 0
            
            if(totalGrammaticalErrorsFinal > 0) {
              const analysisGrammatical= responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "")
              if(analysisGrammatical) {
                dataCriteriaHSK4_430002_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            } else {
              const analysisGrammatical = responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "")
              if(analysisGrammatical) {
                dataCriteriaHSK4_430002_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            }
            const responseGrammaticalComplexity = [responseCriteria_GrammaticalRange.data, responseCriteria_GrammaticalRangePart2.data, responseCriteria_GrammaticalRangePart3.data]
            const satisfyGrammaticalComplexity = ([
              (responseGrammaticalComplexity[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseGrammaticalComplexity[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseGrammaticalComplexity[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseGrammaticalComplexity[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseGrammaticalComplexity[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseGrammaticalComplexity[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
            if(satisfyGrammaticalComplexity) {
              const analysisGrammaticalComplexity = responseGrammaticalComplexity.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.explain && ele?.explain !== "0")
              if(analysisGrammaticalComplexity) dataCriteriaHSK4_430002_AnswerEvaluation[0].analysis += `\n${analysisGrammaticalComplexity?.explain}\n${analysisGrammaticalComplexity?.analysis}`
            } else {
              const analysisGrammaticalComplexity = responseGrammaticalComplexity.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.explain && ele?.explain !== "0")
              if(analysisGrammaticalComplexity) dataCriteriaHSK4_430002_AnswerEvaluation[0].analysis += `\n${analysisGrammaticalComplexity?.explain}\n${analysisGrammaticalComplexity?.analysis}`
            }

            const responseCoherenceAndCohesion = [responseCriteria_CoherenceAndCohesion.data, responseCriteria_CoherenceAndCohesionPart2.data, responseCriteria_CoherenceAndCohesionPart3.data]
            const satisfyCriteria_CoherenceAndCohesion = ([
              (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
            if(satisfyCriteria_CoherenceAndCohesion) {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.analysis && ele?.analysis !== "0")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined") 
                dataCriteriaHSK4_430002_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            } else {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.analysis && ele?.analysis !== "0")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined") dataCriteriaHSK4_430002_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            }
            const dataCriteriaHSK4_430002 =  dataCriteriaHSK4_430002_AnswerEvaluation.map(ele => {
              return {
                ...ele,
                analysis: ele.analysis.replace("undefined", "").trim().replace(/^\n+|\n+$/g, '')
              }
            })
            
            return {
                dataCriteria_GrammaticalRange: totalGrammaticalErrorsFinal,
                dataCriteria_GrammaticalAccuracy: satisfyGrammaticalComplexity,
                dataCriteria_LexicalResource: totalSpellingErrorsFinal,
                dataCheckRelatedImage: satisfyRelatedImageFinal,
                dataCriteria_CoherenceAndCohesion:satisfyCriteria_CoherenceAndCohesion,
                dataAdvancedVocabularyResponse: dataAdvancedVocabularyResponse,
                dataAdvancedSentenceFinalResponse: dataAdvancedSentenceFinalResponse,
                dataCriteriaHSK4_430002: dataCriteriaHSK4_430002,
                listIdsChatGPT: listIdsChatGPT
            }; 
        } catch (error) {
          await this.fileService.addValueToFile(`${error.name}: ${error.message}\n${error.stack}`, LOG_FILE)
          throw new Error(`Failed to score HSK4_430002: ${error.message}`);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    async scoringHSK5_530002(input: ScoringHSK5_530002InputDto) {
      try {
        let requiredWordArr = (input.requiredWord).split("、")
        if((input.requiredWord).includes("，")) {
          requiredWordArr = (input.requiredWord).split("，")
        }
        const [
          promptCriteria_CoherenceAndCohesion,
          promptCriteria_CoherenceAndCohesionPart2,
          promptCriteria_CoherenceAndCohesionPart3,
          promptCriteria_GrammaticalAccuracy,
          promptCriteria_GrammaticalAccuracyPart2,
          promptCriteria_GrammaticalAccuracyPart3,
          promptCriteria_LexicalResource,
          promptCriteria_LexicalResourcePart2,
          promptCriteria_LexicalResourcePart3,
          promptAdvancedRewrittenParagraph_HSK5_530002,
        ] = await Promise.all([
          this.getPromptCriteria_CoherenceAndCohesion(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesionPart2(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesionPart3(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracy_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart2_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart3_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResource_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart2_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart3_HSK56(input.answer, input.languageCode),
          this.getPromptAdvancedRewrittenParagraph_HSK5_530002(input, input.languageCode),
        ])
        
        try {
            const [
              responseCriteria_CoherenceAndCohesion,
              responseCriteria_CoherenceAndCohesionPart2,
              responseCriteria_CoherenceAndCohesionPart3,
              responseCriteria_GrammaticalAccuracy,
              responseCriteria_GrammaticalAccuracyPart2,
              responseCriteria_GrammaticalAccuracyPart3,
              responseCriteria_LexicalResource,
              responseCriteria_LexicalResourcePart2,
              responseCriteria_LexicalResourcePart3,
              responseAdvancedRewrittenParagraph_HSK5_530002,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesion, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart2, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart3, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracy, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode, requiredWordArr),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracyPart2, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode, requiredWordArr),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracyPart3, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode, requiredWordArr),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResource, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode, requiredWordArr),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResourcePart2, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode, requiredWordArr),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResourcePart3, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode, requiredWordArr),
              this.openAIService.getDataFromChatGPT_HSK5_530002(input.requiredWord, promptAdvancedRewrittenParagraph_HSK5_530002, ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530002_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
            ]) 
            
            const chatGPTUsageAll = [
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesion, responseCriteria_CoherenceAndCohesion, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart2, responseCriteria_CoherenceAndCohesionPart2, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart3, responseCriteria_CoherenceAndCohesionPart3, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracy, responseCriteria_GrammaticalAccuracy, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart2, responseCriteria_GrammaticalAccuracyPart2, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart3, responseCriteria_GrammaticalAccuracyPart3, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResource, responseCriteria_LexicalResource, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart2, responseCriteria_LexicalResourcePart2, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart3, responseCriteria_LexicalResourcePart3, ChatGPTProjectKeyEnum.HSK_530002),
              this.createCustomChatGPTUsage(promptAdvancedRewrittenParagraph_HSK5_530002, responseAdvancedRewrittenParagraph_HSK5_530002, ChatGPTProjectKeyEnum.HSK_530002),
            ]
            const listUseChatGPT = await this.chatGPTUsageRepository.create(chatGPTUsageAll)
            const listIdsChatGPT = listUseChatGPT.map(ele => ele.id)

            const dataCriteriaHSK5_530002_AnswerEvaluation: HSKAnswerEvaluationDto[] = [
              {
                "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.GRAMMATICAL_RANGE_AND_ACCURACY),
                "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.GRAMMATICAL_RANGE_AND_ACCURACY)}`
              },
              {
                "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.LEXICAL_RESOURCE),
                "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.LEXICAL_RESOURCE)}`
              },
              {
                "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.COHERENCE_AND_COHERENCE),
                "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.COHERENCE_AND_COHERENCE)}`
              },
              {
                "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.CONTENT_AND_TASK_RESPONSE),
                "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_HSK530002_SATISFY)}`
              }
            ]
            const responseCheckSpellingArr = [responseCriteria_LexicalResource.data, responseCriteria_LexicalResourcePart2.data, responseCriteria_LexicalResourcePart3.data]
            const totalSpellingError = parseInt(Boolean(responseCheckSpellingArr[0]?.errors) ? (!isNaN(responseCheckSpellingArr[0]?.errors) ? responseCheckSpellingArr[0]?.errors : 1): 0)
            const totalSpellingErrorPart2 = parseInt(Boolean(responseCheckSpellingArr[1]?.errors) ? (!isNaN(responseCheckSpellingArr[1]?.errors) ? responseCheckSpellingArr[1]?.errors : 1): 0)
            const totalSpellingErrorPart3 = parseInt(Boolean(responseCheckSpellingArr[2]?.errors) ? (!isNaN(responseCheckSpellingArr[2]?.errors) ? responseCheckSpellingArr[2]?.errors : 1): 0)
            let totalSpellingErrorsFinal = Math.round((totalSpellingError+totalSpellingErrorPart2+totalSpellingErrorPart3)/responseCheckSpellingArr.length)
            // const totalSpellingErrorArr = [totalSpellingError, totalSpellingErrorPart2, totalSpellingErrorPart3, totalSpellingErrorPart4, totalSpellingErrorPart5]
            // if(totalSpellingErrorArr.filter(ele => ele === 0).length >= 3 || (totalSpellingErrorArr.filter(ele => ele === 0).length >= 1 && totalSpellingErrorsFinal <= 1)) totalSpellingErrorsFinal = 0
            
            if(totalSpellingErrorsFinal > 0) {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalSpellingErrorsFinal) && ele?.analysis && ele?.analysis !== "")
              if(analysisSpell) {
                dataCriteriaHSK5_530002_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            } else {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalSpellingErrorsFinal) && ele?.analysis && ele?.analysis !== "")
              if(analysisSpell) {
                dataCriteriaHSK5_530002_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            }

            const responseCheckGrammaticalErrors = [responseCriteria_GrammaticalAccuracy.data, responseCriteria_GrammaticalAccuracyPart2.data, responseCriteria_GrammaticalAccuracyPart3.data]
            const totalGrammaticalErrors = parseInt(Boolean(responseCheckGrammaticalErrors[0]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[0]?.errors) ? responseCheckGrammaticalErrors[0]?.errors : 1): 0)
            const totalGrammaticalErrorsPart2 = parseInt(Boolean(responseCheckGrammaticalErrors[1]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[1]?.errors) ? responseCheckGrammaticalErrors[1]?.errors : 1): 0)
            const totalGrammaticalErrorsPart3 = parseInt(Boolean(responseCheckGrammaticalErrors[2]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[2]?.errors) ? responseCheckGrammaticalErrors[2]?.errors : 1): 0)
            let totalGrammaticalErrorsFinal = Math.round((totalGrammaticalErrors+totalGrammaticalErrorsPart2+totalGrammaticalErrorsPart3)/responseCheckGrammaticalErrors.length)
            // const totalGrammaticalErrorsArr = [totalGrammaticalErrors, totalGrammaticalErrorsPart2, totalGrammaticalErrorsPart3, totalGrammaticalErrorsPart4, totalGrammaticalErrorsPart5]
            // if(totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 3 || (totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 1 && totalGrammaticalErrorsFinal <= 1)) totalGrammaticalErrorsFinal = 0
            
            if(totalGrammaticalErrorsFinal > 0) {
              const analysisGrammatical= responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "")
              if(analysisGrammatical) {
                dataCriteriaHSK5_530002_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            } else {
              const analysisGrammatical = responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "")
              if(analysisGrammatical) {
                dataCriteriaHSK5_530002_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            }

            const responseCoherenceAndCohesion = [responseCriteria_CoherenceAndCohesion.data, responseCriteria_CoherenceAndCohesionPart2.data, responseCriteria_CoherenceAndCohesionPart3.data]
            const satisfyCriteria_CoherenceAndCohesion = ([
              (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
            if(satisfyCriteria_CoherenceAndCohesion) {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK5_530002_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            } else {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes("NO"?.toUpperCase() )) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK5_530002_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            }

            const dataCriteriaHSK5_530002 =  dataCriteriaHSK5_530002_AnswerEvaluation.map(ele => {
              return {
                ...ele,
                analysis: ele.analysis.replace("undefined", "").trim().replace(/^\n+|\n+$/g, '')
              }
            })

            let dataAdvancedVocabularyResponse = responseAdvancedRewrittenParagraph_HSK5_530002.data.vocabularies.filter(ele => /[a-zA-Z]/.test(ele))
            dataAdvancedVocabularyResponse = dataAdvancedVocabularyResponse.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(ele.vocabularyUse)
              const flag1 = !requiredWordArr.some(keyword => `${ele.vocabularyUse}${ele.reasonUse}`.includes(keyword))
              const flag2 = checkChineseWords.length === new Set(checkChineseWords).size;
              const flag3 = /[a-zA-Z]/.test(ele)
              const flag4 = !(checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1])
              return flag1 && flag2 && flag3 && flag4
            })
            const dataAdvancedSentenceFinalResponse = responseAdvancedRewrittenParagraph_HSK5_530002.data.sentences.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractQuotedSentences(ele.sentencesUse)
              if((checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1]) || checkChineseWords.length > 2) return false  
              return true
            })
            const dataAdvancedParagraphFinalResponse = responseAdvancedRewrittenParagraph_HSK5_530002.data.bestUpgradeAnswer

            return {
              dataCriteria_CoherenceAndCohesion: satisfyCriteria_CoherenceAndCohesion,
              dataCriteria_GrammaticalAccuracy: totalGrammaticalErrorsFinal,
              dataCriteria_LexicalResource: totalSpellingErrorsFinal,
              dataAdvancedVocabularyResponse: dataAdvancedVocabularyResponse,
              dataAdvancedSentenceFinalResponse: dataAdvancedSentenceFinalResponse,
              dataAdvancedParagraphFinalResponse: dataAdvancedParagraphFinalResponse,
              dataCriteriaHSK5_530002: dataCriteriaHSK5_530002,
              listIdsChatGPT: listIdsChatGPT
            }; 
        } catch (error) {
          console.log(error)
          await this.fileService.addValueToFile(`${error.name}: ${error.message}\n${error.stack}`, LOG_FILE)
          throw new Error(`Failed to score HSK5_530002: ${error.message}`);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    async scoringHSK5_530003(input: ScoringHSK5_530003InputDto, img_description: string) {
      try {
        const dataCriteriaHSK5_530003_AnswerEvaluation: HSKAnswerEvaluationDto[] = [
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.GRAMMATICAL_RANGE_AND_ACCURACY),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.GRAMMATICAL_RANGE_AND_ACCURACY)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.LEXICAL_RESOURCE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.LEXICAL_RESOURCE)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.COHERENCE_AND_COHERENCE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.COHERENCE_AND_COHERENCE)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.CONTENT_AND_TASK_RESPONSE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.CONTENT_AND_TASK_RESPONSE_COMMON_HSK530003_SATISFY)}`
          }
        ]
        const [
          promptCriteria_CoherenceAndCohesion,
          promptCriteria_CoherenceAndCohesionPart2,
          promptCriteria_CoherenceAndCohesionPart3,
          promptCriteria_GrammaticalAccuracy,
          promptCriteria_GrammaticalAccuracyPart2,
          promptCriteria_GrammaticalAccuracyPart3,
          promptCriteria_LexicalResource,
          promptCriteria_LexicalResourcePart2,
          promptCriteria_LexicalResourcePart3,
          promptAdvancedRewrittenParagraph_HSK5_530003,
        ] = await Promise.all([
          this.getPromptCriteria_CoherenceAndCohesion(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesionPart2(input.answer, input.languageCode),
          this.getPromptCriteria_CoherenceAndCohesionPart3(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracy_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart2_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_GrammaticalAccuracyPart3_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResource_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart2_HSK56(input.answer, input.languageCode),
          this.getPromptCriteria_LexicalResourcePart3_HSK56(input.answer, input.languageCode),
          this.getPromptAdvancedRewrittenParagraph_HSK5_530003(input, img_description, input.languageCode),
        ])
        
        try {
            const [
              responseCriteria_CoherenceAndCohesion,
              responseCriteria_CoherenceAndCohesionPart2,
              responseCriteria_CoherenceAndCohesionPart3,
              responseCriteria_GrammaticalAccuracy,
              responseCriteria_GrammaticalAccuracyPart2,
              responseCriteria_GrammaticalAccuracyPart3,
              responseCriteria_LexicalResource,
              responseCriteria_LexicalResourcePart2,
              responseCriteria_LexicalResourcePart3,
              responseAdvancedRewrittenParagraph_HSK5_530003,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesion, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart2, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart3, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracy, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracyPart2, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracyPart3, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResource, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResourcePart2, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResourcePart3, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_HSK5_530003(promptAdvancedRewrittenParagraph_HSK5_530003, ADVANCED_REWRITTEN_PARAGRAPH_HSK5_530003_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI),
            ]) 

            const [
              promptRelatedImage,
              promptRelatedImagePart2,
              promptRelatedImagePart3,
            ] = await Promise.all([
              this.getPromptRelatedImage(input, img_description, input.languageCode),
              this.getPromptRelatedImagePart2(input, img_description, input.languageCode),
              this.getPromptRelatedImagePart3(input, img_description, input.languageCode),
            ])

            const [
              responseRelatedImage,
              responseRelatedImagePart2,
              responseRelatedImagePart3,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptRelatedImage, RELATED_IMAGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptRelatedImagePart2, RELATED_IMAGE_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptRelatedImagePart3, RELATED_IMAGE_SCHEMA, input.languageCode),
            ])

            const responseRelatedImageArr = [responseRelatedImage.data, responseRelatedImagePart2.data, responseRelatedImagePart3.data]
            const satisfyRelatedImageFinal = ([
              (responseRelatedImageArr[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseRelatedImageArr[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseRelatedImageArr[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseRelatedImageArr[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseRelatedImageArr[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseRelatedImageArr[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
            if(satisfyRelatedImageFinal) {
              const analysisRelatedImag = responseRelatedImageArr.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.explain && ele?.explain !== "0")
              if(analysisRelatedImag) dataCriteriaHSK5_530003_AnswerEvaluation[3].analysis = `${analysisRelatedImag?.explain}`
            } else {
              const analysisRelatedImag = responseRelatedImageArr.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.explain && ele?.explain !== "0")
              if(analysisRelatedImag) dataCriteriaHSK5_530003_AnswerEvaluation[3].analysis = `${analysisRelatedImag?.explain}`
            }

            const chatGPTUsageAll = [
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesion, responseCriteria_CoherenceAndCohesion, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart2, responseCriteria_CoherenceAndCohesionPart2, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart3, responseCriteria_CoherenceAndCohesionPart3, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracy, responseCriteria_GrammaticalAccuracy, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart2, responseCriteria_GrammaticalAccuracyPart2, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart3, responseCriteria_GrammaticalAccuracyPart3, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResource, responseCriteria_LexicalResource, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart2, responseCriteria_LexicalResourcePart2, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart3, responseCriteria_LexicalResourcePart3, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptRelatedImage, responseRelatedImage, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptRelatedImagePart2, responseRelatedImagePart2, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptRelatedImagePart3, responseRelatedImagePart3, ChatGPTProjectKeyEnum.HSK_530003),
              this.createCustomChatGPTUsage(promptAdvancedRewrittenParagraph_HSK5_530003, responseAdvancedRewrittenParagraph_HSK5_530003, ChatGPTProjectKeyEnum.HSK_530003),
            ]

            const listUseChatGPT = await this.chatGPTUsageRepository.create(chatGPTUsageAll)
            const listIdsChatGPT = listUseChatGPT.map(ele => ele.id)


            const responseCheckSpellingArr = [responseCriteria_LexicalResource.data, responseCriteria_LexicalResourcePart2.data, responseCriteria_LexicalResourcePart3.data]
            const totalSpellingError = parseInt(Boolean(responseCheckSpellingArr[0]?.errors) ? (!isNaN(responseCheckSpellingArr[0]?.errors) ? responseCheckSpellingArr[0]?.errors : 1): 0)
            const totalSpellingErrorPart2 = parseInt(Boolean(responseCheckSpellingArr[1]?.errors) ? (!isNaN(responseCheckSpellingArr[1]?.errors) ? responseCheckSpellingArr[1]?.errors : 1): 0)
            const totalSpellingErrorPart3 = parseInt(Boolean(responseCheckSpellingArr[2]?.errors) ? (!isNaN(responseCheckSpellingArr[2]?.errors) ? responseCheckSpellingArr[2]?.errors : 1): 0)
            let totalSpellingErrorsFinal = Math.round((totalSpellingError+totalSpellingErrorPart2+totalSpellingErrorPart3)/responseCheckSpellingArr.length)
            // const totalSpellingErrorArr = [totalSpellingError, totalSpellingErrorPart2, totalSpellingErrorPart3, totalSpellingErrorPart4, totalSpellingErrorPart5]
            // if(totalSpellingErrorArr.filter(ele => ele === 0).length >= 3 || (totalSpellingErrorArr.filter(ele => ele === 0).length >= 1 && totalSpellingErrorsFinal <= 1)) totalSpellingErrorsFinal = 0
            
            if(totalSpellingErrorsFinal > 0) {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalSpellingErrorsFinal) && ele?.analysis && ele?.analysis !== "")
              if(analysisSpell) {
                dataCriteriaHSK5_530003_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            } else {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalSpellingErrorsFinal) && ele?.analysis && ele?.analysis !== "")
              if(analysisSpell) {
                dataCriteriaHSK5_530003_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            }

            const responseCheckGrammaticalErrors = [responseCriteria_GrammaticalAccuracy.data, responseCriteria_GrammaticalAccuracyPart2.data, responseCriteria_GrammaticalAccuracyPart3.data]
            const totalGrammaticalErrors = parseInt(Boolean(responseCheckGrammaticalErrors[0]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[0]?.errors) ? responseCheckGrammaticalErrors[0]?.errors : 1): 0)
            const totalGrammaticalErrorsPart2 = parseInt(Boolean(responseCheckGrammaticalErrors[1]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[1]?.errors) ? responseCheckGrammaticalErrors[1]?.errors : 1): 0)
            const totalGrammaticalErrorsPart3 = parseInt(Boolean(responseCheckGrammaticalErrors[2]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[2]?.errors) ? responseCheckGrammaticalErrors[2]?.errors : 1): 0)
            let totalGrammaticalErrorsFinal = Math.round((totalGrammaticalErrors+totalGrammaticalErrorsPart2+totalGrammaticalErrorsPart3)/responseCheckGrammaticalErrors.length)
            // const totalGrammaticalErrorsArr = [totalGrammaticalErrors, totalGrammaticalErrorsPart2, totalGrammaticalErrorsPart3, totalGrammaticalErrorsPart4, totalGrammaticalErrorsPart5]
            // if(totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 3 || (totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 1 && totalGrammaticalErrorsFinal <= 1)) totalGrammaticalErrorsFinal = 0

            if(totalGrammaticalErrorsFinal > 0) {
              const analysisGrammatical= responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "")
              if(analysisGrammatical) {
                dataCriteriaHSK5_530003_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            } else {
              const analysisGrammatical = responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "")
              if(analysisGrammatical) {
                dataCriteriaHSK5_530003_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            }

            const responseCoherenceAndCohesion = [responseCriteria_CoherenceAndCohesion.data, responseCriteria_CoherenceAndCohesionPart2.data, responseCriteria_CoherenceAndCohesionPart3.data]
            const satisfyCriteria_CoherenceAndCohesion = ([
              (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1

            if(satisfyCriteria_CoherenceAndCohesion) {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK5_530003_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            } else {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK5_530003_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            }

            const dataAdvancedVocabularyResponse = responseAdvancedRewrittenParagraph_HSK5_530003.data.vocabularies.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(ele.vocabularyUse)
              const flag1 = checkChineseWords.length === new Set(checkChineseWords).size;
              const flag2 = /[a-zA-Z]/.test(ele)
              const flag3 = !(checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1])
              return flag1 && flag2 && flag3
            })
            const dataAdvancedSentenceFinalResponse = responseAdvancedRewrittenParagraph_HSK5_530003.data.sentences.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractQuotedSentences(ele.sentencesUse)
              if((checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1]) || checkChineseWords.length > 2) return false  
              return true
            })
            const dataAdvancedParagraphFinalResponse = responseAdvancedRewrittenParagraph_HSK5_530003.data.bestUpgradeAnswer
            const dataCriteriaHSK5_530003 =  dataCriteriaHSK5_530003_AnswerEvaluation.map(ele => {
              return {
                ...ele,
                analysis: ele.analysis.replace("undefined", "").trim().replace(/^\n+|\n+$/g, '')
              }
            })

            return {
              dataCriteria_CoherenceAndCohesion: satisfyCriteria_CoherenceAndCohesion,
              dataCriteria_GrammaticalAccuracy: totalGrammaticalErrorsFinal,
              dataCriteria_LexicalResource: totalSpellingErrorsFinal,
              dataCheckRelatedImage: satisfyRelatedImageFinal,
              dataAdvancedVocabularyResponse: dataAdvancedVocabularyResponse,
              dataAdvancedSentenceFinalResponse: dataAdvancedSentenceFinalResponse,
              dataAdvancedParagraphFinalResponse: dataAdvancedParagraphFinalResponse,
              dataCriteriaHSK5_530003: dataCriteriaHSK5_530003,
              listIdsChatGPT: listIdsChatGPT
            }; 
        } catch (error) {
          await this.fileService.addValueToFile(`${error.name}: ${error.message}\n${error.stack}`, LOG_FILE)
          throw new Error(`Failed to score HSK5_530003: ${error.message}`);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    async scoringHSK6_630001(input: ScoringHSK6_630001InputDto) {
      try {
        const dataCriteriaHSK6_630001_AnswerEvaluation: HSKAnswerEvaluationDto[] = [
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.GRAMMATICAL_RANGE_AND_ACCURACY),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.GRAMMATICAL_RANGE_AND_ACCURACY)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.LEXICAL_RESOURCE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.LEXICAL_RESOURCE)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.COHERENCE_AND_COHERENCE),
            "analysis": `${this.keyValueService.getValueFromKeyMessageConditionCustom(input.languageCode, KeyRoleForKeyMessageConditionEnum.COHERENCE_AND_COHERENCE)}`
          },
          {
            "criteria": this.keyValueService.getValueFromKeyCriteriaEnum(input.languageCode, KeyForKeyCriteriaEnum.CONTENT_AND_TASK_RESPONSE),
            "analysis": ""
          }
        ]
        const dataAvailable_HSK6 = await this.detailTasksService.readJsonFile(HSK6_630001)
        const findAIBestSuggestParagraph = dataAvailable_HSK6.find(ele => (ele.id).trim() === input.questionId.trim())
        let dataAdvancedParagraphFinalResponse = this.detailTasksService.getRandomElement(findAIBestSuggestParagraph.miaAnswer_3rd)
        const answerClearBreak = input.answer.replace(/\r/g, '\n').replace(/ /g, "")
        let newMIASuggestAnswer = `  ${input.answer.replace(/\r/g, '\n').replace(/ /g, "")}`.replace(/\n/g, "\n  ")
        const ANSWER_1ST = "我"
        const removeQuotedText =  input.answer.replace(/"[^"]*"/g, '').replace(/“[^“”]*”/g, '');
        if(removeQuotedText.includes(ANSWER_1ST) && findAIBestSuggestParagraph.miaAnswer_1st) dataAdvancedParagraphFinalResponse = this.detailTasksService.getRandomElement(findAIBestSuggestParagraph.miaAnswer_1st)
        const checkErrorMiaSampleAnswer_3rd = [...findAIBestSuggestParagraph.miaAnswer_3rd].find(ele => answerClearBreak == ele.replace(/\r/g, '\n').replace(/ /g, ""))
        const checkErrorMiaSampleAnswer_1st = [...findAIBestSuggestParagraph.miaAnswer_1st].find(ele => answerClearBreak == ele.replace(/\r/g, '\n').replace(/ /g, ""))
        try {
          if(!checkErrorMiaSampleAnswer_3rd && !checkErrorMiaSampleAnswer_1st) {
            const [
              promptCriteria_CoherenceAndCohesion,
              promptCriteria_CoherenceAndCohesionPart2,
              promptCriteria_CoherenceAndCohesionPart3,
              promptCriteria_GrammaticalAccuracy,
              promptCriteria_GrammaticalAccuracyPart2,
              promptCriteria_GrammaticalAccuracyPart3,
              promptCriteria_LexicalResource,
              promptCriteria_LexicalResourcePart2,
              promptCriteria_LexicalResourcePart3,
              promptAdvancedRewrittenParagraph_HSK6_630001,
            ] = await Promise.all([
              this.getPromptCriteria_CoherenceAndCohesion(input.answer, input.languageCode),
              this.getPromptCriteria_CoherenceAndCohesionPart2(input.answer, input.languageCode),
              this.getPromptCriteria_CoherenceAndCohesionPart3(input.answer, input.languageCode),
              this.getPromptCriteria_GrammaticalAccuracy_HSK56(answerClearBreak, input.languageCode),
              this.getPromptCriteria_GrammaticalAccuracyPart2_HSK56(answerClearBreak, input.languageCode),
              this.getPromptCriteria_GrammaticalAccuracyPart3_HSK56(answerClearBreak, input.languageCode),
              this.getPromptCriteria_LexicalResource_HSK56(answerClearBreak, input.languageCode),
              this.getPromptCriteria_LexicalResourcePart2_HSK56(answerClearBreak, input.languageCode),
              this.getPromptCriteria_LexicalResourcePart3_HSK56(answerClearBreak, input.languageCode),
              this.getPromptAdvancedRewrittenParagraph_HSK6_630001(answerClearBreak, findAIBestSuggestParagraph.mia_titile, dataAdvancedParagraphFinalResponse, input.languageCode),
            ])
            const [
              responseCriteria_CoherenceAndCohesion,
              responseCriteria_CoherenceAndCohesionPart2,
              responseCriteria_CoherenceAndCohesionPart3,
              responseCriteria_GrammaticalAccuracy,
              responseCriteria_GrammaticalAccuracyPart2,
              responseCriteria_GrammaticalAccuracyPart3,
              responseCriteria_LexicalResource,
              responseCriteria_LexicalResourcePart2,
              responseCriteria_LexicalResourcePart3,
              responseAdvancedRewrittenParagraph_HSK6_630001,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesion, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart2, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart3, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracy, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracyPart2, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsGrammar_HSK56(promptCriteria_GrammaticalAccuracyPart3, GRAMMATICAL_ACCURACY_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResource, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResourcePart2, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_ForCheckErrorsSpelling_HSK56(promptCriteria_LexicalResourcePart3, LEXICAL_RESOURCE_HSK56_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_HSK6_630001(promptAdvancedRewrittenParagraph_HSK6_630001, ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0),
            ]) 
    
            const chatGPTUsageAll = [
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesion, responseCriteria_CoherenceAndCohesion, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart2, responseCriteria_CoherenceAndCohesionPart2, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart3, responseCriteria_CoherenceAndCohesionPart3, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracy, responseCriteria_GrammaticalAccuracy, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart2, responseCriteria_GrammaticalAccuracyPart2, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_GrammaticalAccuracyPart3, responseCriteria_GrammaticalAccuracyPart3, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResource, responseCriteria_LexicalResource, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart2, responseCriteria_LexicalResourcePart2, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_LexicalResourcePart3, responseCriteria_LexicalResourcePart3, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptAdvancedRewrittenParagraph_HSK6_630001, responseAdvancedRewrittenParagraph_HSK6_630001, ChatGPTProjectKeyEnum.HSK_630001),
            ]
            const listUseChatGPT = await this.chatGPTUsageRepository.create(chatGPTUsageAll)
            const listIdsChatGPT = listUseChatGPT.map(ele => ele.id)
    
            const sentencesToken = input.answer.split(/[。！？]/);
            const checkPersonalOpinionArr = PERSONAL_OPINION.filter(ele => {
              for(let index = 0; index < sentencesToken.length; index++) {
                if(sentencesToken[index].startsWith(ele)) return true
              }
              return false
            })
    
            const responseCheckSpellingArr = [responseCriteria_LexicalResource.data, responseCriteria_LexicalResourcePart2.data, responseCriteria_LexicalResourcePart3.data]
            const totalSpellingError = parseInt(Boolean(responseCheckSpellingArr[0]?.errors) ? (!isNaN(responseCheckSpellingArr[0]?.errors) ? responseCheckSpellingArr[0]?.errors : 1): 0)
            const totalSpellingErrorPart2 = parseInt(Boolean(responseCheckSpellingArr[1]?.errors) ? (!isNaN(responseCheckSpellingArr[1]?.errors) ? responseCheckSpellingArr[1]?.errors : 1): 0)
            const totalSpellingErrorPart3 = parseInt(Boolean(responseCheckSpellingArr[2]?.errors) ? (!isNaN(responseCheckSpellingArr[2]?.errors) ? responseCheckSpellingArr[2]?.errors : 1): 0)
            let totalSpellingErrorsFinal = Math.round((totalSpellingError+totalSpellingErrorPart2+totalSpellingErrorPart3)/responseCheckSpellingArr.length)
            // const totalSpellingErrorArr = [totalSpellingError, totalSpellingErrorPart2, totalSpellingErrorPart3, totalSpellingErrorPart4, totalSpellingErrorPart5]
            // if(totalSpellingErrorArr.filter(ele => ele === 0).length >= 3 || (totalSpellingErrorArr.filter(ele => ele === 0).length >= 1 && totalSpellingErrorsFinal <= 1)) totalSpellingErrorsFinal = 0
    
            if(totalSpellingErrorsFinal > 0) {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalSpellingErrorsFinal) && ele?.analysis && ele?.analysis !== "0")
              if(analysisSpell) {
                dataCriteriaHSK6_630001_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            } else {
              const analysisSpell = responseCheckSpellingArr.find(ele => (parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalSpellingErrorsFinal) && ele?.analysis && ele?.analysis !== "0")
              if(analysisSpell) {
                dataCriteriaHSK6_630001_AnswerEvaluation[1].analysis = `${analysisSpell?.analysis}`
                totalSpellingErrorsFinal = analysisSpell.errors ? +analysisSpell.errors : 0
              }
            }
    
            const responseCheckGrammaticalErrors = [responseCriteria_GrammaticalAccuracy.data, responseCriteria_GrammaticalAccuracyPart2.data, responseCriteria_GrammaticalAccuracyPart3.data]
            const totalGrammaticalErrors = parseInt(Boolean(responseCheckGrammaticalErrors[0]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[0]?.errors) ? responseCheckGrammaticalErrors[0]?.errors : 1): 0)
            const totalGrammaticalErrorsPart2 = parseInt(Boolean(responseCheckGrammaticalErrors[1]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[1]?.errors) ? responseCheckGrammaticalErrors[1]?.errors : 1): 0)
            const totalGrammaticalErrorsPart3 = parseInt(Boolean(responseCheckGrammaticalErrors[2]?.errors) ? (!isNaN(responseCheckGrammaticalErrors[2]?.errors) ? responseCheckGrammaticalErrors[2]?.errors : 1): 0)
            let totalGrammaticalErrorsFinal = Math.round((totalGrammaticalErrors+totalGrammaticalErrorsPart2+totalGrammaticalErrorsPart3)/responseCheckGrammaticalErrors.length)
            // const totalGrammaticalErrorsArr = [totalGrammaticalErrors, totalGrammaticalErrorsPart2, totalGrammaticalErrorsPart3, totalGrammaticalErrorsPart4, totalGrammaticalErrorsPart5]
            // if(totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 3 || (totalGrammaticalErrorsArr.filter(ele => ele === 0).length >= 1 && totalGrammaticalErrorsFinal <= 1)) totalGrammaticalErrorsFinal = 0
            if(totalGrammaticalErrorsFinal > 0) {
              const analysisGrammatical= responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) >= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "0")
              if(analysisGrammatical) {
                dataCriteriaHSK6_630001_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            } else {
              const analysisGrammatical = responseCheckGrammaticalErrors.find(ele => parseInt(Boolean(ele?.errors) ? (!isNaN(ele?.errors) ? ele?.errors : 1): 0) <= totalGrammaticalErrorsFinal && ele?.analysis && ele?.analysis !== "0")
              if(analysisGrammatical) {
                dataCriteriaHSK6_630001_AnswerEvaluation[0].analysis = `${analysisGrammatical?.analysis}`
                totalGrammaticalErrorsFinal = analysisGrammatical.errors ? +analysisGrammatical.errors : 0
              }
            }
    
            const responseCoherenceAndCohesion = [responseCriteria_CoherenceAndCohesion.data, responseCriteria_CoherenceAndCohesionPart2.data, responseCriteria_CoherenceAndCohesionPart3.data]
            const satisfyCriteria_CoherenceAndCohesion = ([
              (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
    
            if(satisfyCriteria_CoherenceAndCohesion) {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK6_630001_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            } else {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK6_630001_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            }
    
            const dataAdvancedVocabularyResponse = responseAdvancedRewrittenParagraph_HSK6_630001.data.vocabularies.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(ele.vocabularyUse)
              const flag1 = checkChineseWords.length === new Set(checkChineseWords).size;
              const flag2 = /[a-zA-Z]/.test(ele)
              const flag3 = !(checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1])
              return flag1 && flag2 && flag3
            })
            const dataAdvancedSentenceFinalResponse = responseAdvancedRewrittenParagraph_HSK6_630001.data.sentences.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractQuotedSentences(ele.sentencesUse)
              if((checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1]) || checkChineseWords.length > 2) return false  
              return true
            })
            const dataCriteriaHSK6_630001 =  dataCriteriaHSK6_630001_AnswerEvaluation.map(ele => {
              return {
                ...ele,
                analysis: ele.analysis.replace("undefined", "").trim().replace(/^\n+|\n+$/g, '')
              }
            })
            return {
              dataCriteria_CoherenceAndCohesion: satisfyCriteria_CoherenceAndCohesion,
              dataCriteria_GrammaticalAccuracy: totalGrammaticalErrorsFinal,
              dataPersonalOpinion: checkPersonalOpinionArr,
              dataCriteria_LexicalResource: totalSpellingErrorsFinal,
              dataAdvancedVocabularyResponse: dataAdvancedVocabularyResponse,
              dataAdvancedSentenceFinalResponse: dataAdvancedSentenceFinalResponse,
              dataAdvancedParagraphFinalResponse: dataAdvancedParagraphFinalResponse,
              dataCriteriaHSK6_630001: dataCriteriaHSK6_630001,
              listIdsChatGPT: listIdsChatGPT
            }; 
          } else {
            const [
              promptCriteria_CoherenceAndCohesion,
              promptCriteria_CoherenceAndCohesionPart2,
              promptCriteria_CoherenceAndCohesionPart3,
              promptAdvancedRewrittenParagraph_HSK6_630001,
            ] = await Promise.all([
              this.getPromptCriteria_CoherenceAndCohesion(input.answer, input.languageCode),
              this.getPromptCriteria_CoherenceAndCohesionPart2(input.answer, input.languageCode),
              this.getPromptCriteria_CoherenceAndCohesionPart3(input.answer, input.languageCode),
              this.getPromptAdvancedRewrittenParagraph_HSK6_630001(answerClearBreak, findAIBestSuggestParagraph.mia_titile, dataAdvancedParagraphFinalResponse, input.languageCode),
            ])
            const [
              responseCriteria_CoherenceAndCohesion,
              responseCriteria_CoherenceAndCohesionPart2,
              responseCriteria_CoherenceAndCohesionPart3,
              responseAdvancedRewrittenParagraph_HSK6_630001,
            ] = await Promise.all([
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesion, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart2, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT(promptCriteria_CoherenceAndCohesionPart3, COHERENCE_AND_COHESION_SCHEMA, input.languageCode),
              this.openAIService.getDataFromChatGPT_HSK6_630001(promptAdvancedRewrittenParagraph_HSK6_630001, ADVANCED_REWRITTEN_PARAGRAPH_HSK6_630001_SCHEMA, input.languageCode, ChatGPTModelEnum.GPT_4O_MINI, ChatGPTTemperatureEnum.T0),
            ]) 
    
            const chatGPTUsageAll = [
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesion, responseCriteria_CoherenceAndCohesion, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart2, responseCriteria_CoherenceAndCohesionPart2, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptCriteria_CoherenceAndCohesionPart3, responseCriteria_CoherenceAndCohesionPart3, ChatGPTProjectKeyEnum.HSK_630001),
              this.createCustomChatGPTUsage(promptAdvancedRewrittenParagraph_HSK6_630001, responseAdvancedRewrittenParagraph_HSK6_630001, ChatGPTProjectKeyEnum.HSK_630001),
            ]
            const listUseChatGPT = await this.chatGPTUsageRepository.create(chatGPTUsageAll)
            const listIdsChatGPT = listUseChatGPT.map(ele => ele.id)
    
            const sentencesToken = input.answer.split(/[。！？]/);
            const checkPersonalOpinionArr = PERSONAL_OPINION.filter(ele => {
              for(let index = 0; index < sentencesToken.length; index++) {
                if(sentencesToken[index].startsWith(ele)) return true
              }
              return false
            })
    
            const totalSpellingErrorsFinal = 0
            const totalGrammaticalErrorsFinal = 0
    
            const responseCoherenceAndCohesion = [responseCriteria_CoherenceAndCohesion.data, responseCriteria_CoherenceAndCohesionPart2.data, responseCriteria_CoherenceAndCohesionPart3.data]
            const satisfyCriteria_CoherenceAndCohesion = ([
              (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[0]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES)) ? true : false,
              (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[1]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false,
              (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || (responseCoherenceAndCohesion[2]?.satisfy.toString())?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))? true : false
            ].filter(ele => ele)).length >= 1
    
            if(satisfyCriteria_CoherenceAndCohesion) {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.YES))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK6_630001_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            } else {
              const analysisCoherenceAndCohesion = responseCoherenceAndCohesion.find(ele => (ele?.satisfy.toString()?.toUpperCase()  == this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO) || ele?.satisfy.toString()?.toUpperCase().includes(this.keyValueService.getValueFromKeyEnum(input.languageCode, KeyForKeyEnum.NO))) && ele?.analysis && ele?.analysis !== "")
              const dataAnalysisCoherenceAndCohesion = `${analysisCoherenceAndCohesion?.analysis}`
              if(dataAnalysisCoherenceAndCohesion !== "undefined")
                dataCriteriaHSK6_630001_AnswerEvaluation[2].analysis = `${dataAnalysisCoherenceAndCohesion}`
            }
    
            const dataAdvancedVocabularyResponse = responseAdvancedRewrittenParagraph_HSK6_630001.data.vocabularies.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractChineseCharacters(ele.vocabularyUse)
              const flag1 = checkChineseWords.length === new Set(checkChineseWords).size;
              const flag2 = /[a-zA-Z]/.test(ele)
              const flag3 = !(checkChineseWords.length == 2 && checkChineseWords[0] == checkChineseWords[1])
              return flag1 && flag2 && flag3
            })
            const dataAdvancedSentenceFinalResponse = responseAdvancedRewrittenParagraph_HSK6_630001.data.sentences.filter(ele => {
              const checkChineseWords = this.detailTasksService.extractQuotedSentences(ele.sentencesUse)
              if((checkChineseWords.length == 2 && (checkChineseWords[0] == checkChineseWords[1] || !newMIASuggestAnswer.includes(checkChineseWords[0]))) || checkChineseWords.length > 2) return false
              if(newMIASuggestAnswer.includes(checkChineseWords[0])) {
                newMIASuggestAnswer = newMIASuggestAnswer.replace(checkChineseWords[0], checkChineseWords[1])
              }
              return true
            })
            for (let index = 0; index < dataAvailable_HSK6.length; index++) {
              if(dataAvailable_HSK6[index].id == input.questionId) {
                if(checkErrorMiaSampleAnswer_3rd) {
                  dataAvailable_HSK6[index].miaAnswer_3rd.push(newMIASuggestAnswer)
                }
                else {
                  dataAvailable_HSK6[index].miaAnswer_1st.push(newMIASuggestAnswer)
                }
              }
            }
            await this.detailTasksService.writeJsonFile(fileHSK6_630001Path, dataAvailable_HSK6)
            const dataCriteriaHSK6_630001 =  dataCriteriaHSK6_630001_AnswerEvaluation.map(ele => {
              return {
                ...ele,
                analysis: ele.analysis.replace("undefined", "").trim().replace(/^\n+|\n+$/g, '')
              }
            })
            return {
              dataCriteria_CoherenceAndCohesion: satisfyCriteria_CoherenceAndCohesion,
              dataCriteria_GrammaticalAccuracy: totalGrammaticalErrorsFinal,
              dataPersonalOpinion: checkPersonalOpinionArr,
              dataCriteria_LexicalResource: totalSpellingErrorsFinal,
              dataAdvancedVocabularyResponse: dataAdvancedVocabularyResponse,
              dataAdvancedSentenceFinalResponse: dataAdvancedSentenceFinalResponse,
              dataAdvancedParagraphFinalResponse: newMIASuggestAnswer,
              dataCriteriaHSK6_630001: dataCriteriaHSK6_630001,
              listIdsChatGPT: listIdsChatGPT
            }; 
          }
        } catch (error) {
          await this.fileService.addValueToFile(`${error.name}: ${error.message}\n${error.stack}`, LOG_FILE)
          throw new Error(`Failed to score HSK6_630001: ${error.message}`);
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }
}