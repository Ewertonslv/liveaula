export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'SUSPENDED';
export interface Payment { id: string; amountCents: number; status: string; paidAt: string | null; failureReason: string | null; createdAt: string }
export interface Subscription {
  id: string; status: SubscriptionStatus; trialEndsAt: string | null;
  currentPeriodEnd: string | null; cancelledAt: string | null; createdAt: string; payments: Payment[];
}
