export interface IQuestionContent {
    Q_text: string;
    Q_audio: string;
    Q_image: string;
    A_text: string[];
    A_audio: string[];
    A_image: string[];
    A_correct: any[]; 
    explain: {
      vi: string;
      en: string;
    };
}

export interface IQuestionGeneral {
    G_text: string[];
    G_text_translate: {
      vi: string;
      en: string;
    };
    G_text_audio: string;
    G_text_audio_translate: {
      vi: string;
      en: string;
    };
    G_audio: string[]; 
    G_image: string[]; 
  }

export interface IQuestion {
    title: string;
    general: string;
    content: string;
    level: number;
    levelOfDifficult: number;
    kind: string;
    correctAnswers: number;
    checkAdmin: number;
    countQuestion: number;
    tag: string;
    score: number;
    checkExplain: number;
    titleTrans: string;
    source: string;
    scoreDifficult: number;
}