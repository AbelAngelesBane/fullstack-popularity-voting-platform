import { FeaturedPoll } from '@/types/types';
import React, { useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');



const AutoCarousel = ({ polls }: { polls: FeaturedPoll[] }) => {
    const [selectedItem, setSelectedItem] = useState(0)
    // useEffect((

    // )=>[selectedItem])
    return (
        <View className="flex-1 items-center justify-center py-4">
            <Carousel
                loop
                width={screenWidth}
                height={screenWidth * 0.5}
                autoPlay={true}
                autoPlayInterval={3000}
                data={polls}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => setSelectedItem(index)}
                renderItem={({ item }) => (
                    <View className="px-4 justify-center items-center">
                        <View className='z-20 absolute flex-row w-full items-center justify-center p-2 bottom-0'>
                            <Text className=' text-white/70 text-center bg-black/30 p-2 rounded-full'>{item.name}</Text>
                        </View>
                        <Image
                            source={{ uri: item.banner ?? "https://picsum.photos/id/1/800/400" }}
                            style={{ width: "100%", height: "100%", borderRadius:10}}
                            alt={item.banner ?? "Banner"}
                        />
                    </View>

                )}
            />
            <View className='flex-row gap-1 mt-2'>
                {polls.map((item, index) => (
                    <View key={index} className={`size-2 ${index === selectedItem ? "bg-white" : "bg-slate-500"} rounded-full`} />
                ))}
            </View>

        </View>
    );
};

export default AutoCarousel;