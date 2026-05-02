import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LessonListItem, CursorPage } from '@liveaula/shared';
import { apiFetch } from '@/lib/api';
import { LessonFeedCard } from './_components/LessonFeedCard';
import { InAppNotificationBanner } from './_components/InAppNotificationBanner';
import { ChildSwitcher } from '@/components/ChildSwitcher';
import { FilterBar, type FilterValue } from '@/components/FilterBar';
import { useSelectedChild } from '@/contexts/SelectedChildContext';
import { colors } from '@/theme';

interface BannerState {
  title: string;
  body: string;
}

const DEFAULT_FILTERS: FilterValue = { period: '30d', subjectIds: [] };

function periodToFromIso(period: FilterValue['period'], custom?: { from?: string; to?: string }) {
  if (period === 'custom') return custom?.from;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

export default function ParentFeed() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedChildId, selectChild, children, loading: childLoading } = useSelectedChild();

  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [filters, setFilters] = useState<FilterValue>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterValue>(DEFAULT_FILTERS);
  const [availableSubjects, setAvailableSubjects] = useState<{ id: string; name: string }[]>([]);

  const lastFetchKey = useRef<string>('');

  // Carrega matérias disponíveis (uma vez)
  useEffect(() => {
    apiFetch<{ id: string; name: string }[]>('/subjects').catch(() => [] as any).then((s) => {
      if (Array.isArray(s)) setAvailableSubjects(s);
    });
  }, []);

  // Recarrega feed quando muda filho ou filtros
  const fetchLessons = useCallback(async (afterCursor: string | null, replace: boolean) => {
    if (!selectedChildId) return;
    const params = new URLSearchParams({ limit: '10' });
    if (afterCursor) params.set('cursor', afterCursor);
    const from = periodToFromIso(filters.period, filters);
    if (from) params.set('from', from);
    if (filters.to) params.set('to', filters.to);
    for (const sid of filters.subjectIds) params.append('subjectIds', sid);

    const page = await apiFetch<CursorPage<LessonListItem>>(
      `/lessons/student/${selectedChildId}?${params.toString()}`,
    );
    setLessons((prev) => (replace ? page.data : [...prev, ...page.data]));
    setCursor(page.meta.nextCursor);
    setHasMore(page.meta.hasMore);
  }, [selectedChildId, filters]);

  useEffect(() => {
    const key = `${selectedChildId}:${filters.period}:${filters.subjectIds.join(',')}:${filters.from ?? ''}:${filters.to ?? ''}`;
    if (key === lastFetchKey.current) return;
    lastFetchKey.current = key;
    if (!selectedChildId) { setLoading(false); return; }
    setLoading(true);
    fetchLessons(null, true).finally(() => setLoading(false));
  }, [selectedChildId, filters, fetchLessons]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchLessons(null, true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLessons]);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      await fetchLessons(cursor, false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, cursor, fetchLessons]);

  useEffect(() => {
    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title ?? '';
      const body = notification.request.content.body ?? '';
      setBanner({ title, body });
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const lessonId = response.notification.request.content.data?.lessonId;
      if (lessonId) router.push(`/(parent)/lesson/${lessonId}` as never);
    });
    return () => {
      Notifications.removeNotificationSubscription(foregroundSub);
      Notifications.removeNotificationSubscription(responseSub);
    };
  }, [router]);

  const filtersActiveCount =
    (filters.period !== '30d' ? 1 : 0) + (filters.subjectIds.length > 0 ? 1 : 0);

  const child = children.find((c) => c.id === selectedChildId);
  const studentName = child?.name ?? '';

  // Irregularity detection: most recent lesson > 7 days ago
  const lastLessonAt = lessons[0]?.createdAt ?? null;
  const daysSinceLast = lastLessonAt
    ? Math.floor((Date.now() - new Date(lastLessonAt).getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const showIrregularity = daysSinceLast !== null && daysSinceLast >= 7 && filtersActiveCount === 0;

  // Month counter
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthLessons = lessons.filter((l) => new Date(l.createdAt) >= monthStart);
  const monthCount = monthLessons.length;
  const monthMinutes = monthLessons.reduce((s, l) => s + l.durationMin, 0);
  const monthHours = Math.round((monthMinutes / 60) * 10) / 10;
  const pendingCount = monthLessons.filter((l) => !l.confirmedByParentAt).length;
  const monthsPt = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const monthLabel = monthsPt[new Date().getMonth()];

  function renderItem({ item, index }: { item: LessonListItem; index: number }) {
    return <LessonFeedCard lesson={item} index={index} />;
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyText}>
          {filtersActiveCount > 0
            ? 'Nenhuma aula encontrada com esses filtros.'
            : 'Ainda não há aulas registradas. Seu professor receberá uma notificação para começar.'}
        </Text>
        {filtersActiveCount > 0 && (
          <TouchableOpacity onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text style={styles.clearLink}>Limpar filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderFooter() {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {banner && (
        <InAppNotificationBanner
          title={banner.title}
          body={banner.body}
          onDismiss={() => setBanner(null)}
        />
      )}

      {loading || childLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlashList
          data={lessons}
          renderItem={renderItem}
          estimatedItemSize={180}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <View>
              <ChildSwitcher
                children={children.map((c) => ({
                  studentId: c.id,
                  name: c.name,
                  gradeLevel: c.gradeLevel,
                }))}
                selectedChildId={selectedChildId}
                onSelect={(id) => selectChild(id)}
                onAddChild={() => router.push('/invite/add-child' as never)}
              />
              <View style={styles.headerSection}>
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>
                    {studentName ? studentName[0].toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>
                    Aulas de {studentName || 'seu filho(a)'}
                  </Text>
                  {monthCount > 0 && (
                    <Text style={styles.headerSubtitle}>
                      {monthCount} {monthCount === 1 ? 'aula' : 'aulas'} em {monthLabel}
                      {monthHours > 0 ? ` · ${monthHours.toString().replace('.', ',')}h` : ''}
                      {pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : ''}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.iconBtn}
                  hitSlop={8}
                  onPress={() => router.push('/(parent)/progresso' as never)}
                >
                  <Ionicons name="bar-chart" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  hitSlop={8}
                  onPress={() => { setDraftFilters(filters); setFiltersOpen(true); }}
                >
                  <Ionicons name="filter" size={20} color={colors.primary} />
                  {filtersActiveCount > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>{filtersActiveCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {filtersActiveCount > 0 && (
                <View style={styles.filterBanner}>
                  <Text style={styles.filterBannerText}>
                    Mostrando {lessons.length}{hasMore ? '+' : ''} aula{lessons.length === 1 ? '' : 's'}
                    {filters.period !== '30d' ? ` · ${filters.period}` : ''}
                    {filters.subjectIds.length > 0 ? ` · ${filters.subjectIds.length} matéria(s)` : ''}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters(DEFAULT_FILTERS)} hitSlop={8}>
                    <Text style={styles.clearLink}>× Limpar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showIrregularity && (
                <View style={styles.irregularityBanner}>
                  <Text style={styles.irregularityIcon}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.irregularityTitle}>
                      Sem aulas há {daysSinceLast} dias
                    </Text>
                    <Text style={styles.irregularityText}>
                      Se isso é estranho pra você, vale conversar com o professor.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FilterBar
        visible={filtersOpen}
        onDismiss={() => setFiltersOpen(false)}
        initial={draftFilters}
        availableSubjects={availableSubjects}
        onApply={(f) => setFilters(f)}
        resultCount={lessons.length}
        onDraftChange={setDraftFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFBF5' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 24 },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A6B74', alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#fff', fontSize: 18, fontWeight: '700', fontFamily: 'Nunito_700Bold',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: '#0F172A',
    fontFamily: 'Nunito_700Bold',
  },
  headerSubtitle: {
    fontSize: 12, color: '#78716C',
    fontFamily: 'Nunito_400Regular', marginTop: 2,
  },
  irregularityBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#FEF3C7', borderColor: '#FCD34D', borderWidth: 1,
    borderRadius: 12, padding: 12, marginHorizontal: 16, marginTop: 12,
  },
  irregularityIcon: { fontSize: 18 },
  irregularityTitle: {
    fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#92400E',
  },
  irregularityText: {
    fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#78350F',
    marginTop: 2, lineHeight: 17,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border,
  },
  filterBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: colors.primary, borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  filterBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  filterBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.primaryMuted, borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filterBannerText: { fontSize: 13, color: colors.textDark, flex: 1 },
  clearLink: {
    color: colors.primary,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingTop: 64, gap: 16,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontSize: 16, color: '#64748B',
    textAlign: 'center', lineHeight: 24, fontFamily: 'Nunito_400Regular',
  },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
});
