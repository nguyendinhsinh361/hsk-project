import * as jwt from 'jsonwebtoken';

export class JwtService {
  private readonly atsecretKey: string = process.env.ACCESS_TOKEN_SECRET;
  private readonly rtsecretKey: string = process.env.REFRESH_TOKEN_SECRET;

  public createAt(payload: any): string {
    return jwt.sign(payload, this.atsecretKey);
  }

  public verifyAt(token: string): any {
    try {
      const decoded = jwt.verify(token, this.atsecretKey);
      return decoded;
    } catch (error) {
      return false;
    }
  }

  public createRt(payload: any): string {
    return jwt.sign(payload, this.rtsecretKey);
  }

  public verifyRt(token: string): any {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      return false;
    }
  }
}
