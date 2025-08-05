import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'users_synchronized_practice', database: "admin_hsk"})
export class UserSynchronizedPracticeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: "user_id", nullable: true })
  userId: number;

  @Column({ type: 'int', nullable: true })
  level: number;

  @Column({ name: 'sync_type', type: 'text', nullable: true })
  syncType: string;

  @Column({ type: 'text'})
  result: string;

  @Column({ type: 'text'})
  content: string;

  @Column({ name: 'key_id', type: 'int', nullable: true })
  keyId: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

}