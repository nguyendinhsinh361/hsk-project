export interface IFormatResponseOldHistory {
    Err: null | string;
    User: {
      content: {
        [key: string]: string;
      };
      result: {
        correct: number;
        currentDayRoute: number;
        id: string;
        idKind: string;
        numberQuesComplete: number;
        numberQuesRoute: number;
        numberQuesRouteDid: number;
        number_ques: number;
        time: number;
        total: number;
        totalScore: string;
        totalTime: string;
        typeHistory: number;
      };
      sync_type: string;
    };
  }