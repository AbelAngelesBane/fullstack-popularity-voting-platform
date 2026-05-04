import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator} from 'react-native'
import React, { useEffect, useRef } from 'react'
import AutoCarousel from '@/components/AutoCarousel'
import { useFeed } from '@/hooks/UseFeed'
import { PollBase } from '@/types/types'
import { dateFormatter } from '@/lib/utils'
import Ionicons from '@react-native-vector-icons/ionicons'
import { router } from 'expo-router'
import { Player } from '@lordicon/react';
import { FeaturedPollSkeleton, PollSkeleton } from '@/components/PollSkeleton'
import { useQueryClient } from '@tanstack/react-query'
import { SomethingWentWrongCard } from '@/components/SomethingWentWrongCard'
import { Skeleton } from 'moti/skeleton'



const IC_CATEGS: Record<string, any> = {
  pageantry: require('../../assets/images/spa-flower.json'),
  film: require('../../assets/images/film.json'),
  lifestyle: require('../../assets/images/film.json'),
  music: require('../../assets/images/music.json'),
  business: require('../../assets/images/business.json'),
  other: require('../../assets/images/icon.png') 
};

const HomePage = () => {
  const queryClient = useQueryClient()
  const { isError, isFetching, data, error } = useFeed();
  const featuredPoll = data && data.data ? data.data.featuredPolls : []

  const activePolls = data && data.data ? data.data.activePolls : []


  const handleRefresh = ()=>{
    queryClient.refetchQueries({queryKey:["feed"]})
  }

  return (

    <ScrollView className='p-4 bg-background' contentContainerStyle={{paddingBottom:140}} showsVerticalScrollIndicator={false}>
      <Text className='text-6xl text-text-primary font-thin tracking-tight mt-4'>KUMUSTA</Text>
      {/* Search Bar */}
      {isFetching ? <View className='mt-8'>
          <Skeleton radius={12} height={48} width={"100%"} />
        </View>:
        <TextInput
          inputMode='email'
          placeholder='Search'
          onPress={()=>router.push("/search")}
          placeholderTextColor="rgba(255,255,255,0.4)"
          className='w-full h-12 bg-slate-600/20 p-4 rounded-full mt-8'
        />
      }
      {/* Trending Poll */}
      { 
      // If something went wrong
      isError ? <View className='my-8'>
        {isFetching ? 
        <View className='gap-y-24'>
        <FeaturedPollSkeleton/> 
        <PollSkeleton/>
        
        </View> :
          <SomethingWentWrongCard onRefresh={handleRefresh}/> 
          }
        </View> : 
      <>
        <View>
          <Text className='text-2xl text-text-primary font-light mt-4'>Trending Polls</Text>
          {isFetching ? <FeaturedPollSkeleton/> :
          <AutoCarousel polls={featuredPoll} />
          }
        </View>

        {/* Active Polls */}
        <View>
          <View className='flex flex-row items-center justify-between'>
            <Text className='text-2xl text-text-primary font-light mt-2'>Explore Polls</Text>
            <Pressable onPress={()=>router.push("/search")} className='active:opacity-70'>
              <Ionicons name='chevron-forward' size={22} color="#FFFFFF"/>
            </Pressable>
          </View>
          { isFetching ?<PollSkeleton/> :
            <ActivePollsCard polls={activePolls} />
          }
          
        </View>
      </>
      }
    </ScrollView>

  )
}

export default HomePage

const ActivePollsCard =({polls}:{polls:PollBase[]})=>{
  const playerRef = useRef<Player>(null);
  
    useEffect(() => {
        playerRef.current?.playFromBeginning();
    }, [])

  return(

    polls.map((poll)=>(
      <Pressable 
        key={poll.id} 
        className='flex flex-row h-18 w-full bg-background-light rounded-xl mt-2 p-2 gap-2 active:opacity-70'
        onPress={()=>router.push(`/poll/${poll.id}`)}>
         <Player 
            ref={playerRef} 
            icon={IC_CATEGS[poll.category.title.toLowerCase()] ?? IC_CATEGS.other }
        />
      <View  className=''>
        <Text className='text-text-primary text-wrap break-words max-h-10'>{poll.name}</Text>
        <Text className='text-text-secondary text-xs'>{dateFormatter({date:poll.deadline})}</Text>
      </View>
      </Pressable>
    ))

  )
}

 
