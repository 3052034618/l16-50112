import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Order, RunnerProfile, Review, Transaction, Dispute, OrderType, OrderStatus } from '../types';
import { mockUsers, mockOrders, mockRunnerProfiles, mockReviews, mockTransactions, mockDisputes } from '../mock';
import { generateId } from '../utils';

interface AppState {
  currentUser: User | null;
  users: User[];
  orders: Order[];
  runnerProfiles: RunnerProfile[];
  reviews: Review[];
  transactions: Transaction[];
  disputes: Dispute[];

  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: 'student' | 'runner') => void;

  publishOrder: (order: Omit<Order, 'id' | 'status' | 'publisherId' | 'createdAt'>) => void;
  acceptOrder: (orderId: string, runnerId: string) => void;
  pickOrder: (orderId: string) => void;
  deliverOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;

  applyRunner: (data: { userId: string; realName: string; studentId: string; idCard: string }) => void;
  approveRunner: (profileId: string) => void;
  rejectRunner: (profileId: string, remark: string) => void;

  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;

  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;

  createDispute: (dispute: Omit<Dispute, 'id' | 'status' | 'createdAt'>) => void;
  resolveDispute: (disputeId: string, result: string, refund: boolean) => void;

  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;

  getOrderById: (id: string) => Order | undefined;
  getOrdersByPublisher: (publisherId: string) => Order[];
  getOrdersByRunner: (runnerId: string) => Order[];
  getRunnerProfile: (userId: string) => RunnerProfile | undefined;
  getReviewsForUser: (userId: string) => Review[];
  getTransactionsForUser: (userId: string) => Transaction[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      orders: mockOrders,
      runnerProfiles: mockRunnerProfiles,
      reviews: mockReviews,
      transactions: mockTransactions,
      disputes: mockDisputes,

      login: (userId: string) => {
        const user = get().users.find(u => u.id === userId);
        if (user && !user.isBanned) {
          set({ currentUser: user });
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchRole: (role: 'student' | 'runner') => {
        const { currentUser, users } = get();
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, role };
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        set({ currentUser: updatedUser, users: updatedUsers });
      },

      publishOrder: (orderData) => {
        const { currentUser, orders, transactions, users } = get();
        if (!currentUser) return;

        if (currentUser.balance < orderData.reward) {
          alert('余额不足，请先充值');
          return;
        }

        const newOrder: Order = {
          ...orderData,
          id: generateId(),
          status: 'pending',
          publisherId: currentUser.id,
          createdAt: new Date().toISOString(),
        };

        const newTxn: Transaction = {
          id: generateId(),
          userId: currentUser.id,
          orderId: newOrder.id,
          type: 'payment',
          amount: orderData.reward,
          status: 'success',
          description: `支付${orderData.type === 'express' ? '代取快递' : '跑腿'}费用`,
          createdAt: new Date().toISOString(),
        };

        const updatedUser = { ...currentUser, balance: currentUser.balance - orderData.reward };
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);

        set({
          orders: [newOrder, ...orders],
          transactions: [newTxn, ...transactions],
          currentUser: updatedUser,
          users: updatedUsers,
        });
      },

      acceptOrder: (orderId: string, runnerId: string) => {
        const { orders } = get();
        const updatedOrders = orders.map(o => {
          if (o.id === orderId && o.status === 'pending') {
            return {
              ...o,
              status: 'accepted' as OrderStatus,
              runnerId,
              acceptedAt: new Date().toISOString(),
            };
          }
          return o;
        });
        set({ orders: updatedOrders });
      },

      pickOrder: (orderId: string) => {
        const { orders } = get();
        const updatedOrders = orders.map(o => {
          if (o.id === orderId && o.status === 'accepted') {
            return {
              ...o,
              status: 'picked' as OrderStatus,
              pickedAt: new Date().toISOString(),
            };
          }
          return o;
        });
        set({ orders: updatedOrders });
      },

      deliverOrder: (orderId: string) => {
        const { orders } = get();
        const updatedOrders = orders.map(o => {
          if (o.id === orderId && (o.status === 'picked' || o.status === 'accepted')) {
            return {
              ...o,
              status: 'delivering' as OrderStatus,
              deliveredAt: new Date().toISOString(),
            };
          }
          return o;
        });
        set({ orders: updatedOrders });
      },

      completeOrder: (orderId: string) => {
        const { orders, transactions, users, runnerProfiles } = get();
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.runnerId) return;

        const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              status: 'completed' as OrderStatus,
              completedAt: new Date().toISOString(),
            };
          }
          return o;
        });

        const newTxn: Transaction = {
          id: generateId(),
          userId: order.runnerId,
          orderId: order.id,
          type: 'income',
          amount: order.reward,
          status: 'success',
          description: `完成${order.type === 'express' ? '代取快递' : '跑腿'}订单收入`,
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = users.map(u => {
          if (u.id === order.runnerId) {
            return { ...u, balance: u.balance + order.reward };
          }
          return u;
        });

        const updatedProfiles = runnerProfiles.map(p => {
          if (p.userId === order.runnerId && p.status === 'approved') {
            return {
              ...p,
              completedOrders: p.completedOrders + 1,
              successRate: Math.round(((p.completedOrders + 1) / (p.completedOrders + 1)) * 100),
            };
          }
          return p;
        });

        set({
          orders: updatedOrders,
          transactions: [...transactions, newTxn],
          users: updatedUsers,
          runnerProfiles: updatedProfiles,
        });
      },

      cancelOrder: (orderId: string) => {
        const { orders } = get();
        const updatedOrders = orders.map(o => {
          if (o.id === orderId && o.status === 'pending') {
            return { ...o, status: 'cancelled' as OrderStatus };
          }
          return o;
        });
        set({ orders: updatedOrders });
      },

      applyRunner: (data) => {
        const { runnerProfiles } = get();
        const existing = runnerProfiles.find(p => p.userId === data.userId);
        if (existing) return;

        const newProfile: RunnerProfile = {
          id: generateId(),
          ...data,
          status: 'pending',
          rating: 0,
          completedOrders: 0,
          successRate: 0,
          applyTime: new Date().toISOString(),
        };
        set({ runnerProfiles: [...runnerProfiles, newProfile] });
      },

      approveRunner: (profileId: string) => {
        const { runnerProfiles, users } = get();
        const profile = runnerProfiles.find(p => p.id === profileId);
        if (!profile) return;

        const updatedProfiles = runnerProfiles.map(p => {
          if (p.id === profileId) {
            return { ...p, status: 'approved' as const, auditTime: new Date().toISOString() };
          }
          return p;
        });

        const updatedUsers = users.map(u => {
          if (u.id === profile.userId) {
            return { ...u, role: 'runner' as const };
          }
          return u;
        });

        set({ runnerProfiles: updatedProfiles, users: updatedUsers });
      },

      rejectRunner: (profileId: string, remark: string) => {
        const { runnerProfiles } = get();
        const updatedProfiles = runnerProfiles.map(p => {
          if (p.id === profileId) {
            return { ...p, status: 'rejected' as const, auditTime: new Date().toISOString(), auditRemark: remark };
          }
          return p;
        });
        set({ runnerProfiles: updatedProfiles });
      },

      addReview: (reviewData) => {
        const { reviews, runnerProfiles } = get();
        const newReview: Review = {
          ...reviewData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        const runnerProfile = runnerProfiles.find(p => p.userId === reviewData.toUserId);
        let updatedProfiles = runnerProfiles;
        if (runnerProfile) {
          const allReviews = [...reviews, newReview].filter(r => r.toUserId === reviewData.toUserId);
          const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          updatedProfiles = runnerProfiles.map(p => {
            if (p.userId === reviewData.toUserId) {
              return { ...p, rating: Math.round(avgRating * 10) / 10 };
            }
            return p;
          });
        }

        set({ reviews: [...reviews, newReview], runnerProfiles: updatedProfiles });
      },

      addTransaction: (txnData) => {
        const { transactions, users, currentUser } = get();
        const newTxn: Transaction = {
          ...txnData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        let updatedUsers = users;
        let updatedCurrentUser = currentUser;
        
        if (txnData.type === 'recharge' && txnData.status === 'success') {
          updatedUsers = users.map(u => {
            if (u.id === txnData.userId) {
              return { ...u, balance: u.balance + txnData.amount };
            }
            return u;
          });
          if (currentUser?.id === txnData.userId) {
            updatedCurrentUser = { ...currentUser, balance: currentUser.balance + txnData.amount };
          }
        }

        set({ transactions: [newTxn, ...transactions], users: updatedUsers, currentUser: updatedCurrentUser });
      },

      createDispute: (disputeData) => {
        const { disputes, orders } = get();
        const newDispute: Dispute = {
          ...disputeData,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const updatedOrders = orders.map(o => {
          if (o.id === disputeData.orderId) {
            return { ...o, status: 'disputed' as OrderStatus };
          }
          return o;
        });

        set({ disputes: [...disputes, newDispute], orders: updatedOrders });
      },

      resolveDispute: (disputeId: string, result: string, refund: boolean) => {
        const { disputes, orders, transactions, users, currentUser } = get();
        const dispute = disputes.find(d => d.id === disputeId);
        if (!dispute) return;

        const updatedDisputes = disputes.map(d => {
          if (d.id === disputeId) {
            return {
              ...d,
              status: 'resolved' as const,
              result,
              processedAt: new Date().toISOString(),
            };
          }
          return d;
        });

        const order = orders.find(o => o.id === dispute.orderId);
        let updatedOrders = orders;
        let updatedTransactions = transactions;
        let updatedUsers = users;
        let updatedCurrentUser = currentUser;

        if (order) {
          updatedOrders = orders.map(o => {
            if (o.id === dispute.orderId) {
              return { ...o, status: refund ? 'cancelled' as OrderStatus : 'completed' as OrderStatus };
            }
            return o;
          });

          if (refund) {
            const refundTxn: Transaction = {
              id: generateId(),
              userId: dispute.complainantId,
              orderId: order.id,
              type: 'refund',
              amount: order.reward,
              status: 'success',
              description: '争议退款',
              createdAt: new Date().toISOString(),
            };
            updatedTransactions = [...transactions, refundTxn];

            updatedUsers = users.map(u => {
              if (u.id === dispute.complainantId) {
                return { ...u, balance: u.balance + order.reward };
              }
              return u;
            });

            if (currentUser?.id === dispute.complainantId) {
              updatedCurrentUser = { ...currentUser, balance: currentUser.balance + order.reward };
            }
          }
        }

        set({
          disputes: updatedDisputes,
          orders: updatedOrders,
          transactions: updatedTransactions,
          users: updatedUsers,
          currentUser: updatedCurrentUser,
        });
      },

      banUser: (userId: string) => {
        const { users, currentUser } = get();
        const updatedUsers = users.map(u => {
          if (u.id === userId) {
            return { ...u, isBanned: true };
          }
          return u;
        });
        const updatedCurrentUser = currentUser?.id === userId ? null : currentUser;
        set({ users: updatedUsers, currentUser: updatedCurrentUser });
      },

      unbanUser: (userId: string) => {
        const { users } = get();
        const updatedUsers = users.map(u => {
          if (u.id === userId) {
            return { ...u, isBanned: false };
          }
          return u;
        });
        set({ users: updatedUsers });
      },

      getOrderById: (id: string) => {
        return get().orders.find(o => o.id === id);
      },

      getOrdersByPublisher: (publisherId: string) => {
        return get().orders.filter(o => o.publisherId === publisherId);
      },

      getOrdersByRunner: (runnerId: string) => {
        return get().orders.filter(o => o.runnerId === runnerId);
      },

      getRunnerProfile: (userId: string) => {
        return get().runnerProfiles.find(p => p.userId === userId);
      },

      getReviewsForUser: (userId: string) => {
        return get().reviews.filter(r => r.toUserId === userId);
      },

      getTransactionsForUser: (userId: string) => {
        return get().transactions.filter(t => t.userId === userId);
      },
    }),
    {
      name: 'campus-express-storage',
    }
  )
);
