

import { View, Text, Pressable, ActivityIndicator, Dimensions, FlatList, TextInput, } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Ionicons from '@react-native-vector-icons/ionicons'
import { usePoll } from '@/hooks/UsePoll'
import { Image } from 'expo-image'
import { pusher } from '@/lib/pusher'
import { Comment, Nominee, PricingTier } from '@/types/types'
import { PusherEvent } from '@pusher/pusher-websocket-react-native'
import Carousel from 'react-native-reanimated-carousel'
import { FlipCard } from '@/components/FlipCard'
import { Skeleton } from 'moti/skeleton'
import { toast } from 'sonner-native'


const { width: screenWidth } = Dimensions.get('window');



const PollDetailScreen = () => {
  const { id } = useLocalSearchParams()
  const [comments, setComments] = useState<Comment[]>()
  const [totalComments, setTotalComments]=useState(1)
  const [deletingId, setDeletingId] = useState<string>("")

  const { data, 
    isPending, 
    error, comments: commentData, 
    isCommentsFetching,
    removeComment,
    addComment } = usePoll(id.toString(),totalComments);

  const handleRemoveComment = (id:string)=>{
    setDeletingId(id)
    removeComment.mutate(id,{
      onSuccess:()=>{
        setComments((prev)=> {
          if(!prev)return [] //This wont be empty, i thinl
          const filtered = prev?.filter((item) => item.id !== id)
          return filtered;
        })
        setDeletingId("")},
      onError:()=>setDeletingId("")
    })
    
  }

const handleAddComment = (text: string, callback: () => void) => {
  addComment.mutate(
    { text, pollId: id.toString() },
    {
      onSuccess: () => {
        toast.success("Comment added.");
        callback(); 
      },
      onError: () => {
        toast.error("Failed to add comment.");
      },
    }
  );
};

useEffect(()=>{
    setComments((prev) => {
      if (!commentData) return prev;
      const existingComments = prev ?? [];
      //set for faster lookup
      const existingIds = new Set(existingComments.map(c => c.id));
      const newUniqueComments = commentData.filter(c => !existingIds.has(c.id));

      return [...existingComments, ...newUniqueComments];
  });
},[commentData])

  useEffect(() => {
    let isSubscribed = true;
    const connectPusher = async () => {
      try {
        await pusher.subscribe({
          channelName: `poll-comment-${id}`, 
          onEvent: (event: PusherEvent) => {
            if (isSubscribed && event.data) {
              const newComment = JSON.parse(event.data).comment;
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
  }, [id]);

  if (error) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-white">Poll not found or error occurred.</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-background h-400' >
      <View className='p-4'>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          onEndReached={()=>{
            setTotalComments((comments ?? [])?.length)
          }}
          ListFooterComponent={isCommentsFetching ? <ActivityIndicator style={{marginVertical:12}} size={22} color={"#FFFFFF"}/> : null }
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!isCommentsFetching && (comments ?? []).length === 0 ? (<>
            <Text className='text-white font-light text-center mt-4'>Nothing&apos;s in here!</Text>
            </>) : null }
          ListHeaderComponent={
            <>
            {isPending ? <PollHeaderSkeleton/> :
            <View>
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
                    {data?.name ?? "Loading Poll.."}
                  </Text>
                </View>
              </View>
              <View className='mt-2 p-4'>
                { data?.nominees &&
                  <NomineeProfile nominee={data.nominees} myVotes={data.currentVoteSpent}/>
                }
              </View>
              <Text className='text-2xl text-text-primary font-light ml-4'>Comments</Text>
              <CommentInput onSendMessage={handleAddComment}/>
            </View>
            }
            </>
          }
          renderItem={({ item, index }) => <CommentCard 
            deletingId={deletingId} 
            comment={item} 
            commentCount={(comments ?? []).length }
            isCommentsFetching={isCommentsFetching} 
            removeComment={handleRemoveComment}/>
            } 
          
          />
      </View>
    </View>
  )
}

export default PollDetailScreen

const CommentCard = (
  { comment,  removeComment, deletingId, isCommentsFetching, commentCount } : 
  {
  deletingId:string, 
  comment: Comment, 
  commentCount:number,
  isCommentsFetching:boolean, 
  removeComment:(id:string) =>void }) => {

  return (
    <>
    {isCommentsFetching && commentCount <= 0 ? <ActivityIndicator size={22} color={"#FFFFFF"}/> :
    <View className={`flex-grow flex-row grid grid-cols-3 p-2 items-center gap-2 bg-gray-900`} >
      <Image
        source={{ uri: comment.author.image || "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
        alt={comment.author.name} style={{ height: 46, width: 46, borderRadius: 100, }} />
      <View className='flex-col w-[65%]'>
        <Text className='text-text-secondary '>{comment.author.name}</Text>
        <Text className='text-white'>{comment.text}</Text>
      </View>
      <View className='justify-end items-end w-[15%]'>
      {deletingId === comment.id ? <ActivityIndicator size={32} color={"#FFFFFF"}/> :
      (
        <Pressable 
          onPress={()=>removeComment(comment.id)}>
          <Ionicons name='trash' size={20} color={"#FFFFFF"}/>
        </Pressable>
      )
      }
      </View>
    </View>
    }
    </>
  )
}

const NomineeProfile = ({ nominee, myVotes}: { nominee: Nominee[], myVotes:PricingTier[]}) => {
  const [selectedItem, setSelectedItem] = useState(0);
  const [isFreeVoteVisible, setShowIsFreeVote] = useState(true);
  const [isBasicVoteVisible, setShowIsBasicVote] = useState(true);
  const [isPremiumVoteVisible, setShowIsPremiumVote] = useState(true);

  useEffect(()=>{
    if(myVotes.includes(PricingTier.BASIC))setShowIsBasicVote(false)
    if(myVotes.includes(PricingTier.FREE))setShowIsFreeVote(false)
    if(myVotes.includes(PricingTier.PREMIUM))setShowIsPremiumVote(false) 

  },[])

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
                Vote for {item.name}
              </Text>
            </View>
            <Pressable 
              disabled={!isFreeVoteVisible}
              className={`
                flex-row w-[40%] items-center justify-center p-2 mt-4 rounded-lg
                ${isFreeVoteVisible ?  'bg-slate-400 active:opacity-80' : 'bg-slate-400/30'}
              `}
            >
              {/* For Free voting */}
            <Text className={`${isFreeVoteVisible ? 'text-white' : 'text-white/50'} font-light`}>
                +1 vote
            </Text>
            </Pressable>

            {/* For Basic voting */}
            <Pressable 
              disabled={!isBasicVoteVisible}
                className={`
                flex-row w-[40%] items-center justify-center p-2 mt-4 rounded-lg
                ${isFreeVoteVisible ?  'bg-yellow-600 active:opacity-80' : 'bg-yellow-300/30'}
              `}>
            <Text className={`${isFreeVoteVisible ? 'text-white' : 'text-white/30'} font-light`}>
                +5 votes</Text>
            </Pressable>
            {/* For Premium voting */}
            <Pressable 
                disabled={!isPremiumVoteVisible}
                className={`
                flex-row w-[40%] items-center justify-center p-2 mt-4 rounded-lg
                ${isPremiumVoteVisible ?  'bg-orange-400 active:opacity-80' : 'bg-orange-300/30'}
              `}>
            <Text className={`${isPremiumVoteVisible ? 'text-white' : 'text-white/30'} font-light`}>
                +8 votes</Text>
            </Pressable>
          </View>

        )}
      />
      <View className='flex-row gap-1 mt-2'>
        {nominee?.map((item, index) => (
          <View key={index} className={`size-2 ${index === selectedItem ? "bg-white" : "bg-slate-500"} rounded-full`} />
        ))}
      </View>

    </View>
  );
};

const CommentSkeleton = () => {
  return (
    <View className="flex-row p-2 items-center gap-2 bg-gray-900">
      <Skeleton
        colorMode="dark"
        radius="round"
        height={46}
        width={46}
        transition={{ type: 'timing', duration: 1500 }}
      />
      
      <View className="w-[65%] gap-2 ml-2">
        <Skeleton
          colorMode="dark"
          width={'100%'}
          height={12}
          transition={{ type: 'timing', duration: 1500 }}
        />
        <Skeleton
          colorMode="dark"
          width={'60%'}
          height={12}
          transition={{ type: 'timing', duration: 1500 }}
        />
      </View>
      
      <View className="w-[15%] items-end">
        <Skeleton
          colorMode="dark"
          width={24}
          height={24}
          radius={4}
          transition={{ type: 'timing', duration: 1500 }}
        />
      </View>
    </View>
  );
};

const PollHeaderSkeleton = () => {
  return (
    <View className="p-4">
      <View className="flex-row w-full items-center">
        <View className="ml-2">
          <Skeleton colorMode="dark" radius="round" height={32} width={32} />
        </View>

        <View className="flex-1 mt-2 mx-4 items-center">
          <Skeleton colorMode="dark" width="80%" height={28} radius={4} />
        </View>
      </View>

      <View className="mt-2 p-4 items-center">
        <Skeleton 
          colorMode="dark" 
          width="100%" 
          height={400} 
          radius={12} 
        />
      </View>

      <View className="ml-4 mt-2">
        <Skeleton colorMode="dark" width={120} height={24} radius={4} />
      </View>
    </View>
  );
};

const CommentInput = ({ onSendMessage }: { onSendMessage: (msg: string, cb: () => void) => void }) => {
  const [text, setText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;

    setIsCommenting(true);
    onSendMessage(text, () => {
      setText("");
      setIsCommenting(false);
    });
    

  };

  return (
    <View className="flex-row items-end p-3 bg-gray-900 border-t border-gray-800 mt-2 rounded-t-lg">
      <View className="flex-1 bg-white/5 rounded-2xl px-4 py-2 min-h-[45px] justify-center">
        <TextInput
          placeholder="Write a comment..."
          placeholderTextColor="#9ca3af"
          className="text-white font-light text-[15px]"
          multiline
          value={text}
          onChangeText={setText}
        />
      </View>
      {isCommenting ? (
        <View className='mx-2 items-center my-4'>
           <ActivityIndicator size={22} color={"#FFFFFF"}/> 
        </View>
      ) : (
        <Pressable 
          onPress={handleSend}
          disabled={!text.trim()}
          className={`ml-3 h-[45px] w-[45px] rounded-full items-center justify-center ${text.trim() ? 'bg-orange-500' : 'bg-gray-700'}`}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
};