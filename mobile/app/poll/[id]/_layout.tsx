


import React from 'react'
import { Stack } from 'expo-router'
import SafeScreen from '@/components/SafeScreen'

const PollDetailLayout = () => {
  return (
    <SafeScreen>
        <Stack screenOptions={{headerShown:false}}>
        </Stack>
        </SafeScreen>
  )
}

export default PollDetailLayout