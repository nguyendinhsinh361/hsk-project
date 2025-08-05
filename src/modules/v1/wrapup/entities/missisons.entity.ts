import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'missions', database: "admin_hsk"})
export class MissionsEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'sequence_number', type: 'int' })
  sequence_number: number;

  @Column({ name: 'feature', type: 'text' })
  feature: string;

  @Column({ name: 'mission', type: 'varchar', default: null })
  mission: string;

  @Column({ name: 'mission_code', type: 'varchar', default: null })
  mission_code: string;

  @Column({ name: 'description', type: 'varchar', default: null })
  description: string;

  @Column({ name: 'mission_display', type: 'varchar' })
  mission_display: string;

  @Column({ name: 'mission_point', type: 'varchar' })
  mission_point: string;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @Column({ name: 'mission_number', type: 'varchar' })
  mission_number: string;

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
