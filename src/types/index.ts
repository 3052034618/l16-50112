export type UserRole = 'student' | 'runner' | 'admin';

export interface User {
  id: string;
  username: string;
  avatar: string;
  phone: string;
  studentId: string;
  role: UserRole;
  balance: number;
  isBanned: boolean;
  createdAt: string;
}

export type RunnerStatus = 'pending' | 'approved' | 'rejected';

export interface RunnerProfile {
  id: string;
  userId: string;
  realName: string;
  studentId: string;
  idCard: string;
  status: RunnerStatus;
  rating: number;
  completedOrders: number;
  successRate: number;
  applyTime: string;
  auditTime?: string;
  auditRemark?: string;
}

export type OrderType = 'express' | 'errand';
export type OrderStatus = 'pending' | 'accepted' | 'picked' | 'delivering' | 'completed' | 'cancelled' | 'disputed';

export interface Order {
  id: string;
  type: OrderType;
  title: string;
  description: string;
  pickupLocation: string;
  deliveryAddress: string;
  reward: number;
  status: OrderStatus;
  publisherId: string;
  runnerId?: string;
  expressSite?: string;
  expressNo?: string;
  pickupTime: string;
  distance?: number;
  createdAt: string;
  acceptedAt?: string;
  pickedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export type TransactionType = 'recharge' | 'withdraw' | 'payment' | 'income' | 'refund';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  orderId?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
}

export type DisputeStatus = 'pending' | 'resolved' | 'rejected';

export interface Dispute {
  id: string;
  orderId: string;
  complainantId: string;
  reason: string;
  status: DisputeStatus;
  result?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}
