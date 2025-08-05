import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
@Entity({ name: 'ranking', database: "admin_hsk"})
export class RankingEntity {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  user_id: number;

  @Column({ name: 'total_scores', type: 'int' })
  total_scores: number;
  
  @Column({ name: 'total_missions', type: 'int' })
  total_missions: number;

  @Column({ name: 'email', type: 'varchar' })
  email: number;

  @Column({ name: 'name', type: 'varchar' })
  name: number;

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
