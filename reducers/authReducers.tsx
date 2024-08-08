// Define the state and action types for the reducer
export interface SignInState {
    userToken: string | null;
    userInfo: {
      email: string;
      username: string;
    };
  }
  
  export interface UpdateSignInAction {
    type: 'UPDATE_SIGN_IN';
    payload: {
      userToken: string;
    };
  }
  
  export interface UpdateUserInfoAction {
    type: 'UPDATE_USER_INFO';
    payload: {
      email: string;
      username: string;
    };
  }
  
  export interface SignOutAction {
    type: 'SIGN_OUT';
  }
  
  export type SignInAction = UpdateSignInAction | UpdateUserInfoAction | SignOutAction;
  
  // Reducer function with proper typing
  export const SignInReducer = (state: SignInState, action: SignInAction): SignInState => {
    switch (action.type) {
      case 'UPDATE_SIGN_IN':
        return {
          ...state,
          userToken: action.payload.userToken, // Accepts string for userToken
        };
      case 'UPDATE_USER_INFO':
        return {
          ...state,
          userInfo: {
            email: action.payload.email,
            username: action.payload.username,
          },
        };
      case 'SIGN_OUT':
        return {
          ...state,
          userToken: null, // Set userToken to null on sign-out
          userInfo: {
            email: '',
            username: '',
          },
        };
      default:
        return state;
    }
  };
  