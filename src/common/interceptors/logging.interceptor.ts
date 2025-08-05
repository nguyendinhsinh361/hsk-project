import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Chỉ log khi URL match với pattern
    if (url.includes('question/get-question-practice') && url.includes('state=dev')) {
      console.log('Request Headers:', request.headers);
    }
    
    return next.handle();
  }
}