import { View, Text, ScrollView, Pressable, Alert,Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData } from '@/lib/storage'
import { useAuth } from '@/hooks/UseAuth';
import Ionicons from '@react-native-vector-icons/ionicons';


const ProfileScreen = () => {
  const [userEmail, setUserEmail] = useState<string | null>()
  const {myProfile,isLoadingProfile}=useAuth()
  const [showModal, setShowModal] = useState(false)

  useEffect(()=>{
    async function getEmail(){
      const {email} =await getUserData()
      setUserEmail(email)
    }
    getEmail()
  },[]);

  function handleSignout(choice:boolean){
    if(choice){
      //signout
      console.log("signout")
      setShowModal(false)
    }
    else{
      //stay
      console.log("abort")
      setShowModal(false)
    }
  }



  return (
    <View className='p-4 bg-background flex flex-1 '>
      <Pressable className='items-end p-2' onPress={()=>setShowModal(true)}>
        <Ionicons name='log-out-outline' size={28} color={"#FFFFFF"}/>
      </Pressable>
      {showModal && <Modal signOut={handleSignout}/>}
      <View className='items-center justify-center mt-6'>
        <Image 
          source={{uri:myProfile?.image || "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}} 
          style={{height:100, width:100, borderRadius:100, borderWidth:0.5, borderColor:"#FFFFFF"}}/>
        <Text className='text-text-primary text-4xl font-semibold mt-4'>{myProfile?.name ?? "prettyboi"}</Text>       
        <Text className='text-text-primary font-thin'>{userEmail ?? "xxx@email.com"}</Text>
      </View>
      
      <View className='rounded-xl bg-background-light flex flex-col h-[30%] mt-4'>

         {/* Profile Card */}
         <View className='flex-row h-[50%] bg-background-light/20 rounded-t-lg border-b-2 border-b-slate-900 px-4 items-center justify-evenly'>
           <View className='border border-red-400 w-16 h-16 rounded-full items-center justify-center'> 
             <Ionicons name='person' size={23} color={"#f87171"}/>
           </View>
           <View>
             <Text className='text-text-primary text-2xl'>Full Name</Text>
             <Text className='text-text-primary text-sm'>username</Text>
           </View>
           <Ionicons name='chevron-forward' size={42} color={"#FFFFFF"}/>
         </View>

         {/* Notifications Card */}
         <View className='flex-row h-[50%] bg-background-light/20 rounded-t-lg border-b-2 border-b-slate-900 px-4 items-center justify-evenly'>
           <View className='border border-green-300 w-16 h-16 rounded-full items-center justify-center'> 
             <Ionicons name='close' size={33} color={"#86efac"}/>
           </View>
           <View>
             <Text className='text-text-primary text-2xl'>Delete Profile</Text>
           </View>
           <Ionicons name='chevron-forward' size={42} color={"#FFFFFF"}/>
         </View>

       </View>



    </View>
  )
}

export default ProfileScreen

function Modal({signOut}:{signOut:(choice:boolean)=>void}){
  return(
    <View className='absolute bg-gray-900 h-48 w-[80%] z-50 my-36 rounded-xl items-center justify-center gap-8 self-center'>
      <Text className='text-xl text-text-primary'>Logout of your account?</Text>
      <View className='flex-row px-12 gap2'>
        <Pressable 
          onPress={()=>signOut(false)}
          className='bg-text-primary rounded-l-lg h-12 w-[50%] justify-center items-center font-bold'>
          <Text className='text-xl'>cancel</Text>
        </Pressable>
        <Pressable 
        onPress={()=>signOut(true)}
        className='bg-black rounded-r-lg h-12 w-[50%] justify-center items-center font-bold'>
          <Text className='text-xl text-text-primary '>logout</Text>
        </Pressable>
        <Pressable></Pressable>
      </View>
    </View>
  )
}


      // Cards for LATER
      