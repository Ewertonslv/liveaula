import { useEffect } from 'react';
import { router } from 'expo-router';
import { secureStorage } from '@/lib/secureStorage';

export default function Index() {
  useEffect(() => {
    async function checkAuth() {
      const token = await secureStorage.get('liveaula.accessToken');
      const role = await secureStorage.get('liveaula.userRole');
      if (!token) {
        router.replace('/(auth)/login');
      } else if (role === 'PROFESSOR') {
        router.replace('/(professor)/' as never);
      } else if (role === 'PARENT') {
        router.replace('/(parent)/' as never);
      } else {
        router.replace('/(auth)/login');
      }
    }
    checkAuth();
  }, []);
  return null;
}
