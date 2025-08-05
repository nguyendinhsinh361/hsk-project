import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users_tracking' })
export class UserTracking {
  @PrimaryGeneratedColumn()
  id
  @Column({ type: 'int', nullable: false })
  user_id: number

  @Column({ type: 'varchar', length: 155, nullable: false })
  tag: string;

  @Column({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: Date;
}