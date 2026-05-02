import * as SecureStore from 'expo-secure-store';

type StorageKey =
  | 'liveaula.accessToken'
  | 'liveaula.refreshToken'
  | 'liveaula.userId'
  | 'liveaula.userRole'
  | 'liveaula.studentId'
  | 'liveaula.selected-child-id';

export const secureStorage = {
  async save(key: StorageKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async get(key: StorageKey): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async delete(key: StorageKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
