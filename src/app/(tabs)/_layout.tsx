import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { TabBar } from '../../components/TabBar';

const HIDDEN_HEADER = { headerShown: false } as const;

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        ...HIDDEN_HEADER,
        tabBarLabelPosition: 'below-icon',
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dziś' }} />
      <Tabs.Screen name="breath" options={{ title: 'Oddech' }} />
      <Tabs.Screen name="progress" options={{ title: 'Postęp' }} />
    </Tabs>
  );
}
