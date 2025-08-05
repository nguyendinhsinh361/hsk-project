import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { TheoryLessonEntity } from '../entities/theory-lesson.entity';
export type TheoryLessonRepositoryInterface =
  BaseInterfaceRepository<TheoryLessonEntity>;
