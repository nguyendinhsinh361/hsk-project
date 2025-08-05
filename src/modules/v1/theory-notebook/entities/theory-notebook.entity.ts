import { ConfigService } from '@nestjs/config';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'theory_notebook', database: "admin_hsk"})
export class TheoryNotebookEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  user_id: number;

  @Column({ name: 'theory_id', type: 'int' })
  theory_id: number;

  @Column({ name: 'level', type: 'int' })
  level: number;

  @Column({ name: 'understand_level', type: 'int', default: "0" })
  understand_level: number;

  @Column({ name: 'tick', type: 'int' })
  tick: number;

  @Column({ name: 'click', type: 'int' })
  click: number;

  @Column({ name: 'take_note', type: 'text' })
  take_note: string;

  @Column({ name: 'kind', type: 'varchar' })
  kind: string;

  @Column({ name: 'hanzii', type: 'varchar' })
  hanzii: string;

  @Column({ name: 'word', type: 'varchar' })
  word: string;

  @Column({ name: 'grammar', type: 'varchar' })
  grammar: string;

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
