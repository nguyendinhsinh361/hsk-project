export interface IPurchase{
    idUser: number;
    productId: string;
    platforms: string;
    purchaseDate: string;
    timeExpired: string;
    appStoreReceipt: string;
    transactionId: string;
    productIdSale: string;
    miaTotal: number;
    productType: number;
    affiliateCode: number;
    affiliatePackageKey: number;
    affiliateDiscount: number;
    originMiaTotal: number;
  }