import axios from 'axios';

const BASE_URL = 'https://backend-ledger-0ra6.onrender.com';

export const api = axios.create({ baseURL: BASE_URL });

// Redirect to login on 401/403 access denied
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.msg || '';
    if (status === 401 || (status === 403 && msg.includes('Access denied'))) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Dashboard
export const fetchDashboard = () => api.get('/api/admin/dashboard');

// User search
export const searchUser = (userId: string) => api.get(`/api/admin/user?userId=${userId}`);

// Transactions
export const fetchTransactions = (userId: string, page = 1, limit = 25) =>
  api.get(`/api/admin/transactions?userId=${userId}&page=${page}&limit=${limit}`);

// Deposits
export const fetchDepositsByUser = (userId: string, page = 1, limit = 25) =>
  api.get(`/api/admin/deposits?userId=${userId}&page=${page}&limit=${limit}`);

export const fetchDepositByOrder = (orderId: string) =>
  api.get(`/api/admin/deposits?orderId=${orderId}`);

// Approve Deposit
export const approveDeposit = (orderId: string) =>
  api.post('/api/admin/deposits/approve', { orderId });

// Agent Stats
export const fetchAgentStats = (userId: string, page = 1, limit = 50) =>
  api.get(`/api/admin/agent-stats?userId=${userId}&page=${page}&limit=${limit}`);

// Agent Config
export const fetchAgentConfig = () => api.get('/api/admin/agent-config');
export const updateAgentConfig = (comRates: number[]) =>
  api.put('/api/admin/agent-config', { comRates });

// Agent Daily
export const fetchAgentDaily = (userId: string, date?: string) => {
  const params = new URLSearchParams({ userId });
  if (date) params.set('date', date);
  return api.get(`/api/admin/agent-daily?${params.toString()}`);
};

// Agent Commissions (admin)
export const fetchAgentCommissions = (
  recUser: string,
  params?: { claim?: boolean; from?: string; to?: string; page?: number; limit?: number }
) => {
  const query = new URLSearchParams({ recUser });
  if (params?.claim !== undefined) query.set('claim', String(params.claim));
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return api.get(`/api/admin/agent/commissions?${query.toString()}`);
};

export const claimAgentCommission = (recUser: number, upTo?: string) =>
  api.post('/api/admin/agent/commissions/claim', { recUser, upTo });

// Admin Logs
export const fetchAdminLogs = (params?: { level?: 'info' | 'error'; since?: string; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.level) query.set('level', params.level);
  if (params?.since) query.set('since', params.since);
  if (params?.limit) query.set('limit', String(params.limit));
  return api.get(`/api/admin/logs?${query.toString()}`);
};
