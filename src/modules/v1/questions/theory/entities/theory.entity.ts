import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TheoryKindEnum } from '../enum/theory.enum';

@Entity({ name: 'theory_error', database: "admin_hsk" })
export class TheoryErrorEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ name: 'platform', type: 'varchar' })
  platform: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'note', type: 'varchar', default: "" })
  note: string;

  @Column({ name: 'status', type: "int", default: 1 })
  status: number;

  @Column({ name: 'kind', type: "int", default: TheoryKindEnum.WORD })
  kind: number; 

  @Column({ name: 'language', type: "varchar", default: "vi" })
  language: string; 

  @Column({ name: 'app_version', type: "varchar", default: "" })
  appVersion: number; 

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}