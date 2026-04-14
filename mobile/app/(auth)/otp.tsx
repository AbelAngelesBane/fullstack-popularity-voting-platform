import { View, Text, Pressable, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { LinearGradient } from 'expo-linear-gradient'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { router, useLocalSearchParams } from 'expo-router'
import { OtpInput } from "react-native-otp-entry";
import { useAuth } from '@/hooks/UseAuth'
import { AxiosError } from 'axios'
import { toast } from 'sonner-native'

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

const OtpScreen = () => {
    const initialTime = 180;
    const [isOnCountDown, setIsOnCountDown] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const { isSubmittingOtp, verifyOtpMutation, resendOtpMutation, isResendingOtp } = useAuth();
    const { email } = useLocalSearchParams();


    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function handlePressBack() {
        router.back()
    }
    function startCountDown() {
        if (timerRef.current) clearInterval(timerRef.current);

        setTimeRemaining(initialTime);
        setIsOnCountDown(true);

        timerRef.current = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current ?? 0);
                    setIsOnCountDown(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // clear interval when component unmounts
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                setIsOnCountDown(false);
            }
        };
    }

    useEffect(() => {
        startCountDown();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    function handleVerify() {
        //start cd
        setError(false);
        console.log(otp)
        if (otp.length < 6) {
            setError(true)
        }
        else {
            const params = { email: email.toString(), otp }
            verifyOtpMutation.mutate(params, {
                onError: (error) => {
                    const axiosError = (error as AxiosError<{
                        error: string;
                        message: string;
                    }>);
                    if (!axiosError.response) {
                        toast.error("Network Error\nPlease check your connection.");

                    }
                    else {
                        const err = axiosError.response.data
                        toast.error(err.message)
                        setError(true)
                    }
                },
                onSuccess: (data) => {
                    if (data && data.result) {
                        toast.success("Success\nPlease sigin with your account.")
                        router.push("/(auth)/signin");
                    }
                }
            })

        }
    }

    function handleResendOtp() {
        resendOtpMutation.mutate(email.toString(), {
            onError: (error) => {
                const axiosError = (error as AxiosError<{
                    error: string;
                    message: string;
                }>);
                if (!axiosError.response) {
                    toast.error("Network Error\nPlease check your connection.");
                }
                else {
                    const err = axiosError.response.data
                    if (err.error === "This account is already verified. Please login.") toast.error("Invalid credentials")
                    else {
                        console.log("here", err.message)
                        toast(err.error)
                    }
                    setError(true)
                }
            },
            onSuccess: (data) => {
                if (data && data.status === 200) {
                    toast.success("OTP sent!")
                    startCountDown();
                }
            }
        })
    }

    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ backgroundColor: '#000000', flexGrow: 1, paddingTop: 16 }}
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
            <View className="flex-1 mt-12">
                <Text className='text-text-primary text-xl tracking-[4px] font-light mx-4 leading-tight text-center' >OTP Verification</Text>
                <OtpInput
                    numberOfDigits={6}
                    focusColor={error ? "red" : "green"}
                    autoFocus={false}
                    hideStick={true}
                    placeholder="******"
                    blurOnFilled={true}
                    disabled={false}
                    type="numeric"
                    secureTextEntry={false}
                    focusStickBlinkingDuration={500}
                    onFocus={() => console.log("Focused")}
                    onBlur={() => console.log("Blurred")}
                    onTextChange={(text) => {
                        setOtp(text)
                        setError(false)
                    }}
                    // onFilled={(text) => console.log(`OTP is ${text}`)}
                    textInputProps={{
                        accessibilityLabel: "One-Time Password",
                    }}
                    textProps={{
                        accessibilityRole: "text",
                        accessibilityLabel: "OTP digit",
                        allowFontScaling: false,
                    }}
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
                {error && <Text className='text-center text-xl text-red-500 font-light '>Invalid OTP!</Text>}
                <Pressable className='flex-row gap-2 justify-center' onPress={handleResendOtp} disabled={isOnCountDown || isSubmittingOtp}>
                    <Text className='text-text-primary font-light'>Didn&rsquo;t receive OTP?</Text>
                    {isResendingOtp ? <ActivityIndicator color="#FFFFFF" /> :
                        isOnCountDown ? (
                            <View className="flex flex-row">
                                <Text className='text-text-primary'> 
                                    {minutes.toString().padStart(2, '0')}:
                                    {seconds.toString().padStart(2, '0')}
                                </Text>
                            </View>
                        ) : <Text className='text-text-primary text-center font-light'>Resend OTP</Text>
                    }

                </Pressable>
                <Pressable
                    disabled={isSubmittingOtp}
                    className={`${isSubmittingOtp ? 'bg-black/10 border-black/10' : 'border-white'} flex-row rounded-lg gap-2 border-2  w-48 p-1 items-center justify-center self-center mt-8`}
                    onPress={handleVerify}>
                    <Text className={`text-4xl  ${isSubmittingOtp ? 'text-black/10' : 'text-text-primary'} font-extralight`}>Sign in</Text>
                    {isSubmittingOtp ? <ActivityIndicator size={24} color="#FFFFFF" /> : <Ionicons name='chevron-forward' color="#FFFFFF" size={26} />
                    }
                </Pressable>
            </View>
        </KeyboardAwareScrollView>
    )
}

export default OtpScreen