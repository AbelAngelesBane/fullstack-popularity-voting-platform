


import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useVotes } from '@/hooks/UseVote'
import { dateFormatter } from '@/lib/utils'
import { UserVote } from '@/types/types'
import Ionicons from '@react-native-vector-icons/ionicons'
import { router } from 'expo-router'
import { PollSkeleton } from '@/components/PollSkeleton'
import { useQueryClient } from '@tanstack/react-query'

const VoteScreen = () => {
  const queryClient = useQueryClient()
  const [loaded, setLoadedItems] = useState(0)
  const [allVotes, setAllVotes] = useState<UserVote[]>([])
  const { data, isLoading } = useVotes({ loaded })
  //adding to list, for showmore button
  const [isAdding, setIsAdding] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (data?.data?.votes) {
      setAllVotes((prev) => {
        const newVotes = data.data.votes.filter(
          (newV) => !prev.some((oldV) => oldV.id === newV.id)
        );
        return [...prev, ...newVotes];
      });
    }
  }, [data]);

  const handleShowMore = () => {
    setIsAdding(true)
    if (data?.data.hasMore && !isLoading) {
      setLoadedItems(allVotes.length);
    }
    setIsAdding(false)
  }

  const onRefresh = async () => {
    setIsRefreshing(true);
    setLoadedItems(0);

    setAllVotes([]);

    await queryClient.resetQueries({
      queryKey: ["myvotes"],
      exact: false,
    });

    setIsRefreshing(false);
  }
  return (
    <View className='p-4 bg-background flex-1'>

        <Text className='text-2xl text-text-primary font-light mt-2'>My Votes</Text>
      {
        <FlatList
          data={allVotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{paddingBottom:140}}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              // colors={["#FFFFFF"]} 
              tintColor={"#45d7f5"}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />}
          onEndReached={handleShowMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={!isRefreshing || !isLoading ? <EmptyVotes /> : <PollSkeleton /> }
          ListFooterComponent={isAdding ? <ActivityIndicator size={22} color={"#FFFFFF"} className='mt-2'/> : null}
          // ListFooterComponent={data && data.data.hasMore ? (isAdding) ? <ActivityIndicator size={22} color={"#FFFFFF"} className='mt-2'/> :
          //   <Pressable onPress={handleShowMore} disabled={isLoading}>
          //     <Text className='text-text-primary mt-2 text-center'>Show more...</Text>
          //   </Pressable> : null}
          renderItem={({ item }) => <VotesCard vote={item} />} />
      }
    </View>
  )
}

export default VoteScreen

const VotesCard = ({ vote }: { vote: UserVote }) => {
  return (
    <View className={`bg-background-light mt-2 rounded-xl max-h-60 p-2 flex-row items-center gap-2 h-40`}>
      <View className={`size-2 ${vote.poll.active ? "bg-green-400" : "bg-red-400"} rounded-full`} />
      {/* <Image/> */}
      <View>
        <Text className='font-light text-text-primary mr-4'>{vote.poll.name}</Text>
        <Text className='text-xs text-text-secondary'>Ends: {dateFormatter({ date: vote.poll.deadline })}</Text>
      </View>
    </View>
  )
}

const EmptyVotes = () => {
  return (
    <View className='my-40 justify-center items-center'>
      <Text className='text-6xl text-text-primary font-semibold'>Start Voting</Text>
      <View className='flex-row gap-2'>
        <Text className='text-2xl text-primary font-light'>Ooops!</Text>
        <Text className='text-2xl text-text-primary font-light'>Nothing&#39;s in here</Text>
      </View>
    </View>
  )
}