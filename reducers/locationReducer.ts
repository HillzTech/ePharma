export interface LocationState {
    location: {
      latitude: number;
      longitude: number;
      address: string;
    } | null;
  }
  
  export interface UpdateLocationAction {
    type: 'UPDATE_LOCATION';
    payload: {
      location: {
        latitude: number;
        longitude: number;
        address: string;
      };
    };
  }
  
  export type LocationAction = UpdateLocationAction;
  
  export const LocationReducer = (state: LocationState, action: LocationAction): LocationState => {
    switch (action.type) {
      case 'UPDATE_LOCATION':
        return {
          ...state,
          location: action.payload.location,
        };
      default:
        return state;
    }
  };
  