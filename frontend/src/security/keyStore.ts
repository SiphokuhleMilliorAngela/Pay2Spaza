import * as SecureStore from 'expo-secure-store';

// Native: keep the signing key in the phone's secure keychain/keystore.
export const getItem = (key: string) => SecureStore.getItemAsync(key);
export const setItem = (key: string, value: string) => SecureStore.setItemAsync(key, value);
