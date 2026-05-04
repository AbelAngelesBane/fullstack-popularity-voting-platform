import { View, Text, Pressable, Image, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { getUserData } from '@/lib/storage'
import { useAuth } from '@/hooks/UseAuth';
import Ionicons from '@react-native-vector-icons/ionicons';
import SafeScreen from '@/components/SafeScreen';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { AxiosError } from 'axios';


const ProfileScreen = () => {
  const [userEmail, setUserEmail] = useState<string | null>()
  const [userName, setUserName] = useState<string | null>()
  const { myProfile, isLoadingProfile, logout, isLoggingOut } = useAuth()
  const [showSignout, setShowSignout] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    async function getEmail() {
      const { email, } = await getUserData()
      setUserEmail(email)
      setUserName(myProfile?.name)
    }
    getEmail()
  }, [myProfile]);

  function handleSignout(choice: boolean) {
    if (choice) {
      logout.mutateAsync();
      setShowSignout(false)
      return
    }
    setShowSignout(false)
  }

  return (
    <View className='p-4 bg-background flex flex-1 '>
      <Pressable className='items-end p-2 active:opacity-70' onPress={() => setShowSignout(true)}>
        <Ionicons name='log-out-outline' size={28} color={"#FFFFFF"} />
      </Pressable>

      {showSignout && <ModalSignOut signOut={handleSignout} isLoggingOut={isLoggingOut} />}

      {/* Modal for Username Change */}
      <ModalProfile
        currentImage={myProfile?.image || "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
        visibility={showUpdate}
        onClose={() => setShowUpdate(false)}
        currentName={myProfile?.name ?? ""}
      />

      {/* Profile Information */}
      <View className='items-center justify-center mt-6'>
        <Image
          source={{ uri: myProfile?.image || "https://images.unsplash.com/photo-1728577740843-5f29c7586afe?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
          style={{ height: 100, width: 100, borderRadius: 100, borderWidth: 0.5, borderColor: "#FFFFFF" }} />
        <Text className='text-text-primary text-4xl font-semibold mt-4'>{myProfile?.name ?? "User"}</Text>
        <Text className='text-text-primary font-thin'>{userEmail ?? "xxx@email.com"}</Text>
      </View>

      <View className='rounded-xl bg-background-light h-[40%] mt-8 overflow-hidden'>
        {/* Profile Change Card */}
        <Pressable
          disabled={isLoadingProfile}
          onPress={() => setShowUpdate(true)}
          className='flex-row h-[33%] bg-background-light px-4 items-center justify-between border-b border-slate-800 active:opacity-70'>
          <View className='flex-row items-center gap-4'>
            <View className='border border-blue-400 w-12 h-12 rounded-full items-center justify-center'>
              <Ionicons name='person' size={20} color={"#60a5fa"} />
            </View>
            <View>
              <Text className='text-text-primary text-xl'>Edit Profile</Text>
              <Text className='text-text-secondary text-xs'>Change username</Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={24} color={"#FFFFFF"} />
        </Pressable>

        {/* MyVotes Card */}
        <Pressable
          onPress={() => router.push("/myvotes")}
          className='flex-row h-[33%] bg-background-light px-4 items-center justify-between border-b border-slate-800 active:opacity-70'>
          <View className='flex-row items-center gap-4'>
            <View className='border border-green-300 w-12 h-12 rounded-full items-center justify-center'>
              <Ionicons name='stats-chart' size={20} color={"#86efac"} />
            </View>
            <Text className='text-text-primary text-xl'>My Votes</Text>
          </View>
          <Ionicons name='chevron-forward' size={24} color={"#FFFFFF"} />
        </Pressable>

        {/* Delete Profile Card */}
        <Pressable className='flex-row h-[34%] bg-background-light px-4 items-center justify-between active:bg-red-100/40' >
          <View className='flex-row items-center gap-4'>
            <View className='border border-red-400 w-12 h-12 rounded-full items-center justify-center'>
              <Ionicons name='close' size={20} color={"#f87171"} />
            </View>
            <Text className='text-text-primary text-xl'>Delete Profile</Text>
          </View>
          <Ionicons name='chevron-forward' size={24} color={"#FFFFFF"} />
        </Pressable>
      </View>
    </View>
  )
}

function ModalProfile({ visibility, onClose, currentName, currentImage }: { visibility: boolean, onClose: () => void, currentName: string, currentImage: string }) {
  const [newName, setNewName] = useState(currentName);
  const { isUpdatingProfile, updateProfileMutation } = useAuth();
  const [error, setError] = useState<string | null>()
  const [selectedAvatar, setSelectedAvatar] = useState(currentImage);
  const avatarSeeds = useMemo(() => ["Abel", "Felix", "Jasper", "Luna", "Milo", "Zoe", "Oscar", "Ruby", "Coco", "Sparky", "Gaga", "Beyonce", "Andres", "Madonna", "Cece", "Harold", "Cecilia", "Wong", "Xixi"], []);

  const handleSave = () => {
    setError(null)
    if (newName.trim() === "" || (newName === currentName && selectedAvatar === currentImage)) return;

    updateProfileMutation.mutate(
      { name: newName, image: selectedAvatar },
      {
        onSuccess: () => {
          toast.success("Profile updated.")
          onClose();
        }, onError: (err) => {
          const axiosError = (err as AxiosError<{ error: string; message: string; }>);
          if (axiosError.response?.status === 422) setError("Username unavailable!")
        }

      }
    );
  };

  useEffect(() => {
    setError(null)
    if (visibility) {
      setNewName(currentName);
      setSelectedAvatar(currentImage);
    }
  }, [visibility, currentName, currentImage]);

  return (
    <Modal animationType="slide" transparent visible={visibility} statusBarTranslucent onRequestClose={onClose}>
      <View className='flex-1 bg-background'>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <SafeScreen>
            <View className='px-6 py-5 border-b border-slate-800 flex-row items-center justify-between'>
              <Text className='text-text-primary text-2xl font-bold'>Edit Profile</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name='close' size={28} color={"#FFFFFF"} />
              </TouchableOpacity>
            </View>

            <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 50 }}>
              <View className='p-6'>
                {/* Image Picker and POreview */}
                <View className='items-center mb-6'>
                  <Image
                    source={{ uri: selectedAvatar }}
                    style={{ height: 120, width: 120, borderRadius: 60, borderWidth: 2, borderColor: "#60a5fa" }}
                  />
                  <Text className='text-text-secondary mt-2 text-xs'>Preview</Text>
                </View>

                <Text className='text-text-secondary font-semibold mb-3 ml-1'>Choose Avatar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className='mb-8'>
                  {avatarSeeds.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`;
                    const isSelected = selectedAvatar === url;
                    return (
                      <TouchableOpacity
                        key={seed}
                        onPress={() => setSelectedAvatar(url)}
                        className={`mr-4 p-1 rounded-full border-2 ${isSelected ? 'border-blue-400' : 'border-transparent'}`}
                      >
                        <Image source={{ uri: url }} style={{ height: 60, width: 60, borderRadius: 30 }} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Input for Full Name */}
                <View className='mb-8'>
                  <Text className='text-text-secondary font-semibold mb-2 ml-1'>Full Name</Text>
                  <TextInput
                    className='bg-background-light text-text-primary p-4 rounded-2xl text-lg border border-slate-700 focus:border-blue-400'
                    placeholder='Enter full name...'
                    placeholderTextColor={"#666"}
                    value={newName}
                    onChangeText={setNewName}
                  />
                  {error && <Text className='text-red-600 mt-2'>{error}</Text>}
                </View>

                <TouchableOpacity
                  className='bg-white rounded-2xl py-4 items-center shadow-lg'
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={isUpdatingProfile || (newName === currentName && selectedAvatar === currentImage)}>
                  {isUpdatingProfile ? (
                    <ActivityIndicator size={"small"} color={"#121212"} />
                  ) : (
                    <Text className='text-background font-bold text-lg'>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeScreen>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

function ModalSignOut({ signOut, isLoggingOut }: { signOut: (choice: boolean) => void, isLoggingOut: boolean }) {
  return (
    <View className='absolute bg-gray-900 h-48 w-[85%] z-50 my-36 rounded-2xl items-center justify-center gap-8 self-center border border-slate-700 shadow-2xl'>
      <Text className='text-xl text-text-primary font-medium'>Logout of your account?</Text>
      <View className='flex-row px-6 gap-4'>
        {isLoggingOut ? <ActivityIndicator size={22} color={"#FFFFFF"} /> :
          <>
            <Pressable
              onPress={() => signOut(false)}
              className='bg-slate-700 rounded-xl h-12 flex-1 justify-center items-center active:opacity-70'>
              <Text className='text-text-primary text-lg'>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => signOut(true)}
              className='bg-red-500 rounded-xl h-12 flex-1 justify-center items-center active:opacity-70'>
              <Text className='text-white text-lg font-bold'>Logout</Text>
            </Pressable>
          </>
        }

      </View>
    </View>
  )
}

export default ProfileScreen;