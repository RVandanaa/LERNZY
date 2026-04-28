import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack          from './AuthStack';
import TabNavigator       from './TabNavigator';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Auth flow */}
        <Stack.Screen name="Auth"         component={AuthStack} />

        {/* Onboarding — sits between auth and main app */}
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{ gestureEnabled: false }} // prevent swipe back to auth
        />

        {/* Main app — tabs */}
        <Stack.Screen
          name="MainApp"
          component={TabNavigator}
          options={{ gestureEnabled: false }} // prevent swipe back to onboarding
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}