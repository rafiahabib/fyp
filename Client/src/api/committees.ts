import api from './axios';
import { 
  Committee, 
  CreateCommitteeData, 
  JoinCommitteeData, 
  CommitteeFilters, 
  CommitteesResponse 
} from '../types';

// Get all committees with filters
export const getCommittees = (filters?: CommitteeFilters) => 
  api.get<CommitteesResponse>('/api/committees', { params: filters });

// Get a specific committee by ID
export const getCommittee = (id: string) => 
  api.get<{ status: string; committee: Committee }>(`/api/committees/${id}`);

// Create a new committee
export const createCommittee = (committeeData: CreateCommitteeData) =>
  api.post<{ status: string; message: string; committee: Committee }>('/api/committees', committeeData);

// Join a committee
export const joinCommittee = (committeeId: string, joinData: JoinCommitteeData) =>
  api.post<{ 
    status: string; 
    message: string; 
    committee: Committee; 
    paymentInstructions: {
      method: string;
      amount: number;
      details: any;
    };
  }>(`/api/committees/${committeeId}/join`, joinData);

// Leave a committee
export const leaveCommittee = (committeeId: string) =>
  api.post<{ status: string; message: string }>(`/api/committees/${committeeId}/leave`);

// Get user's committees (created or joined)
export const getMyCommittees = () =>
  api.get<{ status: string; results: number; committees: Committee[] }>('/api/committees/my/committees');

// Update payment status (creator only)
export const updatePaymentStatus = (committeeId: string, slotPosition: number, paymentStatus: 'pending' | 'paid' | 'overdue') =>
  api.put<{ status: string; message: string; committee: Committee }>(`/api/committees/${committeeId}/payment`, {
    slotPosition,
    paymentStatus
  });

// Rate a committee
export const rateCommittee = (committeeId: string, rating: number, review?: string) =>
  api.post<{ status: string; message: string; averageRating: number }>(`/api/committees/${committeeId}/rate`, {
    rating,
    review
  }); 