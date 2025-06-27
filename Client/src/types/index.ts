export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

export interface Committee {
  _id: string;
  name: string;
  creator: User;
  totalSlots: number;
  contributionAmount: number;
  totalPayout: number;
  availableSlots: number;
  occupiedSlots: number;
  slots: Slot[];
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  currentRound: number;
  category: 'Professional' | 'Education' | 'Community' | 'Business' | 'Family' | 'Other';
  description?: string;
  rules?: string;
  isPrivate: boolean;
  inviteCode?: string;
  paymentMethod: 'jazzcash' | 'easypaisa' | 'bank-transfer' | 'cash';
  paymentDetails?: {
    accountNumber?: string;
    accountTitle?: string;
    bankName?: string;
  };
  ratings: Rating[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  _id: string;
  position: number;
  user?: User;
  isOccupied: boolean;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  paymentDate?: string;
  payoutReceived: boolean;
  payoutDate?: string;
}

export interface Rating {
  _id: string;
  user: User;
  rating: number;
  review?: string;
  date: string;
}

export interface CreateCommitteeData {
  name: string;
  totalSlots: number;
  contributionAmount: number;
  startDate: string;
  category: 'Professional' | 'Education' | 'Community' | 'Business' | 'Family' | 'Other';
  description?: string;
  rules?: string;
  isPrivate?: boolean;
  paymentMethod?: 'jazzcash' | 'easypaisa' | 'bank-transfer' | 'cash';
  paymentDetails?: {
    accountNumber?: string;
    accountTitle?: string;
    bankName?: string;
  };
}

export interface JoinCommitteeData {
  slotPosition: number;
}

export interface CommitteeFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

export interface CommitteesResponse {
  status: string;
  results: number;
  totalPages: number;
  currentPage: number;
  committees: Committee[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}