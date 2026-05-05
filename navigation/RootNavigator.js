import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack          from './AuthStack';
import TabNavigator       from './TabNavigator';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import { navigationRef } from './navigationRef';
import useAuthStore from '../store/useAuthStore';
import { ONBOARDING_COMPLETE_KEY } from '../constants/onboarding';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [initialRouteName, setInitialRouteName] = useState('Auth');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await useAuthStore.getState().bootstrap();
      const onboarded = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      const loggedIn = useAuthStore.getState().isAuthenticated();

      let route = 'Auth';
      if (loggedIn) {
        route = onboarded === 'true' ? 'MainApp' : 'ProfileSetup';
      }

      if (!cancelled) {
        setInitialRouteName(route);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="MainApp"
          component={TabNavigator}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
