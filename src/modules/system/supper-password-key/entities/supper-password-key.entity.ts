import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'supper_key', database: "admin_hsk"})
export class SupperPasswordKeyEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'super_pass', type: 'varchar', length: 255, nullable: false })
  superPass: string;

  @Column({ name: 'key_use', type: 'varchar', length: 255, nullable: false })
  keyUse: string;

  @Column({ name: 'key_name', type: 'varchar', length: 255, nullable: false })
  keyName: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
