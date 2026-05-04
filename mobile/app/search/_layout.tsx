import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'

const ExplorePollsLayout = () => {
  return (
    <SafeScreen>
      <Stack screenOptions={{headerShown:false}}/>
    </SafeScreen>
  )
}

export default ExplorePollsLayout