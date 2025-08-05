import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'certificates_time',database: "admin_hsk"})
export class CertificateTimeEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'start_time', type: 'bigint'})
  startTime: number;

  @Column({ name: 'end_time', type: 'bigint' })
  endTime: number;

  @Column({ name: 'active', type: 'int', default: 0 })
  active: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
