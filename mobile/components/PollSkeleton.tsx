import { View } from 'react-native'
import { Skeleton } from 'moti/skeleton'

export const PollSkeleton = () => {
  return (
    <View className='flex flex-row h-18 w-full bg-background-light rounded-xl mt-2 p-2 gap-2 items-center'>
      
      <Skeleton colorMode="dark" radius="round" height={48} width={48} />

      <View className='flex-1 gap-2'>
        <Skeleton colorMode="dark" width={'80%'} height={20} />
        
        <Skeleton colorMode="dark" width={'40%'} height={12} />
      </View>
    </View>
  )
}

export const FeaturedPollSkeleton=()=>{

    return (
    <View className='flex fle flex-col h-36 w-full bg-background-light rounded-xl mt-2 items-center'>
        
        <Skeleton colorMode="dark" width={'100%'} height={'85%'} />
    </View>)
}