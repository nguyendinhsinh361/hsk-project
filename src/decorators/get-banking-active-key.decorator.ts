import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetBankingActiveKey = createParamDecorator(
  (data: undefined, context: ExecutionContext): any => {
    const request = context.switchToHttp().getRequest();
    return request.banking_key_active;
  },
);