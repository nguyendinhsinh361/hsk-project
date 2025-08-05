import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'questions_comments_report',database: "admin_hsk" })
export class QuestionCommentReportEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'question_id', type: 'int', default: null })
  questionId: number;

  @Column({ name: 'comment_id', type: 'int', default: null  })
  commentId: number;

  @Column({ name: 'content', type: 'longtext',default: null  })
  content: number;

  @Column({ name: 'active', type: 'int', default: 1})
  active: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}