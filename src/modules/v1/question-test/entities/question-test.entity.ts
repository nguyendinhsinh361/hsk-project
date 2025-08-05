import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'questions_test', database: "admin_hsk" })
export class QuestionTestEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'title', type: 'text' })
  title: string;

  @Column({ name: 'title_lang', type: 'text', default: null })
  title_lang: string;

  @Column({ name: 'parts', type: 'longtext', default: null })
  parts: string;

  @Column({ name: 'level', type: 'int', default: null  })
  level: number;

  @Column({ name: 'groups', type: 'text',default: null  })
  groups: string;

  @Column({ name: 'score', type: 'int', default: null})
  score: number;

  @Column({ name: 'pass_score', type: 'int', default: null})
  pass_score: number;

  @Column({ name: 'active', type: 'int', default: null})
  active: number;

  @Column({ name: 'time', type: 'int', default: null})
  time: number;

  @Column({ name: 'sequence', type: 'int', default: null})
  sequence: number;

  @Column({ name: 'type', type: 'int', default: 1})
  type: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}