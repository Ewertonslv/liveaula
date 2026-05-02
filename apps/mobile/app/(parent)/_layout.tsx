import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { SelectedChildProvider } from '@/contexts/SelectedChildContext';

export default function ParentLayout() {
  usePushNotifications();

  return (
    <SelectedChildProvider>
      <ParentTabs />
    </SelectedChildProvider>
  );
}

function ParentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFBF5',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#1A6B74',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontFamily: 'Nunito_600SemiBold',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: 'Assinatura',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="progresso" options={{ href: null }} />
      <Tabs.Screen name="lesson/[lessonId]" options={{ href: null }} />
    </Tabs>
  );
}
