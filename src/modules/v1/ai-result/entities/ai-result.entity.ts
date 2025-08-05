import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'ai_results', database: "admin_hsk"})
export class AIResultEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'history_id', type: 'int' })
  historyId: number;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ type: 'text', nullable: false })
  result: string; 

  @Column({ name: 'user_answer', type: 'text'})
  userAnswer: string; 

  @Column({ name: 'ai_type', type: 'int', default: 1 })
  aiType: number;
  
  @Column({ name: 'ids_chatgpt', type: 'text'})
  idsChatGPT: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
