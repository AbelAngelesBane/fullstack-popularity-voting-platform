import { useAuth } from "@/hooks/UseAuth";
import { ResetPasswordInput, resetPasswordSchema } from "@/schema/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Ionicons from "@react-native-vector-icons/ionicons";
import { AxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View, ActivityIndicator, Text, StyleSheet, Dimensions, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { OtpInput } from "react-native-otp-entry";
import { toast } from "sonner-native";


const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 10,
        marginVertical: 20,
    },
    pinCodeContainer: {
        width: (width - 80) / 6,
        height: 60,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderBottomWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
    },
    activePinCodeContainer: {
        borderColor: '#FFFFFF',
        borderWidth: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    filledPinCodeContainer: {
        borderColor: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    pinCodeText: {
        fontSize: 28,
        fontWeight: '200',
        color: '#FFFFFF',
    },
    placeholderText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 24,
    },
    focusStick: {
        backgroundColor: '#FFFFFF',
        width: 2,
        height: 30,
    },
    disabledPinCodeContainer: {
        opacity: 0.5,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    errorPinCodeContainer: {
        width: (width - 80) / 6,
        height: 60,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderBottomWidth: 2,
        borderRadius: 8,
        borderColor: '#ef4444',
    },
    errorPinCodeText: {
        color: '#fca5a5',
        fontWeight: '400',
    },
    errorMessageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '300',
        textAlign: 'center',
        marginTop: 15,
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'center',
    },
});

const ResetPasswordScreen=()=>{
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    

    const [error, setError] = useState(false);
    
    const { resetPasswordMutation, isReseting } = useAuth();
    const { email } = useLocalSearchParams();

      const { control, handleSubmit, formState: { errors },setValue } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
          email: "",
          newPassword: "",
          otp:""
        }
      })
      
    useEffect(()=>{
        setValue("email",email.toString().trim())
    },[email])

    function handleVerify(body:ResetPasswordInput) {
        setError(false);
        
        resetPasswordMutation.mutate(body, {
            onError: (error) => {
                const axiosError = (error as AxiosError<{
                    error: string;
                    message: string;
                }>);
                if (!axiosError.response) {
                    toast.error("Network Error\nPlease check your connection.");
                } else {
                    const err = axiosError.response.data;
                    toast.error(err.message || "Invalid OTP or Password requirements not met");
                    setError(true);
                }
            },
            onSuccess: (data) => {
                toast.success("Password Reset Successful!\nPlease sign in with your new password.");
                router.push("/(auth)/signin");
            }
        });
    }


return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: '#000000' }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 22 }}
            extraScrollHeight={50}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
        >
            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'transparent']}
                className='absolute left-0 right-0 top-0 h-[300]'
            />

            <Pressable onPress={() => router.back()} className='mt-12 ml-4'>
                <Ionicons name='arrow-back-outline' size={32} color="#FFFFFF" />
            </Pressable>

            <View className="mt-8 px-4">
                <Text className='text-text-primary text-6xl tracking-[2px] font-thin leading-tight'>Reset{"\n"}Password</Text>
            </View>

            {/* OTP SECTION */}
            <View className='m-4 mt-10'>
                <Text className='text-white text-xl font-light ml-2 mb-2'>Verification Code</Text>
                <Controller
                    control={control}
                    name="otp"
                    render={({ field: { onChange } }) => (
                        <OtpInput
                            numberOfDigits={6}
                            focusColor={errors.otp ? "#ef4444" : "#FFFFFF"}
                            onTextChange={onChange}
                            theme={{
                            containerStyle: styles.container,
                            pinCodeContainerStyle: error ? styles.errorPinCodeContainer : styles.pinCodeContainer,
                            focusedPinCodeContainerStyle: error ? styles.errorPinCodeContainer : styles.activePinCodeContainer,
                            filledPinCodeContainerStyle: error ? styles.errorPinCodeContainer : styles.filledPinCodeContainer,
                            pinCodeTextStyle: error ? styles.errorPinCodeText : styles.pinCodeText,
                            focusStickStyle: styles.focusStick,
                            placeholderTextStyle: styles.placeholderText,
                            disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
                                }}
                        />
                    )}
                />
                {errors.otp  && <Text className='text-red-500 ml-2'>{errors.otp.message}</Text>}
            </View>


            {/* NEW PASSWORD SECTION */}
            <View className='m-4 mt-4'>
                <View className='z-50 -mb-4 ml-4 self-start bg-black px-2'>
                    <Text className="text-white text-xl font-light">New Password</Text>
                </View>
                <View className={`flex-row items-center border ${errors.newPassword ? "border-red-500" : "border-white"} rounded-lg px-4`}>
                    <Controller
                        control={control}
                        name='newPassword'
                        render={({ field: { onChange, value, onBlur } }) => (
                            <TextInput
                                onChangeText={onChange}
                                value={value}
                                onBlur={onBlur}
                                secureTextEntry={!isPasswordVisible}
                                placeholder='At least 8 characters'
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                className='flex-1 py-3 text-white text-lg font-light'
                            />
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
                {errors.newPassword && <Text className='text-red-500 mt-1 ml-2'>{errors.newPassword.message}</Text>}
            </View>

            {/* SUBMIT BUTTON */}
            <View className="mt-10 px-4">
                <Pressable
                    disabled={isReseting}
                    className={`flex-row rounded-lg gap-2 border-2 border-white p-3 items-center justify-center self-center w-full max-w-xs`}
                    onPress={handleSubmit(handleVerify)}>
                    <Text className='text-2xl text-text-primary font-light'>Update Password</Text>
                    {isReseting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Ionicons name='checkmark-circle-outline' color="#FFFFFF" size={24} />
                    )}
                </Pressable>
            </View>

        </KeyboardAwareScrollView>
    );


}

export default ResetPasswordScreen