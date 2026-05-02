import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { secureStorage } from '@/lib/secureStorage';

SplashScreen.preventAutoHideAsync();

const INVITE_PREFIX = 'liveaula://invite/';

function extractInviteToken(url: string): string | null {
  if (url.startsWith(INVITE_PREFIX)) {
    return url.slice(INVITE_PREFIX.length).split('?')[0] || null;
  }
  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'PlusJakartaSans_400Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
          'PlusJakartaSans_600SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
          'PlusJakartaSans_700Bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
          'Nunito_400Regular': require('../assets/fonts/Nunito-Regular.ttf'),
          'Nunito_600SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
          'Nunito_700Bold': require('../assets/fonts/Nunito-Bold.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    async function handleInviteUrl(url: string) {
      const token = extractInviteToken(url);
      if (!token) return;

      const role = await secureStorage.get('liveaula.userRole');
      if (role === 'PARENT') {
        router.replace('/(parent)/' as never);
      } else {
        router.push({
          pathname: '/(onboarding)/parent/step-1',
          params: { token },
        } as never);
      }
    }

    // Cold start: app opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleInviteUrl(url);
    });

    // Warm start: app already running when link is tapped
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleInviteUrl(url);
    });

    return () => subscription.remove();
  }, [isReady, router]);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
