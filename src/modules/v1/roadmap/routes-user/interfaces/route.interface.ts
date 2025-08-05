export interface IQuestionInfo {
  id: number;
  true: number;
  false: number;
}

export interface IProcessResult {
  time_end_process?: number;
  questions: IQuestionInfo[];
  time_start_process: number;
  sum_score?: number;
  time_end?: number;
}

export interface IProcess {
  kind: string;
  type: string;
  practice_per_day: number;
  limit: number | null;
  time: number | null;
  status: boolean;
  id_process: number;
  result?: IProcessResult;
}

export interface IDayDetail {
  day: number;
  id_day: number;
  status: boolean;
  process: IProcess[];
}

export interface IRoute {
  type: string;
  kind: string;
  max_score: number;
  min_score: number;
  difficult: number;
  count_day: number;
  practice_per_day: number;
  id_route: number;
  status: boolean;
  detail: IDayDetail[];
}

export interface ITestRoute {
  type: string;
  count_day: number;
  id_route: number;
  status: boolean;
  detail: IDayDetail[];
}

export interface IRouteObject {
  max_score: number;
  min_score: number;
  days: number;
  route: (IRoute | ITestRoute)[];
}
