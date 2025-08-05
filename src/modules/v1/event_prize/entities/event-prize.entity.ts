import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'event_prize',database: "admin_hsk"})
export class EventPrizeEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'int', default: 1 })
  event_id: number;

  @Column({ type: 'int', default: 1 })
  active: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'int', nullable: true })
  level: number;

}
