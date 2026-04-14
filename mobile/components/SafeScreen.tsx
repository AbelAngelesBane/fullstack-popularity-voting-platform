


import { View} from 'react-native'
import React, { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SafeScreen = ({children}:{children:ReactNode}) => {
    const inset = useSafeAreaInsets();
  return (
    <View style={{paddingTop:inset.top, flex:1, backgroundColor:"#000000"}}>
        {children}
    </View>
  )
}

export default SafeScreen