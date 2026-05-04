import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors, typography, spacing } from '../theme';

import HomeScreen     from '../screens/main/HomeScreen';
import LearnScreen    from '../screens/main/LearnScreen';
import CodeScreen     from '../screens/main/CodingLabScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import ProfileScreen  from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

 
const TAB_ICONS = {
  Home:     { active: '⌂', inactive: '⌂' },
  Learn:    { active: '◉', inactive: '○' },
  Code:     { active: '⟨⟩', inactive: '⟨⟩' },
  Progress: { active: '▲', inactive: '△' },
  Profile:  { active: '●', inactive: '○' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   colors.primaryContainer,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor:  colors.surfaceContainerLowest,
          borderTopColor:   colors.outlineVariant,
          borderTopWidth:   1,
          height:           64,
          paddingBottom:    spacing.sm,
          paddingTop:       spacing.xs,
        },
        tabBarLabelStyle: {
          ...typography.caption,
        },
        tabBarIcon: ({ color, focused }) => (
          <Text style={[{ color }, typography.titleSm]}>
            {focused
              ? TAB_ICONS[route.name].active
              : TAB_ICONS[route.name].inactive}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Learn"    component={LearnScreen} />
      <Tab.Screen name="Code"     component={CodeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}