import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18NEnum, KeyForKeyEnum, KeyUserVIEnum, KeyUsereENEnum } from '../v1/scoring/enums/key.enum';
import { KeyRoleForKeyMessageConditionEnum, KeyRoleForKeyRoleEnum, MessageConditionCustomEN, MessageConditionCustomVI, PromptRoleInputENENum, PromptRoleInputVIENum } from '../i18n/i18n.enum';
import { CriteriaENEnum, CriteriaVIEnum, KeyForKeyCriteriaEnum } from '../v1/scoring/enums/kind.enum';


@Injectable()
export class KeyValueService {
  constructor() {}

  getValueFromKeyEnum(languageCode: I18NEnum, keyword: KeyForKeyEnum) {
    switch (languageCode) {
        case I18NEnum.EN:
          return KeyUsereENEnum[keyword].toString();
        case I18NEnum.VI:
          return KeyUserVIEnum[keyword].toString();
        default:
          return null;
    }
  }

  getValueFromKeyInputRoleChatGPTEnum(languageCode: I18NEnum, keyword: KeyRoleForKeyRoleEnum) {
    switch (languageCode) {
        case I18NEnum.EN:
          return PromptRoleInputENENum[keyword].toString();
        case I18NEnum.VI:
          return PromptRoleInputVIENum[keyword].toString();
        default:
          return null;
    }
  }

  getValueFromKeyCriteriaEnum(languageCode: I18NEnum, keyword: KeyForKeyCriteriaEnum) {
    switch (languageCode) {
        case I18NEnum.EN:
          return CriteriaENEnum[keyword].toString();
        case I18NEnum.VI:
          return CriteriaVIEnum[keyword].toString();
        default:
          return null;
    }
  }

  getInputPromptCustomForHSK5_530002(languageCode: I18NEnum, requiredWords) {
    switch (languageCode) {
      case I18NEnum.EN:
        return `Your role as an adept HSK examiner entails the meticulous reading, evaluation, and thorough analysis of the respondent's responses to question 99 in the HSK5 examination. Subsequently, you are to assume the dual roles of proofreader and writer, aligning with the user's answer and requested terms.`
      case I18NEnum.VI:
        return `Vai trò của bạn với tư cách là một giám khảo HSK giàu kinh nghiệm, hãy đọc, phân tích và đánh giá kỹ lưỡng các câu trả lời cho câu hỏi 99 trong kỳ thi HSK5. Sau đó, bạn phải đảm nhận hai vai trò là người hiệu đính và người viết, tiến hành sửa đổi phù hợp nhằm cải thiện chất lượng câu trả lời của người dùng dựa trên những điều khoản được yêu cầu.`;
      default:
        return null;
    }
  }

  getInputPromptCustomForOverallEvaluation(languageCode: I18NEnum) {
    switch (languageCode) {
      case I18NEnum.EN:
        return `Your assignment has 4 spelling errors, 2 grammatical errors, presentation errors such as not spacing the first 2 lines, and the content is not coherent or logical. You should review more vocabulary and grammar in HSK, thereby improving your vocabulary and making your work more complete.`
      case I18NEnum.VI:
        return `Bài của bạn mắc 4 lỗi chính tả, 2 lỗi ngữ pháp, lỗi trình bày như không giãn cách 2 dòng đầu, nội dung chưa mạch lạc, logic. Các bạn nên ôn tập thêm từ vựng và ngữ pháp trong HSK, từ đó nâng cao vốn từ vựng và làm bài làm của mình hoàn thiện hơn.`;
      default:
        return null;
    }
  }

  getValueFromKeyMessageConditionCustom(languageCode: I18NEnum, keyword: KeyRoleForKeyMessageConditionEnum) {
    switch (languageCode) {
        case I18NEnum.EN:
          return MessageConditionCustomEN[keyword].toString();
        case I18NEnum.VI:
          return MessageConditionCustomVI[keyword].toString();
        default:
          return null;
    }
  }
}