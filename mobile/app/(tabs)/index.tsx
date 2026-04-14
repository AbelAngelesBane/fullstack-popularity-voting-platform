import { View, Text, ScrollView, TextInput } from 'react-native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AutoCarousel from '@/components/AutoCarousel'
import { useFeed } from '@/hooks/UseFeed'

const HomePage = () => {
  const { isError, isLoading, isSuccess, data } = useFeed();
  const featuredPoll = data && data.data ? data.data.featuredPolls : []

  const activePolls = data && data.data ? data.data.activePolls : []


  return (

    <KeyboardAwareScrollView className='p-4 bg-background'>
      <Text className='text-6xl text-text-primary font-thin tracking-tight mt-4'>KUMUSTA</Text>
      {/* Search Bar */}
      <View>
        <TextInput
          inputMode='email'
          placeholder='Search'
          placeholderTextColor="rgba(255,255,255,0.4)"
          className='w-full h-12 bg-slate-600/20 p-4 rounded-full mt-8'
        />
      </View>

      {/* Featured Poll */}
      <View>
        <Text className='text-2xl text-text-primary font-light mt-4'>Featured Poll</Text>
        <AutoCarousel polls={featuredPoll} />
      </View>

    </KeyboardAwareScrollView>

  )
}

export default HomePage