import React, { createContext, useState, useContext, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  tags: string[];
}

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  fetchProducts: (pharmacyId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true); // Set initial loading to true

  const fetchProducts = async (pharmacyId: string) => {
    setLoading(true); // Set loading to true when fetching starts
    try {
      const categoriesSnapshot = await firebase.firestore().collection('categories').get();
      const allProducts: Product[] = [];

      for (const categoryDoc of categoriesSnapshot.docs) {
        const productsCollection = firebase.firestore().collection('categories').doc(categoryDoc.id).collection('products');
        const productsSnapshot = await productsCollection.where('userId', '==', pharmacyId).get();

        productsSnapshot.forEach(doc => {
          const productData = doc.data() as Product;
          allProducts.push(productData);
        });
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    // You might want to replace 'defaultPharmacyId' with actual logic to get the pharmacy ID
    fetchProducts('PharmacyId');
  }, []);

  return (
    <ProductContext.Provider value={{ products, isLoading, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
