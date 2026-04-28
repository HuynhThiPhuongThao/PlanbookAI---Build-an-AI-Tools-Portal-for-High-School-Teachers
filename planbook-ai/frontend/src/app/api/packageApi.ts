import axiosClient from './axiosClient';

export interface PackageItem {
  id: number;
  name: string;
  price: number | string;
  durationDays: number;
  description?: string;
  active?: boolean;
}

export interface SubscriptionItem {
  id: number;
  userId: number;
  packageId: number;
  packageName: string;
  packagePrice?: number | string;
  startDate?: string;
  endDate?: string;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
}

export const getPackages = () =>
  axiosClient.get('/packages') as unknown as Promise<PackageItem[]>;

export const getMySubscriptions = () =>
  axiosClient.get('/subscriptions/my') as unknown as Promise<SubscriptionItem[]>;

/** Tạo subscription PENDING — trả về SubscriptionItem để lấy id */
export const subscribePackage = (packageId: number, paymentMethod: string) =>
  axiosClient.post('/subscriptions', { packageId, paymentMethod }) as unknown as Promise<SubscriptionItem>;

/** Giáo viên tự xác nhận đã thanh toán → subscription chuyển ACTIVE */
export const confirmPayment = (subscriptionId: number) =>
  axiosClient.post(`/subscriptions/${subscriptionId}/confirm-payment`) as unknown as Promise<SubscriptionItem>;

export const cancelSubscription = (subscriptionId: number) =>
  axiosClient.put(`/subscriptions/${subscriptionId}/cancel`) as unknown as Promise<SubscriptionItem>;

export const approveSubscription = (subscriptionId: number) =>
  axiosClient.put(`/subscriptions/${subscriptionId}/approve`) as unknown as Promise<SubscriptionItem>;

export const rejectSubscription = (subscriptionId: number) =>
  axiosClient.put(`/subscriptions/${subscriptionId}/reject`) as unknown as Promise<SubscriptionItem>;
