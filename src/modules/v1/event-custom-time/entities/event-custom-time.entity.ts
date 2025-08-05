import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'event_custom_time',database: "admin_hsk"})
export class EventCustomTimeEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'event_id', type: 'int'})
  eventId: number;

  @Column({ name: 'event_name', type: 'text'})
  eventName: number;

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
