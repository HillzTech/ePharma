// contexts/AllProductsContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';

interface Product {
  uploadedAt: any;
  id: string;
  title: string;
  price: number;
  costPrice: number;
  percentageDiscount: number;
  imageUrls: string[];
  tags: string[];
  userId: string;
  pharmacyName: string;
}

interface AllProductsContextType {
  products: Product[];
  isLoading: boolean;
}

export const AllProductsContext = createContext<AllProductsContextType>({
  products: [],
  isLoading: true,
});

export const AllProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);

        const allProducts: Product[] = [];
        for (const categoryDoc of categoriesSnapshot.docs) {
          const categoryProductsRef = collection(db, `categories/${categoryDoc.id}/products`);
          const productsSnapshot = await getDocs(categoryProductsRef);

          const productsList: Product[] = productsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || '',
              price: data.price || 0,
              costPrice: data.costPrice || 0,
              percentageDiscount: data.percentageDiscount || 0,
              imageUrls: data.imageUrls || [],
              tags: data.tags || [],
              userId: data.userId,
              pharmacyName: data.pharmacyName || '',
              uploadedAt: data.uploadedAt || '',
            };
          });

          allProducts.push(...productsList);
        }

        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching all products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  return (
    <AllProductsContext.Provider value={{ products, isLoading }}>
      {children}
    </AllProductsContext.Provider>
  );
};
