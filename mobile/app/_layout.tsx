import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { router, Slot, SplashScreen } from "expo-router";
import React, { useEffect, useState } from "react";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { clearUser, getUserData } from "@/lib/storage";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      //sentry later
    }
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {

    }
  })
});

// here's my dilemma.. and approach.. ill reseach abt it later
// i want the user to still open the app when no connection.. My approach..
// on load check if there is a token and if there is proceed to home? ands when internet restored.. 
// it should check the storage first.. if there is token then proceed to home (api call). 
// (ask sir mark for his opinion)? also im clearing the storage just to be sure again if the token is null in storage then redirect to sigin.
//shouldm i cache some parts of the app for offline display?
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const prepareApp = async () => {
      try {
        const { token } = await getUserData();

        if (!token) {
          router.replace("/(auth)/signin");
          await clearUser();
        } else {
          router.replace("/(tabs)");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return <GestureHandlerRootView>
    <QueryClientProvider client={queryClient}>

      <Slot screenOptions={{ headerShown: false }} />
      <Toaster />

    </QueryClientProvider>
  </GestureHandlerRootView>

}
