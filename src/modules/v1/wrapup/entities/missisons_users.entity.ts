import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'missions_users', database: "admin_hsk"})
export class MissionsUsersEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'varchar' })
  user_id: string;

  @Column({ name: 'mission_id', type: 'int' })
  mission_id: number;

  @Column({ name: 'mission_name', type: 'varchar' })
  mission_name: string;

  @Column({ name: 'mission_display', type: 'varchar' })
  mission_display: string;

  @Column({ name: 'mission_code', type: 'varchar' })
  mission_code: string;

  @Column({ name: 'mission_kind', type: 'varchar' })
  mission_kind: string;

  @Column({ name: 'mission_type', type: 'varchar' })
  mission_type: string;

  @Column({ name: 'mission_level', type: 'int' })
  mission_level: number;

  @Column({ name: 'mission_count', type: 'int' })
  mission_count: number;

  @Column({ name: 'mission_progress', type: 'int' })
  mission_progress: number;

  @Column({ name: 'mission_point', type: 'bigint' })
  mission_point: number;

  @Column({ name: 'time_start', type: 'bigint' })
  time_start: number;

  @Column({ name: 'time_end', type: 'int' })
  time_end: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
