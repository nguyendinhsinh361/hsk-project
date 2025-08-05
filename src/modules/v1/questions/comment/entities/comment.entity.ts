import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'questions_comments', database: "admin_hsk" })
export class QuestionCommentEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'content', type: 'longtext' })
  content: string;

  @Column({ name: 'status', type: "tinyint", default: 0   })
  status: number;

  @Column({ name: 'like', type: 'int', default: 0  })
  like: number;

  @Column({ name: 'parent_id', type: 'int',default: null  })
  parentId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;


  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'language', type: 'varchar',default: null })
  language: string;

}