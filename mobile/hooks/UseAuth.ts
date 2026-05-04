
import { SOMETHING_WENT_WRONG } from "@/contants/errors";
import { api } from "@/lib/api"
import { clearUser, saveUserData } from "@/lib/storage";
import { ResetPasswordInput, signInSchema, signupSchema } from "@/schema/schemas";
import { MyProfile, OtpResponse, SignInResponse, SignupResponse, VerifyOtpParams } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { router } from "expo-router";
import { toast } from "sonner-native";

import z from "zod";



type SignupData = z.infer<typeof signupSchema>;

export const useAuth = () => {
    const queryClient = useQueryClient();

    const {data:myProfile, isFetching:isLoadingProfile} = useQuery({
        queryKey:["myprofile"],
        queryFn:async()=>{
            const data = await api.get<MyProfile>("/user/myprofile")
            return data.data
        }
    })

    const signUpMutation = useMutation({
        mutationFn: async (body: SignupData) => {
            const data = await api.post<SignupResponse>("/auth/signup", body);
            return data.data
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async (body:VerifyOtpParams) => {
            const result = await api.post<OtpResponse>("/auth/verifyEmail",body);
            return result.data;
        },
    })

    const resendOtpMutation= useMutation({
        mutationFn:async(email:string)=>{
            const result = await api.post<{message:string, email:string}>("/auth/resend-otp",{email});
            return result;
        }
    })

    const signInMutation=useMutation({
        mutationFn: async (body:z.infer<typeof signInSchema>)=>{
            const result = await api.post<SignInResponse>("/auth/signin",body);
            return result.data;
        },
        onSuccess:(data)=>{
            //Just to be sureeee
            if(data && data.token){
                const uid = data.user.id;
                const email = data.user.email;
                const token = data.token;
                saveUserData({uid, email,token})
                queryClient.invalidateQueries({queryKey:["myprofile"]})
            }
        }
    })

    const updateProfileMutation=useMutation({
        mutationFn:async(body:{name:string, image:string})=>{
            const data = api.post("/user/profile",body);
            return data
        },
        onSuccess:()=>{queryClient.refetchQueries({queryKey:["myprofile"]})}
        
    })

    const updateFCM = useMutation({
        mutationFn:async(body:{fcm:string})=>{
            const data = await api.patch("/user/fcm",body)
            return data
        }
    })

    const logout = useMutation({
        mutationFn:async()=>{
            const data = await api.post("/auth/signout")
            return data
        },
        onSuccess:()=>{
            toast.success("Successfully signed out")
            clearUser();
        },
        onError:(err:AxiosError)=>{
            if (!err.response) {
               toast.error("Network Error\nPlease check your connection.");
                } 
            else{
                toast.error(SOMETHING_WENT_WRONG)}
            }            
    })

    const forgotPassword=useMutation({
        mutationFn:async(body:{email:string})=>{
            const data = await api.post("/auth/forgotPassword",body);
            return data
        },
    })


    const resetPassword=useMutation({
        mutationFn:async(body:ResetPasswordInput)=>{
            const data = await api.post("/auth/resetPassword",body);
            return data
        },
        onSuccess:()=>{
            toast.success("Success.")
            router.push("/(auth)/signin")
        }
    })


    return { 
        signUpMutation, 
        isSigningUp: signUpMutation.isPending, 
        verifyOtpMutation, 
        isSubmittingOtp: verifyOtpMutation.isPending, 
        resendOtpMutation, 
        isResendingOtp:resendOtpMutation.isPending,
        signInMutation,
        isSigningIn:signInMutation.isPending,
        isLoadingProfile,
        myProfile,
        updateFCM,
        updateProfileMutation,
        isUpdatingProfile:updateProfileMutation.isPending,
        logout,
        isLoggingOut:logout.isPending,
        forgotPasswordMutation:forgotPassword,
        resetPasswordMutation:resetPassword,
        isReseting:resetPassword.isPending,
        isSendingResetOTP:forgotPassword.isPending
    }

}