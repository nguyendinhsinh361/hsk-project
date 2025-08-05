import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'questions_comments_vote', database: "admin_hsk" })
export class QuestionCommentVoteEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'question_id', type: 'int', default: null })
  questionId: number;

  @Column({ name: 'comment_id', type: 'int', default: null  })
  commentId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'upvote_question', type: 'int', default: 1  })
  upvoteQuestion : number;

  @Column({ name: 'upvote_comment', type: 'int', default: 1  })
  upvoteComment : number;
}