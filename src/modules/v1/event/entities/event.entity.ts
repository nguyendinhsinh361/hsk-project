import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'event',database: "admin_hsk"})
export class EventEntity {
  @PrimaryGeneratedColumn("increment")
  event_id: number;

  @Column({ type: 'int', nullable: true })
  level: number;

  @Column({ length: 225 })
  kind: string;

  @Column({ type: 'int', default: 1 })
  active: number;

  @Column({type: 'bigint'})
  start: number;

  @Column({type: 'bigint'})
  end: number;

  @Column({type: 'text'})
  description: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  count_question: number;

  @Column({ type: 'int', nullable: true })
  time: number;

  @Column({ type: 'int', default: 0 })
  follower_count: number;
}
