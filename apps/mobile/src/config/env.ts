import { Platform } from 'react-native';

const API_BASE_URL_ANDROID =
  process.env.VOCASH_API_BASE_URL_ANDROID || 'http://10.0.2.2:5001';
const API_BASE_URL_IOS =
  process.env.VOCASH_API_BASE_URL_IOS || 'http://localhost:5001';

export const API_BASE_URL =
  Platform.OS === 'android' ? API_BASE_URL_ANDROID : API_BASE_URL_IOS;
