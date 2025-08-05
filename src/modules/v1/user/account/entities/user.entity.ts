import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'users', database: "admin_hsk" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  password?: string;

  @Column({ type: 'timestamp', default: () => new Date() })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at?: Date;

  @Column({ type: 'text' })
  avatar: string;

  @Column({ type: 'int' })
  sex: number;

  @Column({ type: 'int', nullable: true })
  day_of_birth?: number;

  @Column({ type: 'int', nullable: true })
  month_of_birth?: number;

  @Column({ type: 'int', nullable: true })
  year_of_birth?: number;

  @Column({ type: 'tinyint', default: 0 })
  activate_flag: number;


  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language?: string;

  @Column({ type: 'text' })
  phone: string;

  @Column({ type: 'text', nullable: true })
  device?: string;

  @Column({ type: 'text', nullable: true })
  app_version?: string;

  @Column({ type: 'text', nullable: true })
  platforms_version?: string;

  @Column({ type: 'text', nullable: true })
  platforms?: string;
}