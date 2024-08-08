import React, { createContext, useReducer, Dispatch, ReactNode } from 'react';
import { LocationReducer, LocationState, LocationAction } from '../reducers/locationReducer';

// Define the type for the context state and dispatch
interface LocationContextProps {
  locationState: LocationState;
  locationDispatch: Dispatch<LocationAction>;
}

// Define the type for the provider props
interface LocationContextProviderProps {
  children: ReactNode; // Define 'children' prop type
}

export const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const LocationContextProvider: React.FC<LocationContextProviderProps> = ({ children }) => {
  const [locationState, locationDispatch] = useReducer(LocationReducer, {
    location: null,
  });

  return (
    <LocationContext.Provider value={{ locationState, locationDispatch }}>
      {children}
    </LocationContext.Provider>
  );
};