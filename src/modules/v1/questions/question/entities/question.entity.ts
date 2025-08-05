import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'questions', database: "admin_hsk" })
export class QuestionEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'title', type: 'text' })
  title: string;

  @Column({ name: 'general', type: 'longtext', default: null })
  general: string;

  @Column({ name: 'content', type: 'longtext', default: null  })
  content: string;

  @Column({ name: 'level', type: 'int',default: null  })
  level: number;

  @Column({ name: 'level_of_difficult', type: 'double', default: null})
  levelOfDifficult: number;

  @Column({ name: 'kind', type: 'varchar', default: null})
  kind: string;

  @Column({ name: 'correct_answers', type: 'text', default: null})
  correctAnswers: string;

  @Column({ name: 'check_admin', type: 'int', default: null})
  checkAdmin: number;

  @Column({ name: 'count_question', type: 'int', default: null})
  countQuestion: number;

  @Column({ name: 'tag', type: 'text', default: null})
  tag: string;

  @Column({ name: 'score', type: 'int', default: null})
  score: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'check_explain', type: 'int', default: 0})
  checkExplain: number;

  @Column({ name: 'title_trans', type: 'text', default: null})
  titleTrans: string;

  @Column({ name: 'source', type: 'text', default: null})
  source: string;

  @Column({ name: 'score_difficult', type: 'double', default: 0})
  scoreDifficult: number;

  @Column({ name: 'total_like', type: 'int', default: 0})
  totalLike: number;

  @Column({ name: 'total_comment', type: 'int', default: 0})
  totalComment: number;
}