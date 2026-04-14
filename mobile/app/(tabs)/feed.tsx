import { View, Text } from 'react-native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const FeedScreen = () => {
  return (
    <KeyboardAwareScrollView className='p-4 bg-background'>
      <Text>FeedScreen</Text>
    </KeyboardAwareScrollView>
  )
}

export default FeedScreen