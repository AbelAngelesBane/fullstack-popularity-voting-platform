import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

export async function requestUserPermission() {
  await notifee.requestPermission()



    
  const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
  }

export async function onMessageReceived(message: any) {
  console.log("MESDSAGE RECEIVED: ", message)
  const channelId = await notifee.createChannel({
    id: 'poll-updates',
    name: 'Poll Updates',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: message.notification?.title || "Selecshyon",
    body: message.notification?.body || "Tap to open",
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
    data: message.data, 
  });
}