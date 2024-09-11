import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';
import { useAuth } from '../contexts/authContext';

// Define the type for Product
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  pharmacyId: string;
}

// Define the type for the context value
interface ProductContextType {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
}

// Define the type for the provider props
interface ProductProviderProps {
  children: ReactNode;
}

// Create the context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Create the provider component
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth(); // Access the authenticated user from Auth context

  useEffect(() => {
    if (user) {
      fetchProducts(); // Fetch products once the user is authenticated
    }
  }, [user]);

  // Function to fetch products from all pharmacies in Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get a reference to the 'pharmacy' collection
      const pharmacyRef = collection(db, 'pharmacy');
      const querySnapshot = await getDocs(pharmacyRef);

      const productList: Product[] = [];

      // Loop through each pharmacy to get products
      for (const pharmacyDoc of querySnapshot.docs) {
        const productsRef = collection(db, 'pharmacy', pharmacyDoc.id, 'products');
        const productsSnapshot = await getDocs(productsRef);

        // Add products to the list
        productsSnapshot.forEach(productDoc => {
          productList.push({
            id: productDoc.id,
            ...productDoc.data(),
            pharmacyId: pharmacyDoc.id, // Store the pharmacyId with each product
          } as Product);
        });
      }

      setProducts(productList); // Set the combined product list
    } catch (error) {
      console.error('Error fetching products: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the ProductContext
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
