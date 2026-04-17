import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useAuth } from '@/hooks/UseAuth';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/schema/schemas';
import z from 'zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner-native';
import { CONNECTION_ERROR, INVALID_CREDENTIALS, VERIFICATION_REQUIRED } from '@/contants/errors';

type SignInFormData = z.infer<typeof signInSchema>

const SigninScreen = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signInMutation, isSigningIn } = useAuth()
  const [error, setError] = useState<string | null>()

  const { control, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  function handleSignIn(data: SignInFormData){
    setError(null);
    signInMutation.mutate(data,{
      onError:(error)=>{
        const axiosError = (error as AxiosError)
        if(!axiosError.response){
          toast.error(CONNECTION_ERROR)
          return;
        }
        else if(axiosError && axiosError.status === 403){
          toast(VERIFICATION_REQUIRED);
          router.push("/(auth)/otp")
        }
        else if(axiosError && axiosError.status === 401){
          toast.error(INVALID_CREDENTIALS)
          setError("Invalid credentials.")
        }
        
      }
    })
    

  }

  function handleSignUp() {
    router.push("/(auth)/signup")
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: '#000000' }}
      contentContainerStyle={{ flexGrow: 1 }}
      extraScrollHeight={50}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >

      <View className='relative flex pt-8 '>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'transparent']}
        className='absolute left-0 right-0 top-0 h-[300]'
      />
        <Pressable onPress={()=>router.back()}>
          <Ionicons style={{ left: 0, flexDirection: "row", marginBottom: 4, marginHorizontal: 12 }} name='arrow-back-outline' size={36} color="#FFFFFF" />
        </Pressable>

      <Text className='text-text-primary text-7xl tracking-[4px] font-thin mx-4 mb-4'>Welcome Back!</Text>
        {/*FORMS */}
        {/* EMAIL SECTION */}
        <View className='m-4 mt-6'>
          <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
            <Text className={`text-xl font-light ${error || errors.email ? "text-red-500" : "text-white"}`}>Email</Text>
          </View>
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                inputMode='email'
                placeholder='Enter Email'
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholderTextColor="rgba(255,255,255,0.4)"
                className={`border ${error || errors.password ? "border-red-500" : "border-white"} rounded-lg px-4 py-3 text-white text-lg`}
              />
            )}
          />
          {(errors && errors.email) && <Text className='text-red-500'>{errors.email.message}</Text>}
        </View>

        {/* PASSWORD SECTION */}
        <View className='m-4 mt-2'>
          <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
            <Text className={`text-xl font-light ${error || errors.password ? "text-red-500" : "text-white"}`}>Password</Text>
          </View>

          <View className={`flex-row items-center border ${error || errors.password ? "border-red-500" : "border-white"} rounded-lg px-4`}>
            <Controller
              control={control}
              name='password'

              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  onBlur={onBlur}
                  value={value}
                  placeholder='Enter Password'
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className={`flex-1 py-3 text-white text-lg font-light`}
                />
              )} />
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Ionicons
                name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
          {(errors && errors.password) && <Text className='text-red-500'>{errors.password.message}</Text>}

        </View>
          {(error) && <Text className='text-red-500 text-center'>{error}</Text>}
        <Pressable className='mt-4 relative mx-4 h-12 ' disabled={isSigningIn}>
          <Text className='text-text-secondary font-light absolute right-0'>Forgot password?</Text>
        </Pressable>

        <Pressable className={`flex-row rounded-lg gap-2 border-2 border-white w-48 p-1 mt-2 items-center justify-center self-center`} onPress={handleSubmit(handleSignIn)}>
          <Text className='text-2xl text-text-primary font-light'>Sign in</Text>
          {isSigningIn ? <ActivityIndicator size={22} color="#FFFFFF" /> :
            <Ionicons name='chevron-forward' color="#FFFFFF" size={22} />
          }

        </Pressable>
        <View className='flex flex-row gap-2 mt-6 justify-center'>
          <Text className='text-white'>Don&rsquo;t have an account?</Text>
          <Pressable onPress={handleSignUp} disabled={isSigningIn}>
            <Text className='text-text-secondary'>Sign up</Text>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </View>
    </KeyboardAwareScrollView>

  );
}

export default SigninScreen