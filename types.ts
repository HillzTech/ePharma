// types.ts
export interface Product {
    id: string;
    title: string;
    price: number;
    imageUrls?: string[]; // Optional
    quantity?: number;
  }
  