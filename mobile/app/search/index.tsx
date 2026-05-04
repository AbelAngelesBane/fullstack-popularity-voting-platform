import { View, Text, ScrollView, Pressable, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Ionicons from '@react-native-vector-icons/ionicons'
import { router } from 'expo-router'

// enum SearchFilter {
//   ALL, 
//   ACTIVE, 
//   COMPLETED
// }

const ExplorePollsScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string | null>()
  //Later: Implement in the backend
  // const [searchFilter, setSearchFilter] = useState<SearchFilter>(SearchFilter.ALL)

  useEffect(()=>{
    setTimeout(()=>{
      
    },500)
  },[searchQuery])


  return (
    <ScrollView className='flex-1 p-4 bg-background' contentContainerStyle={{paddingBottom:140}} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}

    <View className='flex-row w-full items-center gap-2'> 
      <Pressable className='' onPress={()=>router.back()}>  
        <Ionicons name='arrow-back' color={"#FFFFFF"} size={32}/>
      </Pressable>
      
      <TextInput
        inputMode='email'
        placeholder='Search'
        placeholderTextColor="rgba(255,255,255,0.4)"
        className='flex-1 h-12 bg-slate-600/20 p-4 rounded-full' 
      />
    </View>


    </ScrollView>
  )
}

export default ExplorePollsScreen