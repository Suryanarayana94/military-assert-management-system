import axios from 'axios';
import { demoApi } from '../data/demoApi.js';

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
const http = axios.create({ baseURL: baseURL || '/api' });
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinel-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const message = (error) => error.response?.data?.message || error.message || 'Request failed.';
const remote = async (method, url, data, config) => {
  try { return (await http.request({ method, url, data, ...config })).data; } catch (error) { throw new Error(message(error)); }
};
const isDemo = !baseURL;

export const api = {
  isDemo,
  login: (credentials) => isDemo ? demoApi.login(credentials) : remote('post', '/auth/login', credentials),
  reference: (user) => isDemo ? demoApi.reference(user) : remote('get', '/reference'),
  dashboard: (user, params) => isDemo ? demoApi.dashboard(user, params) : remote('get', '/dashboard', undefined, { params }),
  inventory: (user, params) => isDemo ? demoApi.inventory(user, params) : remote('get', '/assets', undefined, { params }),
  purchases: (user, params) => isDemo ? demoApi.purchases(user, params) : remote('get', '/purchases', undefined, { params }),
  createPurchase: (user, data) => isDemo ? demoApi.createPurchase(user, data) : remote('post', '/purchases', data),
  transfers: (user, params) => isDemo ? demoApi.transfers(user, params) : remote('get', '/transfers', undefined, { params }),
  createTransfer: (user, data) => isDemo ? demoApi.createTransfer(user, data) : remote('post', '/transfers', data),
  assignments: (user, params) => isDemo ? demoApi.assignments(user, params) : remote('get', '/assignments', undefined, { params }),
  createAssignment: (user, data) => isDemo ? demoApi.createAssignment(user, data) : remote('post', '/assignments', data),
  expenditures: (user, params) => isDemo ? demoApi.expenditures(user, params) : remote('get', '/expenditures', undefined, { params }),
  createExpenditure: (user, data) => isDemo ? demoApi.createExpenditure(user, data) : remote('post', '/expenditures', data),
  audit: (user) => isDemo ? demoApi.audit(user) : remote('get', '/audit-logs')
};
