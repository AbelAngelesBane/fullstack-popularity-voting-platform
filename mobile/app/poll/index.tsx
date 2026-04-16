import { View, Text, ScrollView, Pressable } from 'react-native'
import React from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { router } from 'expo-router'

const ExplorePollsScreen = () => {
  return (
    <ScrollView className='bg-background'>
      <View className='flex flex-row gap-2 items-center'>
        <Pressable onPress={() => router.back()} className='mt-4'>
          <Ionicons style={{ left: 0, flexDirection: "row", marginBottom: 4, marginHorizontal: 12 }} name='arrow-back-outline' size={50} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScrollView>
  )
}

export default ExplorePollsScreen