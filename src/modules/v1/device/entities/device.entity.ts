
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'users_device_manager' })
export class UsersDeviceManagerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'device', type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  device: string;

  @Column({ name: 'device_id', type: 'text' })
  deviceId: string;

  @Column({ name: 'platforms', type: 'text' })
  platforms: string;

  @Column({ name: 'platforms_version', type: 'text' })
  platformsVersion: string;

  @Column({ name: 'app_version', type: 'text' })
  appVersion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'active', type: 'int' })
  active: number;
}