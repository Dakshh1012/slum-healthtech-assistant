import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medibuddy"
        options={{
          title: 'MediBuddy',
          tabBarIcon: ({ color }) => <FontAwesome name="heartbeat" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai_therapist"
        options={{
          title: 'AI Therapist',
          tabBarIcon: ({ color }) => <FontAwesome name="comments" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <FontAwesome name="newspaper-o" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}