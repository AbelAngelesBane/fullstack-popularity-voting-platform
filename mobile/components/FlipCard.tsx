import { Nominee } from '@/types/types';
import React, { useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';

export const FlipCard = ({ item }: { item: Nominee }) => {
  const [flipped, setFlipped] = useState(false);
  const spin = useSharedValue(0);

  const handlePress = () => {
    setFlipped(!flipped);
    spin.value = withTiming(flipped ? 0 : 180, { duration: 500 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(spin.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${spinValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(spin.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${spinValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <Pressable onPress={handlePress} className="w-full h-[300px] items-center justify-center">
      {/* FRONT SIDE (Image) */}
      <Animated.View 
        className="absolute w-full h-full bg-white rounded-[10px] shadow-lg shadow-black/50"
        style={[frontAnimatedStyle, { elevation: 5 }]}
      >
        <Image
          source={{ uri: item.avatar ?? "https://picsum.photos/id/1/800/400" }}
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
        />
        <View className='absolute bottom-0 w-full p-2 rounded-b-[10px]'>
          <Text className='text-white text-center font-light'>View Bio</Text>
        </View>
      </Animated.View>

      {/* BACK SIDE (Text/Bio) */}
      <Animated.View 
        className="absolute w-full h-full bg-slate-800 rounded-[10px] shadow-lg p-4 items-center justify-center"
        style={[backAnimatedStyle, { elevation: 5 }]}
      >
        <Text className="text-white text-center text-lg mb-2 font-light">{item.name}</Text>
        <Text className="text-slate-300 text-center font-thin">
          {item.bio || "No bio available for this nominee."}
        </Text>
        <Text className="text-blue-400 mt-4 text-xs">Tap to flip back</Text>
      </Animated.View>
    </Pressable>
  );
};