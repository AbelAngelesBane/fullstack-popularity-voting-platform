
import { LinearGradient } from 'expo-linear-gradient';


import { View, Text,Pressable,Image } from 'react-native'
import React, { useEffect } from 'react'
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
const HomeScreen = () => {

  function handleSignIn(){
    router.push("/(auth)/signin")
  }
  function handleSignUp(){
    router.push("/(auth)/signup")
  }
  return (
    <View className='flex flex-1 pt-12 bg-black items-center gap-4 px-4'>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'transparent']}
        className='absolute left-0 right-0 top-0 h-[300]'
      />
      <Image source={require('../../assets/images/icon.png')} className='max-h-64 max-w-64 mt-28 mb-12'/>
      {/* <Text className='text-text-primary text-7xl tracking-[4px] font-thin mb-8'>Welcome Back!</Text> */}
      
      <Pressable className='flex-row items-center justify-center gap-6 py-1 px-4 rounded-full  border-r-2 border-blue-900' onPress={handleSignIn}>        
          <Text className='text-4xl text-text-primary font-extralight'>Sign in</Text>
          <Ionicons name='chevron-forward' color="#FFFFFF" size={26}/>
      </Pressable>

      <Pressable className='flex-row items-center justify-center rounded-lg gap-6 border-2 border-white/50 bg-black/30 w-48 p-2 mt-4' onPress={handleSignUp}>        
          <Text className='text-2xl text-text-primary font-light'>Sign up</Text>
          <Ionicons name='chevron-forward' color="#FFFFFF" size={26}/>
      </Pressable>

    </View>
  );
}
export default HomeScreen


