import { Column, Entity, PrimaryGeneratedColumn, PrimaryColumn, CreateDateColumn} from 'typeorm';

@Entity({ name: 'AccessToken', database: "admin_hsk"})
export class AccessToken {
    
    @PrimaryColumn({ name: 'id'})
    id: string;

    @Column({ name: 'userId' })
    user_id: number;

    @Column({ name: 'ttl' })
    ttl: number;

    @CreateDateColumn({ name: 'created', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    created: Date;
}


// import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// @Entity({ name: 'AccessToken' })
// export class AccessTokenEntity {
//   @PrimaryColumn('uuid') // Assuming you are using UUIDs for the 'id' column
//   id: string;

//   @Column({ name: 'ttl', type: 'bigint', nullable: true })
//   ttl: number;

//   @Column({ name: 'scopes', type: 'text', nullable: true })
//   scopes: string;

//   @CreateDateColumn({ name: 'created', type: 'datetime' })
//   created: Date;

//   @Column({ name: 'userId', type: 'int', nullable: true })
//   userId: number;

// }