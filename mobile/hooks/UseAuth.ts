
import { api } from "@/lib/api"
import { saveUserData } from "@/lib/storage";
import { signInSchema, signupSchema } from "@/schema/schemas";
import { MyProfile, OtpResponse, SignInResponse, SignupResponse, VerifyOtpParams } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
        updateProfileMutation,
        isUpdatingProfile:updateProfileMutation.isPending
    }

}