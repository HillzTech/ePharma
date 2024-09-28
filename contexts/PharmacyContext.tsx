import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface PharmacyContextProps {
  pharmacyName: string;
  fetchPharmacyName: (userId: string) => void;
}

const PharmacyContext = createContext<PharmacyContextProps | undefined>(undefined);

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pharmacyName, setPharmacyName] = useState<string>('');

  const fetchPharmacyName = async (userId: string) => {
    try {
      const docRef = firebase.firestore().collection('pharmacy').doc(userId);
      const doc = await docRef.get();
      if (doc.exists) {
        setPharmacyName(doc.data()?.pharmacyName);
      } else {
      
      }
    } catch (error) {
      console.error('Error fetching pharmacy name:', error);
      setPharmacyName('Error fetching pharmacy name');
    }
  };

  return (
    <PharmacyContext.Provider value={{ pharmacyName, fetchPharmacyName }}>
      {children}
    </PharmacyContext.Provider>
  );
};
