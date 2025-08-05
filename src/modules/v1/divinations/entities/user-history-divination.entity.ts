import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InfoUserDivination } from './user-info-divination.entity';

@Entity('user_history_divination')
export class UserHistoryDivination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'info_user_divination_id', nullable: false })
  infoUserDivinationId: number;

  @Column({ name: 'divination_id', nullable: false })
  divinationId: number;

  @Column({ name: 'content_id', nullable: false })
  contentId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => InfoUserDivination)
  @JoinColumn({
    name: 'info_user_divination_id',
    referencedColumnName: 'id',
  })
  infoUserDivination: InfoUserDivination;
}
