declare module 'react-native-swiper' {
    import { Component } from 'react';
    import { StyleProp, ViewStyle, TextStyle } from 'react-native';
  
    interface SwiperProps {
      style?: StyleProp<ViewStyle>;
      showsPagination?: boolean;
      autoplay?: boolean;
      // Add other props if needed
    }
  
    export default class Swiper extends Component<SwiperProps> {}
  }
  