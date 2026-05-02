import { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { RegisterLessonSheet } from './_components/RegisterLessonSheet';

export default function ProfessorLayout() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = () => sheetRef.current?.expand();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
          },
          tabBarActiveTintColor: '#1A6B74',
          tabBarInactiveTintColor: '#94A3B8',
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }} />
        <Tabs.Screen name="students" options={{ title: 'Alunos', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text> }} />
        <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text> }} />
        <Tabs.Screen name="settings" options={{ title: 'Config', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text> }} />
        <Tabs.Screen name="financeiro" options={{ href: null }} />
      </Tabs>

      {/* FAB — flutuante sobre tab bar, bottom=88px */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 88 - 28 }]}
        onPress={openSheet}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <RegisterLessonSheet ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A6B74',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A6B74',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
