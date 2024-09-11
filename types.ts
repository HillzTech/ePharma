// types.ts
export interface Product {
    id: string;
    title: string;
    price: number;
    imageUrls?: string[]; 
    quantity?: number;
    userId: string;
    pharmacyName: string;
  }
  