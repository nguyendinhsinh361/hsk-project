import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'purchase',database: "admin_hsk" })
export class PurchaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'product_id', type: 'text' })
  productId: string;

  @Column({ name: 'platforms' })
  platforms: string;

  @Column({ name: 'purchase_date' })
  purchaseDate: string;

  @Column({ name: 'time_expired' })
  timeExpired: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'active', default: 1 })
  active: number;

  @Column({ name: 'appStoreReceipt', type: 'longtext' })
  appStoreReceipt: string;

  @Column({ name: 'transaction_id', type: 'text' })
  transactionId: string;

  @Column({ name: 'product_id_sale', type: 'text', nullable: true })
  productIdSale: string;

  @Column({ name: 'exchange', default: 0 })
  exchange: number;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string;

  @Column({ name: 'admin_id', type: 'int', nullable: true })
  adminId: number;

  @Column({ name: 'country', type: 'varchar', length: 2, nullable: true })
  country: string;

  @Column({ name: 'price_sale', default: 0 })
  priceSale: number;

  @Column({ name: 'platform_pred', type: 'varchar', length: 20, nullable: true })
  platformPred: string;

  @Column({ name: 'mia_total', type: 'int', nullable: true, default: 0})
  miaTotal: number;

  @Column({ name: 'product_type', type: 'int', nullable: true, default: 1})
  productType: number;

  @Column({ name: 'bank', type: 'int', nullable: true, default: 1})
  bank: number;

  @Column({ name: 'affiliate_code', type: 'varchar', length: 50, nullable: true })
  affiliateCode: string;
  
  @Column({ name: 'affiliate_package_key', type: 'varchar', length: 50, nullable: true })
  affiliatePackageKey: string;

  @Column({ name: 'affiliate_discount', type: 'int', nullable: true })
  affiliateDiscount: number;

  @Column({ name: 'origin_mia_total', type: 'int', nullable: true, default: 0})
  originMiaTotal: number;

  @Column({ name: 'transaction_code', type: 'varchar', nullable: true, default: null})
  transactionCode: string;
}


