import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Calendar, Star, UserCheck, Clock, Settings } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { getCommittee, leaveCommittee, updatePaymentStatus, rateCommittee } from '../api/committees';
import { Committee } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function CommitteeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCommittee();
    }
  }, [id]);

  const fetchCommittee = async () => {
    try {
      setLoading(true);
      const response = await getCommittee(id!);
      setCommittee(response.data.committee);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch committee details');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCommittee = async () => {
    if (!committee || !confirm('Are you sure you want to leave this committee?')) return;

    try {
      setLeaving(true);
      await leaveCommittee(committee._id);
      toast.success('Successfully left the committee');
      navigate('/committee');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to leave committee');
    } finally {
      setLeaving(false);
    }
  };

  const handleUpdatePaymentStatus = async (slotPosition: number, paymentStatus: 'pending' | 'paid' | 'overdue') => {
    if (!committee) return;

    try {
      const response = await updatePaymentStatus(committee._id, slotPosition, paymentStatus);
      setCommittee(response.data.committee);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleSubmitRating = async () => {
    if (!committee || rating === 0) return;

    try {
      setSubmittingRating(true);
      const response = await rateCommittee(committee._id, rating, review);
      setCommittee(prev => prev ? { ...prev, averageRating: response.data.averageRating } : null);
      setRating(0);
      setReview('');
      toast.success('Rating submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

   const isCreator = committee?.creator?._id === user?.id;
   const isMember = committee?.slots.some(slot => slot.user?._id === user?.id);
   const mySlot = committee?.slots.find(slot => slot.user?._id === user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading committee details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Committee not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/committee')}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{committee.name}</h1>
        </div>
        {isMember && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveCommittee}
            disabled={leaving}
          >
            {leaving ? 'Leaving...' : 'Leave Committee'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Committee Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Committee Information</h2>
                  <p className="text-gray-600">Created by {committee?.creator?.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  committee.status === 'active' ? 'bg-green-100 text-green-800' :
                  committee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  committee.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {committee.status}
                </span>
              </div>

              {committee.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{committee.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Members:</span>
                  <span className="font-medium">{committee.occupiedSlots}/{committee.totalSlots}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Contribution:</span>
                  <span className="font-medium">${committee.contributionAmount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Payout:</span>
                  <span className="font-medium">${committee.totalPayout}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Start Date:</span>
                  <span className="font-medium">{new Date(committee.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              {committee.rules && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Rules</h3>
                  <p className="text-gray-600 text-sm">{committee.rules}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Members Grid */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {committee.slots.map((slot) => (
                <div
                  key={slot._id}
                  className={`p-4 rounded-lg border-2 ${
                    slot.isOccupied
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Position #{slot.position}</span>
                    {slot.isOccupied && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Occupied
                      </span>
                    )}
                  </div>
                  
                  {slot.isOccupied ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{slot.user?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          slot.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          slot.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {slot.paymentStatus}
                        </span>
                      </div>
                      {isCreator && slot.paymentStatus !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdatePaymentStatus(slot.position, 'paid')}
                        >
                          Mark as Paid
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Available</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Ratings */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">{committee.averageRating}/5</span>
              </div>
            </div>

            {committee.ratings.length > 0 ? (
              <div className="space-y-4">
                {committee.ratings.map((rating) => (
                  <div key={rating._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{rating.user.name}</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(rating.date).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-gray-600 text-sm">{rating.review}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No ratings yet</p>
            )}

            {isMember && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Rate this Committee</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Write a review (optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitRating}
                    disabled={rating === 0 || submittingRating}
                  >
                    {submittingRating ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Position */}
          {mySlot && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">My Position</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">#{mySlot.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mySlot.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    mySlot.paymentStatus === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {mySlot.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payout Received:</span>
                  <span className="font-medium">{mySlot.payoutReceived ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-medium capitalize">{committee.paymentMethod}</span>
              </div>
              {committee.paymentDetails && (
                <>
                  {committee.paymentDetails.accountNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-medium">{committee.paymentDetails.accountNumber}</span>
                    </div>
                  )}
                  {committee.paymentDetails.bankName && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium">{committee.paymentDetails.bankName}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Committee Stats */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Committee Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Progress:</span>
                <span className="font-medium">
                  {Math.round((committee.occupiedSlots / committee.totalSlots) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(committee.occupiedSlots / committee.totalSlots) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Round:</span>
                <span className="font-medium">{committee.currentRound}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{committee.category}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 