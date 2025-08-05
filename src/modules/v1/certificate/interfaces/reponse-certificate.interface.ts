export interface IResponseCreateCertificate {
  username: string;
  email: string;
  phoneNumber?: string;
  certificateImg: string;
  note: string;
}

export interface IResponseUpdateCertificate {
  active: number;
}

export interface IResponseCertificate {
  message: string;
  data: IResponseCreateCertificate | IResponseUpdateCertificate | any;
}
