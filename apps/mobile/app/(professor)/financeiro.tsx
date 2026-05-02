import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch } from '@/lib/api';
import { colors, spacing } from '@/theme';

type SubscriptionStatus = 'NONE' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'SUSPENDED';

interface ParentRow {
  parentId: string;
  parentName: string;
  parentAvatarUrl: string | null;
  studentId: string;
  studentName: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  amountCents: number;
}

interface BillingResponse {
  professorPlanStatus: 'FREE' | 'PAID';
  paidParentsCount: number;
  paidParentsTarget: number;
  parents: ParentRow[];
}

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  NONE: 'SEM ASSINATURA',
  TRIAL: 'TRIAL',
  ACTIVE: 'ATIVO',
  PAST_DUE: 'INADIMPLENTE',
  CANCELLED: 'CANCELADO',
  SUSPENDED: 'SUSPENSO',
};

function statusStyle(s: SubscriptionStatus) {
  if (s === 'ACTIVE') return { bg: '#DCFCE7', fg: '#15803D' };
  if (s === 'TRIAL') return { bg: '#FEF3C7', fg: '#B45309' };
  if (s === 'PAST_DUE' || s === 'SUSPENDED') return { bg: '#FEE2E2', fg: '#B91C1C' };
  return { bg: '#F1F5F9', fg: '#64748B' };
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function bucket(p: ParentRow): 'paid' | 'pending' {
  if (p.subscriptionStatus === 'PAST_DUE' || p.subscriptionStatus === 'SUSPENDED' || p.subscriptionStatus === 'CANCELLED') {
    return 'pending';
  }
  return 'paid';
}

export default function FinanceiroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch<BillingResponse>('/me/billing/parents');
    setData(res);
  }, []);

  useEffect(() => {
    load().catch(() => setData(null)).finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load().catch(() => {});
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Não foi possível carregar.</Text>
        <TouchableOpacity onPress={() => { setLoading(true); load().finally(() => setLoading(false)); }}>
          <Text style={styles.retry}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const paid = data.parents.filter((p) => bucket(p) === 'paid');
  const pending = data.parents.filter((p) => bucket(p) === 'pending');
  const remainingForFree = Math.max(0, data.paidParentsTarget - data.paidParentsCount);
  const isFree = data.professorPlanStatus === 'FREE';
  const progressPct = Math.min(100, Math.round((data.paidParentsCount / data.paidParentsTarget) * 100));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Financeiro</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={[styles.statusCard, isFree ? styles.statusFree : styles.statusPaid]}>
          <Text style={styles.statusPlan}>
            Plano: {isFree ? 'GRÁTIS' : 'PAGO  R$ 49/mês'}
          </Text>
          <Text style={styles.statusProgress}>
            {data.paidParentsCount} de {data.paidParentsTarget} pais pagantes
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.statusHint}>
            {isFree
              ? 'Você está no plano grátis. Mantenha 5 pais ativos para continuar.'
              : remainingForFree === 0
                ? 'Você atingiu o critério. Recálculo no próximo ciclo.'
                : `Faltam ${remainingForFree} ${remainingForFree === 1 ? 'pai ativo' : 'pais ativos'} para você ficar grátis.`}
          </Text>
        </View>

        {data.parents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum pai vinculado ainda.</Text>
            <Text style={styles.emptyHint}>
              Convide pais a partir do perfil de cada aluno.
            </Text>
          </View>
        ) : (
          <>
            {paid.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pais pagantes</Text>
                {paid.map((p) => <ParentCard key={`${p.parentId}-${p.studentId}`} row={p} />)}
              </View>
            )}

            {pending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pendentes</Text>
                {pending.map((p) => <ParentCard key={`${p.parentId}-${p.studentId}`} row={p} />)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ParentCard({ row }: { row: ParentRow }) {
  const ss = statusStyle(row.subscriptionStatus);
  const trialDays = row.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(row.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;
  return (
    <View style={styles.parentCard}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={18} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.parentName}>{row.parentName}</Text>
        <Text style={styles.parentMeta}>filho: {row.studentName}</Text>
        <View style={styles.parentStatusRow}>
          <View style={[styles.badge, { backgroundColor: ss.bg }]}>
            <Text style={[styles.badgeText, { color: ss.fg }]}>
              {STATUS_LABEL[row.subscriptionStatus]}
              {trialDays !== null && row.subscriptionStatus === 'TRIAL'
                ? ` · expira em ${trialDays}d`
                : ''}
            </Text>
          </View>
          {row.subscriptionStatus === 'ACTIVE' && (
            <Text style={styles.parentAmount}>{formatCurrency(row.amountCents)}/mês</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceProfessor },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 18, color: colors.textDark },
  scroll: { padding: spacing.md, gap: spacing.lg, paddingBottom: 140 },
  statusCard: {
    padding: spacing.md, borderRadius: 12, borderWidth: 1, gap: spacing.sm,
  },
  statusPaid: { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' },
  statusFree: { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
  statusPlan: {
    fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16, color: colors.textDark,
  },
  statusProgress: {
    fontFamily: 'PlusJakartaSans_500Medium' as any, fontSize: 14, color: colors.textDark,
  },
  progressTrack: {
    height: 8, backgroundColor: '#FFFFFF', borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  statusHint: { fontSize: 13, color: colors.textMuted },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16, color: colors.textDark,
  },
  emptyState: {
    alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: colors.textDark,
  },
  emptyHint: { color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.lg },
  errorText: { color: colors.textDark, marginBottom: spacing.sm },
  retry: { color: colors.primary, fontFamily: 'PlusJakartaSans_600SemiBold' },
  parentCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceProfessor,
    alignItems: 'center', justifyContent: 'center',
  },
  parentName: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 15, color: colors.textDark },
  parentMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  parentStatusRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontFamily: 'PlusJakartaSans_600SemiBold', letterSpacing: 0.4 },
  parentAmount: { fontSize: 13, color: colors.textDark, fontFamily: 'PlusJakartaSans_500Medium' as any },
});
