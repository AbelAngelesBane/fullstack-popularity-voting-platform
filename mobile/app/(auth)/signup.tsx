import { View, Text, Pressable, TextInput, Linking, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@react-native-vector-icons/ionicons'
import { router } from 'expo-router'
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/hooks/UseAuth'
import z from 'zod'
import { signupSchema } from '@/schema/schemas'
import { AxiosError } from 'axios'
import { toast } from 'sonner-native';
import { CONNECTION_ERROR, INVALID_CREDENTIALS, SOMETHING_WENT_WRONG } from '@/contants/errors'



type SignupFormData = z.infer<typeof signupSchema>;
const SignupScreen = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isPassword2Visible, setIsPassword2Visible] = useState(false);
    const { signUpMutation, isSigningUp } = useAuth();
    const [error, setError] = useState<{ message: string } | null>();
    const [agreed, setAgreed] = useState(false)

    const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            repassword: ""
        },
    });

    function handlePressBack() {
        router.back()
    }

    //handleSubmit populates this:
    function handleSignup(data: SignupFormData) {
        if(!agreed){
            toast.error("Terms and Policy\nAgree to the terms and privacy policy.")
            return;
        }
        setError(null)
        const { repassword, ...submitData } = data
        signUpMutation.mutate(submitData,
            {
                onSuccess: (response) => {
                    console.log(response)
                    if (response) {
                        if (response.data && response.data.user) {
                            router.push({
                                pathname: "/(auth)/otp",
                                params: { email: response.data?.user.email }
                            })
                        }
                        else if (response.step && response.step === "verify-otp") {
                            router.push({
                                pathname: "/(auth)/otp",
                                params: { email: data.email }
                            })
                        }
                    }
                },
                onError: (err) => {
                    const axiosError = err as AxiosError;

                    if (!axiosError.response) {
                        setError({ message: CONNECTION_ERROR });
                    } else {
                        const errorData: any = axiosError.response.data;
                        if (errorData.error === "Email already in use. Please login instead.") {
                            setError({ message: INVALID_CREDENTIALS });
                        } else {
                            toast.error(SOMETHING_WENT_WRONG)
                        }
                    }
                }
            }
        )
    }

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: '#000000' }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom:22 }}
            extraScrollHeight={50}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
        >

            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'transparent']}
                className='absolute left-0 right-0 top-0 h-[300]'
            />
            <Pressable onPress={handlePressBack} className='mt-4'>
                <Ionicons style={{ left: 0, flexDirection: "row", marginBottom: 4, marginHorizontal: 12 }} name='arrow-back-outline' size={100} color="#FFFFFF" />
            </Pressable>
            <Text className='text-text-primary text-8xl tracking-[4px] font-thin mx-4 leading-tight'>Get Started!</Text>

            {/* NAME SECTION */}
            <View className='m-4 mt-6'>
                <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
                    <Text className={`${error?.message || errors.name?.message ? "text-red-500" : "text-white"} text-xl font-light`}>Name</Text>
                </View>
                <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            placeholder='Enter name'
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            className={`border ${error?.message || errors.name?.message ? "border-red-500" : "border-white"} rounded-lg px-4 py-3 text-white text-lg`}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                        {
                            errors.name?.message && <Text className='text-red-500'>{errors.name.message}</Text>
                        }
                    </>

                )}>
                </Controller>

            </View>

            {/* EMAIL SECTION */}
            <View className='m-4 mt-2'>
                <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
                    <Text className={`${error?.message || errors.email?.message ? "text-red-500" : "text-white"} text-xl font-light`}>Email</Text>
                </View>
                <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                    <>
                        <TextInput
                            inputMode='email'
                            placeholder='Enter Email'
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            className={`border ${error?.message || errors.email?.message ? "border-red-500" : "border-white"} rounded-lg px-4 py-3 text-white text-lg`}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                        {
                            errors.email?.message && <Text className='text-red-500'>{errors.email.message}</Text>
                        }
                    </>

                )}>
                </Controller>

            </View>

            {/* PASSWORD SECTION */}
            <View className='m-4 mt-2'>
                <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
                    <Text className={`${error?.message || errors.password?.message ? "text-red-500" : "text-white"} text-xl font-light`}>Password</Text>
                </View>
                <View className={`flex-row items-center border ${error?.message || errors.password?.message ? "border-red-500" : "border-white"} rounded-lg px-4`}>
                    <Controller
                        control={control}
                        name='password'
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    onChangeText={onChange}
                                    value={value}
                                    onBlur={onBlur}
                                    secureTextEntry={!isPasswordVisible}
                                    placeholder='Enter Password'
                                    placeholderTextColor="rgba(255,255,255,0.4)"

                                    className={`flex-1 py-3 text-white text-lg font-light`}
                                />

                            </>
                        )}

                    />
                    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="#FFFFFF"
                        />
                    </Pressable>
                </View>
                {
                    errors.password?.message && <Text className='text-red-500'>{errors.password.message}</Text>
                }
            </View>

            {/* REPASSWORD SECTION */}
            <View className='m-4 mt-2'>
                <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
                    <Text className={`${error?.message || errors.repassword?.message ? "text-red-500" : "text-white"} text-xl font-light`}>Confirm Password</Text>
                </View>

                <View className={`flex-row items-center border ${error?.message || errors.repassword?.message ? "border-red-500" : "border-white"} rounded-lg px-4`}>
                    <Controller
                        control={control}
                        name='repassword'
                        render={({ field: { onChange, value, onBlur } }) => (
                            <>
                                <TextInput
                                    onChangeText={onChange}
                                    value={value}
                                    onBlur={onBlur}
                                    secureTextEntry={!isPassword2Visible}
                                    placeholder='Re-Enter Password'
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    className='flex-1 py-3 text-white text-lg font-light'
                                />
                            </>
                        )} />
                    <Pressable onPress={() => setIsPassword2Visible(!isPassword2Visible)}>
                        <Ionicons
                            name={isPassword2Visible ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="#FFFFFF"
                        />
                    </Pressable>
                </View>
                {
                    errors.repassword?.message && <Text className='text-red-500'>{errors.repassword.message}</Text>
                }
            </View>
            {error?.message && <Text className='text-red-500 text-center text-xl'>{error.message}</Text>}
            <View className='flex-row flex-wrap justify-center px-4 mb-2'>
                <Text className='text-slate-200 font-light'>Already have an account? </Text>

                <Pressable onPress={() => router.push("/(auth)/signin")}>
                    <Text className='text-white font-bold underline'>Sign-in</Text>
                </Pressable>

            </View>
            <Pressable
                disabled={isSigningUp}
                className='flex-row rounded-lg gap-2 border-2 border-white w-48 p-1 mt-2 items-center justify-center self-center'
                onPress={handleSubmit(handleSignup)}>
                <Text className='text-2xl text-text-primary font-light'>Sign Up</Text>
                {
                    isSigningUp ? <ActivityIndicator size={28} color={"#FFFFFF"} /> : <Ionicons name='chevron-forward' color="#FFFFFF" size={22} />
                }
            </Pressable>

            <View className='flex-row flex-wrap justify-center mt-6 px-4'>
                <Pressable className='h-4 w-4 bg-white rounded-md mx-1 mt-1 justify-center items-center' onPress={()=>setAgreed(!agreed)}>
                    {agreed && <Ionicons name='checkmark' size={16}/>}
                </Pressable>
                <Text className='text-slate-200 font-light'>By signing up, you agree to our </Text>

                <Pressable onPress={() => Linking.openURL('https://your-gist-url.com/terms')}>
                    <Text className='text-white font-bold underline'>Terms</Text>
                </Pressable>

                <Text className='text-slate-200 font-light'> and </Text>

                <Pressable onPress={() => Linking.openURL('https://your-gist-url.com/privacy')}>
                    <Text className='text-white font-bold underline'>Privacy Policy</Text>
                </Pressable>
            </View>

        </KeyboardAwareScrollView>
    )
}

export default SignupScreen