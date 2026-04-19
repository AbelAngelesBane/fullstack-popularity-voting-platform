

import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import Ionicons from '@react-native-vector-icons/ionicons'
import { usePoll } from '@/hooks/UsePoll'
import { Image } from 'expo-image'

const PollDetailScreen = () => {
  const { id } = useLocalSearchParams()

  const { data, isLoading, error } = usePoll(id.toString());

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
    <ScrollView className='flex-1 bg-background' showsVerticalScrollIndicator={false}>
      {/* Search Bar */}

      <View className='flex-row w-full items-center gap-2'>
        <Pressable className='' onPress={() => router.back()}>
          <Ionicons name='arrow-back' color={"#FFFFFF"} size={32} />
        </Pressable>
        <View className="flex-1">
          <Text
            className='text-2xl text-text-primary font-light'
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            { poll.name}
          </Text>
        </View>
      </View>
      <Image 
        source={{uri:poll.banner || "https://images.unsplash.com/photo-1590845947670-c009801ffa74?q=80&w=2918&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }} 
        style={{height:150, width:"100%", marginTop:10}}/>

      <View className='mt-2 p-4'>
        <Text className='text-2xl text-text-primary font-light mt-2'>Nominees</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 6 }}>
        {poll.nominees.map((nominee) => (
          <View key={nominee.id} className='flex-col gap-2 w-28 mx-2 items-center'> 
            
            <Image 
              style={{ height: 100, width: 100, borderRadius: 50 }} 
              source={{ uri: nominee.avatar }} 
            />

            <View className='w-full'> 
              <Text 
                className='text-white text-center font-thin' 
                numberOfLines={3}
                style={{ flexShrink: 1 }} 
              >
                Total votes: {nominee.votes}
              </Text>
              <Text 
                className='text-white text-center' 
                numberOfLines={3}
                style={{ flexShrink: 1 }} 
              >
                {nominee.name}
              </Text>
            </View>
          </View>
        ))}
    </ScrollView>
      </View>

    <View className='p-4'>
        <Text className='text-2xl text-text-primary font-light'>Comments</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{height:300, backgroundColor:'#47556933', marginTop:4, borderRadius:8}}>

        </ScrollView>
    </View>

    </ScrollView>
  )
}

export default PollDetailScreen