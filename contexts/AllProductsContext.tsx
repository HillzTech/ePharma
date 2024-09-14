// contexts/AllProductsContext.tsx
import React, { createContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';
import haversine from 'haversine-distance';
import GetLocation from 'react-native-get-location';

interface Product {
  uploadedAt: any;
  id: string;
  title: string;
  price: number;
  costPrice: number;
  percentageDiscount: number;
  imageUrls: string[];
  tags: string[];
  location: { latitude: number; longitude: number };
  distance: number;
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
    const fetchUserLocation = async () => {
      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        return location;
      } catch (error) {
        console.error('Error fetching user location:', error);
        return null;
      }
    };

    const fetchAllProducts = async (userLocation: any) => {
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
              location: data.location || { latitude: 0, longitude: 0 },
              distance: 0,
              userId: data.userId,
              pharmacyName: data.pharmacyName || '',
              uploadedAt: data.uploadedAt || '',
            };
          });

          // Calculate distance for each product
          const productsWithDistance = productsList.map(product => {
            const distanceInMiles = userLocation
              ? haversine(
                  { latitude: userLocation.latitude, longitude: userLocation.longitude },
                  product.location
                ) / 1609.34
              : 0;
            return { ...product, distance: Math.round(distanceInMiles) };
          });

          allProducts.push(...productsWithDistance);
        }

        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching all products:', error);
      } finally {
        setLoading(false);
      }
    };

    const initializeProducts = async () => {
      const userLocation = await fetchUserLocation();
      fetchAllProducts(userLocation);
    };

    initializeProducts();
  }, []);

  return (
    <AllProductsContext.Provider value={{ products, isLoading }}>
      {children}
    </AllProductsContext.Provider>
  );
};
