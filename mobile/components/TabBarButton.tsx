


import {  GestureResponderEvent, Text } from 'react-native'
import React, { useEffect } from 'react'
import { PlatformPressable } from '@react-navigation/elements'
import Ionicons from '@react-native-vector-icons/ionicons'

import Animated, { useSharedValue, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';

const icons: Record<string, Function> = {
  index: (props:any) => <Ionicons name="home-outline" size={24} {...props} />,
//   votes: (props:any) => <Ionicons name="checkmark-circle-outline" size={24} {...props} />,
  feed: (props:any) => <Ionicons name="reader-outline" size={24} {...props} />,
  profile: (props:any) => <Ionicons name="person-circle-outline" size={24} {...props} />,
};

const TabBarButton = ({
            onPress,
            onLongPress,
            isFocused,
            routeName,
            color,
            label
}:{
    onPress:any, 
    onLongPress: (e: GestureResponderEvent) => void, 
    isFocused:boolean, 
    routeName: string, 
    color:string, 
    label: string ;
}) => {

    const scale = useSharedValue(0);

    useEffect(()=>{
        scale.value = withSpring(typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused, {duration:350})
    },[scale,isFocused])

    const animatedTextStyle = useAnimatedStyle(()=>{
        const opacity = interpolate(scale.value, [0,1], [1,0]);

        return {opacity}
    })

    const animatedIconStyle = useAnimatedStyle(()=>{
        //input, [input range], [output range]
        const scaleValue = interpolate(scale.value,[0,1], [1,1.2])
        const top = interpolate(scale.value,[0,1],[0,9])
        return {
            transform:[{
                scale:scaleValue
            }],
            top:top
        }
    })
  return (
          <PlatformPressable
            key={routeName}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1,justifyContent:'center', alignItems:'center', gap:4, }}
          >
            <Animated.View style={animatedIconStyle}>
                {icons[routeName]({
                color:isFocused ? "#FFFFFF" : "#ADADAD"
                })}
            </Animated.View>
            <Animated.Text style={[{color:isFocused ? "#FFFFFF" : "#ADADAD"}, animatedTextStyle] }>{label}</Animated.Text>
          </PlatformPressable>
  )
}

export default TabBarButton