import { ConfigService } from '@nestjs/config';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'certificates', database: "admin_hsk"})
export class CertificateEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'username', type: 'text' })
  username: string;

  @Column({ name: 'email', type: 'text' })
  email: string;

  @Column({ name: 'phone_number', type: 'text' })
  phoneNumber: string;

  @Column({ name: 'certificate_img', type: 'text' })
  certificateImg: string;

  @Column({ name: 'note', type: 'text' })
  note: string;

  @Column({ name: 'share', type: 'int' })
  share: number;
  

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
