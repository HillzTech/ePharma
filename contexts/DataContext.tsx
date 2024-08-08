import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DataContextType {
    categories: any[];
    tags: any[];
    setCategories: (categories: any[]) => void;
    setTags: (tags: any[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);

    return (
        <DataContext.Provider value={{ categories, tags, setCategories, setTags }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
