import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({name: 'routes_user', database: "admin_hsk"})
export class RoutesUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: "id_user", nullable: true })
  id_user: number;

  @Column({ type: 'text', nullable: true })
  level: number;

  @Column({ type: 'longtext', nullable: true })
  route: string;

  @Column({ type: 'longtext', nullable: true })
  backup: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

}