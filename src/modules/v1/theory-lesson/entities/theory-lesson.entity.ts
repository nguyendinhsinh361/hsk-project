import { ConfigService } from '@nestjs/config';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'theory_lesson', database: "admin_hsk"})
export class TheoryLessonEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @Column({ name: 'lesson_id', type: 'int' })
  lesson_id: number;

  @Column({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'completed_status', type: 'int', default: 0 })
  completed_status: number;

  @Column({ name: 'kind', type: 'varchar' })
  kind: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
