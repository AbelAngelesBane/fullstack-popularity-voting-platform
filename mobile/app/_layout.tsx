import "../global.css";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Slot, SplashScreen, useRootNavigationState, useSegments } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { clearUser, getUserData } from "@/lib/storage";
import { pusher } from "@/lib/pusher";
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { onMessageReceived, requestUserPermission } from "@/lib/notification";
import { useAuth } from "@/hooks/UseAuth";
import { AxiosError } from "axios";

//I already have the interceptor checking, so the 401 is unecessary here.
const queryClient = new QueryClient({
  queryCache: new QueryCache({ 
    onError: (err) =>{
    const axiosError = (err as AxiosError)
      if (axiosError.response?.status === 401 || axiosError.status === 401) {
        return; 
      }
    console.error("Query Error", err) 
  },
}),
});

const setupPusher = async () => {
  try {
    await pusher.init({
      apiKey: process.env.EXPO_PUBLIC_PUSHER_KEY!,
      cluster: "ap1"
    });
    await pusher.connect();
    console.log("Pusher Ready");
  } catch (e) {
    console.error("Pusher Init Failed", e);
  }
};


//GEMINI suggested wrapper (added segments) to break from the LOOP i created
function AppStateWrapper() {
  const { updateFCM } = useAuth();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);
  const hasAttemptedRedirect = useRef(false);

  // This useEffect is to close listeners / Notification listeners, and calls on syncFCM
  useEffect(()=>{
    let cleanup:(()=>void) | undefined;
    const initNotification = async ()=>{
      const {token} = await getUserData()
      //ifsigned in update FCM@
      if(token){
          //Notifee requestUserPermission > helper at lib.
          await requestUserPermission().then(token => {
            if (token) {
              updateFCM.mutate({ fcm: token }, { onSuccess: () => console.log("UPDATED FCM", token) });
            }

        });

          const unsubscribe = messaging().onMessage(async remoteMessage => {
            await onMessageReceived(remoteMessage);
          });

          const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
              const pollId = detail.notification?.data?.pollId;
              if(!pollId)return
              router.push(`/poll/${pollId}`)
            }
          });

          return () => {
            unsubscribe();
            unsubscribeNotifee();
          };
      }
    }
    },[])


  useEffect(() => {
    if (!rootNavigationState?.key || hasAttemptedRedirect.current) return;

    const prepareApp = async () => {
      hasAttemptedRedirect.current = true;
      
      try {
        const { token } = await getUserData();
        //PUSHER for WEBSOCKET
        await setupPusher();

        //Check here if contains token, log-in. If not redirect to signup. 
        //
        if (!token) {
          if (segments[0] !== "(auth)") {
            router.replace("/(auth)/signin");
          }
          await clearUser();
        } else {
          if (segments[0] !== "(tabs)") {
            router.replace("/(tabs)");
          }
        }
      } catch (e) {
        console.error("Preparation Error:", e);
      } finally {
        setIsReady(true);
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 300);
      }
    };

    prepareApp();
  }, [rootNavigationState?.key]);

  return <Slot />;
}


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppStateWrapper />
        <Toaster />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}