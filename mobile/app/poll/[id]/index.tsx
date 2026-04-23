

import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Dimensions, FlatList, } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Ionicons from '@react-native-vector-icons/ionicons'
import { usePoll } from '@/hooks/UsePoll'
import { Image } from 'expo-image'
import { pusher } from '@/lib/pusher'
import { Comment, Nominee } from '@/types/types'
import { PusherEvent } from '@pusher/pusher-websocket-react-native'
import Carousel from 'react-native-reanimated-carousel'
import { FlipCard } from '@/components/FlipCard'

const { width: screenWidth } = Dimensions.get('window');



const PollDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const [comments, setComments] = useState<Comment[]>()

  const { data, isLoading, error, comments: commentData, isCommentsFetching } = usePoll(id.toString());


  useEffect(() => {
    setComments(commentData);
    let isSubscribed = true;
    console.log("adkjf;ikladf", commentData)
    const connectPusher = async () => {
      try {
        await pusher.subscribe({
          channelName: `poll-comment-${id}`, // Ensure backticks are here
          onEvent: (event: PusherEvent) => {
            if (isSubscribed && event.data) {
              const newComment = JSON.parse(event.data).comment;
              console.log("NEW Comments: ", newComment);
              setComments((prev) => prev ? [newComment, ...prev] : [newComment]);
            }
          }
        });
      } catch (e) {
        console.error("Pusher subscribe error:", e);
      }
    };

    connectPusher();

    return () => {
      isSubscribed = false;
      pusher.unsubscribe({ channelName: `poll-comment-${id}` });
    };
  }, [id, commentData]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }


  if (error || !data) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-white">Poll not found or error occurred.</Text>
      </View>
    );
  }
  const poll = data.response;

  return (
    <View className='flex-1 bg-background h-400' >
      <View className='p-4'>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <View className='flex-row w-full items-center'>
                <Pressable className='ml-2' onPress={() => router.back()}>
                  <Ionicons name='arrow-back' color={"#FFFFFF"} size={32} />
                </Pressable>
                <View className="flex-1 mt-2 mx-4">
                  <Text
                    className='text-2xl text-text-primary font-light text-center'
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {poll.name}
                  </Text>
                </View>
              </View>
              {/* This is for later? I'm undecided whether to include a banner. */}
              {/* <Image
                source={{ uri: poll.banner || "https://images.unsplash.com/photo-1590845947670-c009801ffa74?q=80&w=2918&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
                style={{ height: 150, width: "100%", marginTop: 10 }} /> */}
              <View className='mt-2 p-4'>
                {
                  <NomineeProfile nominee={data.response.nominees} />
                }
              </View>
              <Text className='text-2xl text-text-primary font-light ml-4'>Comments</Text></>
          }
          renderItem={({ item, index }) => <CommentCard comment={item} index={index}/>
          } />
      </View>
    </View>
  )
}

export default PollDetailScreen

const CommentCard = ({ comment, index }: {index:number, comment: Comment }) => {
  return (
    <View className={`flex-grow flex-row grid grid-cols-3 p-2 items-center gap-2 ${index === 0 && 'rounded-t-xl'} bg-gray-900`} >
      <Image
        source={{ uri: comment.author.image ?? "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
        alt={comment.author.name} style={{ height: 46, width: 46, borderRadius: 100, }} />
      <Text className='text-white w-[65%]'>{comment.text}</Text>
      <Pressable className='justify-end items-end w-[15%]'>
        <Ionicons name='trash' size={20} color={"#FFFFFF"}/>
      </Pressable>
    </View>
  )
}

const NomineeProfile = ({ nominee }: { nominee: Nominee[] }) => {
  const [selectedItem, setSelectedItem] = useState(0)

  return (
    <View className="items-center justify-center rounded-xl">
      <Carousel
        loop
        width={screenWidth - 20}
        height={screenWidth * 1.4}
        data={nominee}
        onSnapToItem={(index) => setSelectedItem(index)}
        renderItem={({ item }) => (
          <View className="flex-1 mx-2 px-4 items-center justify-center  bg-gray-900 rounded-xl">
            <View
              className="w-full bg-white rounded-[10px] shadow-lg shadow-black/50"
              style={{ elevation: 5 }}
            >
              <FlipCard item={item} />
            </View>
            <View className='mx-0 px-0 mt-4'>
              <Text className='text-text-primary text-center text-2xl font-light'>
                Would you like to vote for {item.name}?
              </Text>
            </View>
            <Pressable className='flex-row w-[40%] items-center justify-center p-2 bg-white/10 mt-4 rounded-lg'>
              <Text className='text-white font-light'>YES</Text>
            </Pressable>
          </View>

        )}
      />
      <View className='flex-row gap-1 mt-2'>
        {nominee.map((item, index) => (
          <View key={index} className={`size-2 ${index === selectedItem ? "bg-white" : "bg-slate-500"} rounded-full`} />
        ))}
      </View>

    </View>
  );
};
