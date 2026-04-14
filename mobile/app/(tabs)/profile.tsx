import { Text } from 'react-native'
import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const ProfileScreen = () => {
  return (
    <KeyboardAwareScrollView className='p-4 bg-background'>
      <Text>ProfileScreen</Text>
    </KeyboardAwareScrollView>
  )
}

export default ProfileScreen