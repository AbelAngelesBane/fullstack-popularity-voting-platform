import {
  Pusher,

  PusherEvent,
} from '@pusher/pusher-websocket-react-native';

export const pusher = Pusher.getInstance();





const connectToChannel = async({channel}:{channel:string})=>{
  await pusher.connect();
  await pusher.subscribe({
    channelName: channel, 
    onEvent: (event: PusherEvent) => {
      console.log(`Event received: ${event}`);
    }
  });
}
    
