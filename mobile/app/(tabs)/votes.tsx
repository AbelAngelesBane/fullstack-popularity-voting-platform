


import { View, Text } from 'react-native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const VoteScreen = () => {
  return (
    <KeyboardAwareScrollView className='p-4 bg-background'>
      <Text>VoteScreen</Text>
    </KeyboardAwareScrollView>
  )
}

export default VoteScreen