import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '../Components/firebaseConfig';
import { getDownloadURL, ref } from 'firebase/storage';

interface Category {
  name: string;
  imageUrl: string;
}

interface CategoriesContextProps {
  categories: Category[];
  loading: boolean;
}

const CategoriesContext = createContext<CategoriesContextProps | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const categorySnapshot = await getDocs(categoriesCollection);

        if (!categorySnapshot.empty) {
          const categoryList = await Promise.all(
            categorySnapshot.docs.map(async (doc) => {
              const data = doc.data();
              let imageUrl = data.imageUrl;
              if (imageUrl && imageUrl.startsWith('gs://')) {
                const storageRef = ref(storage, imageUrl);
                try {
                  imageUrl = await getDownloadURL(storageRef);
                } catch (error) {
                  imageUrl = '';
                }
              }
              return { ...data, imageUrl } as Category;
            })
          );
          setCategories(categoryList);
        }
      } catch (error) {
        console.error('Error fetching categories: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
