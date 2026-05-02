import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  lessonId: string | null;
}

interface NotificationsPage {
  data: Notification[];
  meta: { nextCursor: string | null; hasMore: boolean };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ontem';
  if (d < 7) return `${d} dias atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function loadPage(afterCursor: string | null = null, replace = false) {
    const params = new URLSearchParams({ limit: '20' });
    if (afterCursor) params.set('cursor', afterCursor);
    const page = await apiFetch<NotificationsPage>(`/me/notifications?${params}`);
    setItems((prev) => (replace ? page.data : [...prev, ...page.data]));
    setCursor(page.meta.nextCursor);
    setHasMore(page.meta.hasMore);
  }

  useEffect(() => {
    loadPage(null, true).finally(() => setLoading(false));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(null, true).catch(() => {});
    setRefreshing(false);
  }, []);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    await loadPage(cursor, false).catch(() => {});
    setLoadingMore(false);
  }, [hasMore, loadingMore, cursor]);

  async function handlePress(item: Notification) {
    // Marca como lida se necessário
    if (!item.readAt) {
      apiFetch(`/me/notifications/${item.id}/read`, { method: 'PATCH' }).catch(() => {});
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    }
    if (item.lessonId) {
      router.push(`/(parent)/lesson/${item.lessonId}` as never);
    }
  }

  function renderItem({ item }: { item: Notification }) {
    const unread = !item.readAt;
    return (
      <TouchableOpacity
        style={[styles.item, unread && styles.itemUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.75}
      >
        <View style={styles.itemLeft}>
          {unread && <View style={styles.dot} />}
          {!unread && <View style={styles.dotPlaceholder} />}
          <View style={styles.itemBody}>
            <Text style={[styles.itemTitle, unread && styles.itemTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemText} numberOfLines={2}>{item.body}</Text>
          </View>
        </View>
        <Text style={styles.itemTime}>{timeAgo(item.createdAt)}</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1A6B74" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Avisos</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A6B74" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>Nenhum aviso ainda.</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color="#1A6B74" />
            </View>
          ) : null
        }
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFBF5' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  pageTitle: {
    fontSize: 22, fontWeight: '700', color: '#0F172A',
    fontFamily: 'Nunito_700Bold', paddingHorizontal: 16,
    paddingTop: 20, paddingBottom: 12,
  },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFBF5',
  },
  itemUnread: { backgroundColor: '#EFF9FA' },
  itemLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 10 },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A6B74', marginTop: 5,
  },
  dotPlaceholder: { width: 8, height: 8, marginTop: 5 },
  itemBody: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, color: '#475569', fontFamily: 'Nunito_600SemiBold' },
  itemTitleUnread: { color: '#0F172A', fontFamily: 'Nunito_700Bold' },
  itemText: { fontSize: 13, color: '#64748B', lineHeight: 18, fontFamily: 'Nunito_400Regular' },
  itemTime: { fontSize: 11, color: '#94A3B8', fontFamily: 'Nunito_400Regular', marginTop: 2, marginLeft: 8 },
  empty: { alignItems: 'center', gap: 12, marginTop: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontFamily: 'Nunito_400Regular' },
  footer: { paddingVertical: 20, alignItems: 'center' },
});
