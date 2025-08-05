import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'usages_chatgpt', database: "admin_hsk"})
export class UsageEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'text', nullable: false })
  input: string 

  @Column({ type: 'text', nullable: false })
  output: string; 

  @Column({ type: 'varchar', length: 255, nullable: false })
  model: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  project_key: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  type: string;

  @Column({ type: 'int', nullable: false })
  prompt_tokens: number;

  @Column({ type: 'int', nullable: false })
  completion_tokens: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
