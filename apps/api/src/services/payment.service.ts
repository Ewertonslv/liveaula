import axios from 'axios';

const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://api-sandbox.asaas.com/v3';

const asaas = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'access_token': process.env.ASAAS_API_KEY || '',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const paymentService = {
  async createCustomer(data: { name: string; email: string; cpfCnpj?: string }) {
    const response = await asaas.post('/customers', data);
    return response.data as { id: string };
  },

  async createSubscription(data: {
    customer: string;
    billingType: 'CREDIT_CARD';
    value: number;
    nextDueDate: string; // YYYY-MM-DD
    cycle: 'MONTHLY';
    description?: string;
  }) {
    const response = await asaas.post('/subscriptions', data);
    return response.data as { id: string; status: string };
  },

  async cancelSubscription(externalSubscriptionId: string) {
    const response = await asaas.delete(`/subscriptions/${externalSubscriptionId}`);
    return response.data;
  },
};
