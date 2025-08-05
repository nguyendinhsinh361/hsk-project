import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.reponsitory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware, UserIdNotAuthMiddleware } from '../../../middleware/auth.middleware';
import { AuthModule } from '../../../modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity]), AuthModule],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService, EventRepository]
})
export class EventModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdNotAuthMiddleware)
      .forRoutes(
        { path: 'event/event-list', method: RequestMethod.GET},
        { path: 'event/event-detail', method: RequestMethod.GET},
      );

    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'event/event-history', method: RequestMethod.GET},
        { path: 'event/ranking', method: RequestMethod.GET},
        { path: 'event/complete-exam', method: RequestMethod.POST},
        
      );
    } 
}