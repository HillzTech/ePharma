import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Your Firestore configuration


interface RevenueData {
    month: string;
    revenue: number;
  }
  
export const fetchMonthlyRevenue = async (userId: string): Promise<RevenueData[]> => {
    try {
      const revenueRef = doc(db, 'revenue', userId);
      const revenueDoc = await getDoc(revenueRef);
  
      if (revenueDoc.exists()) {
        return revenueDoc.data().monthlyRevenue as RevenueData[]; // Cast to the expected type
      } else {
        console.log('No revenue data found');
        return [];
      }
    } catch (error) {
      console.error('Error fetching revenue data: ', error);
      return [];
    }
  };