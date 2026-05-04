

import React from 'react'
import { Tabs } from 'expo-router'
import MyTabBar from '../../components/TabBar'
import SafeScreen from '@/components/SafeScreen'

const TabLayout = () => {
    return (
        <SafeScreen>
            <Tabs tabBar={props => <MyTabBar {...props}/> } screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                options={{ title: 'Home' }}
                name='index' />
            {/* <Tabs.Screen
                options={{ title: 'Votes' }}
                name='votes' /> */}
            <Tabs.Screen
                options={{ title: 'Feed' }}
                name='feed' />
            <Tabs.Screen
                options={{ title: 'Profile' }}
                name='profile' />
        </Tabs>
        </SafeScreen>
    )
}

export default TabLayout