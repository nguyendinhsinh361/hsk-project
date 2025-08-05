import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetSupperKey = createParamDecorator(
  (data: undefined, context: ExecutionContext): any => {
    const request = context.switchToHttp().getRequest();
    return request.key_use;
  },
);

export const GetSuperKeyName = createParamDecorator(
    (data: undefined, context: ExecutionContext): any => {
      const request = context.switchToHttp().getRequest();
      return request.name;
    },
  );