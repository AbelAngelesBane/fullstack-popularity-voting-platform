import { View, Pressable, Text } from "react-native"

export const SomethingWentWrongCard =({onRefresh} : {onRefresh:()=>void})=>{
    // const {width, height} = useWindowDimensions();

  
    return(
    <View className='h-[120] items-center justify-center'>
      <Text className='text-2xl text-text-primary font-thin'>Something went wrong!</Text>
      <Pressable className={`h-[30%] w-[30%] bg-white items-center justify-center px-4 rounded-lg mt-4 active:opacity-70`} onPress={onRefresh}>
        <Text className='text-text-tertiary text-xl font-light'>Retry</Text>
      </Pressable>
    </View>
  )
}
