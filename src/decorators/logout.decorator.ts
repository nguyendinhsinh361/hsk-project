import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Logout = createParamDecorator(
  (data: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    request.headers['authorization'] = '';
    return request.userId;
  },
);
