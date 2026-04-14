

import { SOMETHING_WENT_WRONG } from '@/contants/errors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { toast } from 'sonner-native';

export const saveUserData = async ({uid, email, token}:{uid: string, email: string, token: string}) => {
  try {
    await SecureStore.setItemAsync('session_token', token);

    await AsyncStorage.setItem('user_uid', uid);
    await AsyncStorage.setItem('user_email', email);
    router.push("/(tabs)")    
  } catch (err) {
    console.error("Storage Error:", err);
  }
};

export const getUserData = async () => {
  const email = await AsyncStorage.getItem('user_email');
  const uid = await AsyncStorage.getItem('user_uid');
  const token = await SecureStore.getItemAsync('session_token');
  return { email, uid, token };
};

export const clearUser=async()=>{
try {
    AsyncStorage.clear();
    SecureStore.deleteItemAsync('session_token');
    router.replace("/(auth)/signin")
} catch (error) {
    toast.error(SOMETHING_WENT_WRONG)
}}