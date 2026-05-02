import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Subscription } from '@liveaula/shared';
import { apiFetch } from '@/lib/api';
import { TrialCountdown } from './_components/TrialCountdown';
import { PaymentWebView } from './_components/PaymentWebView';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [webViewVisible, setWebViewVisible] = useState(false);

  async function load() {
    try {
      const data = await apiFetch<Subscription>('/subscription');
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading && subscription?.status === 'PAST_DUE') {
      Alert.alert(
        'Pagamento pendente',
        'Seu pagamento está pendente. Regularize para continuar usando o serviço.',
        [{ text: 'Ok' }]
      );
    }
  }, [loading, subscription?.status]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1A6B74" />
      </View>
    );
  }

  const status = subscription?.status ?? 'NONE';

  function renderContent() {
    switch (status) {
      case 'TRIAL':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Período de avaliação</Text>
            {subscription?.trialEndsAt ? (
              <TrialCountdown trialEndsAt={subscription.trialEndsAt} />
            ) : null}
            <Text style={styles.subtitleText}>R$79/mês após o trial</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setWebViewVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Assinar agora"
            >
              <Text style={styles.primaryButtonText}>Assinar agora</Text>
            </TouchableOpacity>
          </View>
        );

      case 'ACTIVE':
        return (
          <View style={styles.section}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>✓ Assinatura ativa</Text>
            </View>
            {subscription?.currentPeriodEnd ? (
              <Text style={styles.subtitleText}>
                Próxima cobrança:{' '}
                {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}
              </Text>
            ) : null}
            {subscription?.payments && subscription.payments.length > 0 ? (
              <View style={styles.paymentsSection}>
                <Text style={styles.paymentsTitle}>Últimos pagamentos</Text>
                {subscription.payments.slice(0, 5).map((p) => (
                  <View key={p.id} style={styles.paymentRow}>
                    <Text style={styles.paymentDate}>
                      {p.paidAt ? format(new Date(p.paidAt), 'dd/MM/yyyy') : '—'}
                    </Text>
                    <Text style={styles.paymentAmount}>
                      R${(p.amountCents / 100).toFixed(2).replace('.', ',')}
                    </Text>
                    <View
                      style={[
                        styles.paymentStatusBadge,
                        p.status === 'PAID' ? styles.paidBadge : styles.failedBadge,
                      ]}
                    >
                      <Text style={styles.paymentStatusText}>
                        {p.status === 'PAID' ? 'Pago' : p.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );

      case 'PAST_DUE':
        return (
          <View style={styles.section}>
            <Text style={styles.urgencyTitle}>Pagamento pendente</Text>
            <Text style={styles.subtitleText}>
              Regularize sua assinatura para continuar acompanhando as aulas.
            </Text>
            <TouchableOpacity
              style={styles.urgencyButton}
              onPress={() => setWebViewVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Tentar novamente"
            >
              <Text style={styles.primaryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        );

      case 'CANCELLED':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assinatura cancelada</Text>
            <Text style={styles.subtitleText}>
              Reative sua assinatura para acompanhar as aulas do seu filho.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setWebViewVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Reativar assinatura"
            >
              <Text style={styles.primaryButtonText}>Reativar</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        // NONE or no subscription
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acompanhe as aulas do seu filho</Text>
            <Text style={styles.subtitleText}>
              Receba notificações em tempo real e acesse o histórico completo de aulas.
            </Text>
            <Text style={styles.priceText}>R$79/mês</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setWebViewVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Assinar por R$79/mês"
            >
              <Text style={styles.primaryButtonText}>Assinar por R$79/mês</Text>
            </TouchableOpacity>
          </View>
        );
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Assinatura</Text>
      {renderContent()}

      <PaymentWebView
        visible={webViewVisible}
        onClose={() => setWebViewVisible(false)}
        onSuccess={() => {
          setWebViewVisible(false);
          load();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#0F172A',
  },
  section: {
    gap: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  priceText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#1A6B74',
  },
  primaryButton: {
    backgroundColor: '#1A6B74',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 52,
    alignSelf: 'stretch',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  urgencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#D95F3B',
    textAlign: 'center',
  },
  urgencyButton: {
    backgroundColor: '#D95F3B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minHeight: 52,
    alignSelf: 'stretch',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  activeBadgeText: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  paymentsSection: {
    alignSelf: 'stretch',
    gap: 8,
  },
  paymentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  paymentDate: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontFamily: 'Nunito_400Regular',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#0F172A',
  },
  paymentStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
  },
  failedBadge: {
    backgroundColor: '#FEE2E2',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#374151',
  },
});
