import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity({ name: 'ebooks', database: "admin_hsk"})
export class EbookEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: 'flag', type: 'varchar' })
  flag: string;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'cover_img_url', type: 'varchar', default: null })
  cover_img_url: string;

  @Column({ name: 'pdf_url', type: 'varchar', default: null })
  pdf_url: string;

  @Column({ name: 'audio_url', type: 'varchar', default: null })
  audio_url: string;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @Column({ name: 'type_lang', type: 'varchar' })
  type_lang: string;

  @Column({ name: 'author', type: 'varchar' })
  author: string;

  @Column({ name: 'is_free', type: 'tinyint' })
  is_free: number;

  @Column({ name: 'priority', type: 'int' })
  priority: number;

  @Column({ name: 'language', type: 'varchar' })
  language: string;

  @Column({ name: 'level', type: 'varchar' })
	level: string;

	@Column({ name: 'skill', type: 'varchar' })
	skill: string;

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
