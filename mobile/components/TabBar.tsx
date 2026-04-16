import { LayoutChangeEvent, View, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from './TabBarButton';
import { useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');



  const TAB_BAR_MARGIN = 70;
  const containerWidth = screenWidth - (TAB_BAR_MARGIN * 2);


export default function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({height:0, width:0});
  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e:LayoutChangeEvent)=>{
    setDimensions({
      height:e.nativeEvent.layout.height,
      width:e.nativeEvent.layout.width
    })
  }

  const tabPositionx = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(()=>{
    return {
      transform:[{translateX:tabPositionx.value}]
    }
  })
  return (
    <View className='bg-background-light' onLayout={onTabbarLayout} style={{ 
                flexDirection: 'row',  
                borderWidth:1,
                bottom:50,
                position: 'absolute', 
                alignItems:'center', 
                justifyContent:'space-between', 
                borderRadius:35,
                paddingVertical:15,
                marginHorizontal:18,
                shadowColor:"#000000",
                shadowOffset:{width:0, height:12},
                shadowRadius:10,
                shadowOpacity:0.1,
                elevation: 12, //Elevation for androiud, shadow for ios
                 }}>
    <Animated.View style={[animatedStyle, {
        position: 'absolute',
        backgroundColor: "#00098D",
        borderRadius: 180,
        height: dimensions.height - 20, 
        width: buttonWidth - 20,       
        marginHorizontal: 10,
    }]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          // tabPositionx.value = withSpring(buttonWidth * index, { damping: 20 });
          tabPositionx.value = withSpring(buttonWidth * index, {
            damping: 15,    
            stiffness: 150, 
            mass: 0.5,})
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? "#673ab7" : "#222"}
            label={label.toString()}
            />
        );
      })}
    </View>
  );
}

