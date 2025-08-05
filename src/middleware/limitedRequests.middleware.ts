import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LimitedRequestsMiddleware implements NestMiddleware {
  private requests: { timestamp: number }[] = [];

  use(req: Request, res: Response, next: NextFunction) {
    const maxRequests = 100;
    const intervalInSeconds = 60;

    this.requests = this.requests.filter(
      (request) => Date.now() - request.timestamp <= intervalInSeconds * 1000,
    );
    if (this.requests.length >= maxRequests) {
      throw new HttpException(
        `Too many requests, please try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.requests.push({ timestamp: Date.now() });
    next();
  }
}
