import { Stack } from 'expo-router';

export default function ParentOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: '#FFFBF5' },
      }}
    />
  );
}
