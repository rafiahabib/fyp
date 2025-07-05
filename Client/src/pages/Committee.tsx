import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, Search, DollarSign, Calendar, UserCheck, Star } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { getMyCommittees } from '../api/committees';
import { Committee } from '../types';
import { useAuth } from '../context/AuthContext';

export default function CommitteePage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [myCommittees, setMyCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCommittees();
  }, []);

  const fetchMyCommittees = async () => {
    try {
      setLoading(true);
      const response = await getMyCommittees();
      setMyCommittees(response.data.committees);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch committees');
    } finally {
      setLoading(false);
    }
  };

  const getMyPosition = (committee: Committee) => {
    const mySlot = committee.slots.find(slot => 
      slot.user && slot.user._id === user?._id
    );
    return mySlot ? mySlot.position : null;
  };

  const getNextPayout = (committee: Committee) => {
    if (committee.status !== 'active') return null;
    // This would need to be calculated based on the committee's payout schedule
    // For now, returning a placeholder
    return new Date(committee.startDate).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading committees...</div>
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

  return (
    <div className="space-y-6 bg-[#042E3A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Digital Committee</h1>
        {isAdmin() && (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Admin Access
            </span>
          </div>
        )}
      </div>

      <div className={`grid gap-6 ${isAdmin() ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {isAdmin() && (
          <Link to="/committee/create" className="block">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/committee/create')} tabIndex={0} role="button" aria-label="Create Committee">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Create Committee</h2>
                <p className="text-gray-600 mb-4">
                  Start a new savings committee with friends, family, or colleagues. Set up contribution amounts and manage the entire process.
                </p>
                <Button className="group-hover:bg-blue-700">
                  Create New Committee
                </Button>
              </div>
            </Card>
          </Link>
        )}

        <Link to="/committee/join" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => navigate('/committee/join')} tabIndex={0} role="button" aria-label="Browse Committees">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Join Committee</h2>
              <p className="text-gray-600 mb-4">
                Browse and join existing committees. Find the perfect savings group that matches your financial goals and timeline.
              </p>
              <Button variant="success" className="group-hover:bg-green-700">
                Browse Committees
              </Button>
            </div>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Committees</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total Active:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {myCommittees.filter(c => c.status === 'active').length}
            </span>
          </div>
        </div>

        {myCommittees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Committees Yet</h3>
            <p className="text-gray-600 mb-4">
              {isAdmin() 
                ? "You haven't joined or created any committees yet. Start by creating a new committee or browsing existing ones."
                : "You haven't joined any committees yet. Browse existing committees to get started."
              }
            </p>
            <div className="flex gap-3 justify-center">
              {isAdmin() && (
                <Button onClick={() => navigate('/committee/create')}>
                  Create Committee
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/committee/join')}>
                Browse Committees
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {myCommittees.map((committee) => {
              const myPosition = getMyPosition(committee);
              const nextPayout = getNextPayout(committee);
              
              return (
                <div key={committee._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{committee.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(committee.status)}`}>
                      {committee.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Slots</span>
                      </div>
                      <span className="text-sm font-medium">
                        {committee.occupiedSlots}/{committee.totalSlots}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Contribution</span>
                      </div>
                      <span className="text-sm font-medium">${committee.contributionAmount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Total Payout</span>
                      </div>
                      <span className="text-sm font-medium">${committee.totalPayout}</span>
                    </div>

                    {myPosition && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">My Position</span>
                        </div>
                        <span className="text-sm font-medium">#{myPosition}</span>
                      </div>
                    )}

                    {nextPayout && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Next Payout</span>
                        </div>
                        <span className="text-sm font-medium">{nextPayout}</span>
                      </div>
                    )}

                    {committee.averageRating > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Rating</span>
                        </div>
                        <span className="text-sm font-medium">{committee.averageRating}/5</span>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
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
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="mt-4"
                    onClick={() => navigate(`/committee/${committee._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">
              ${myCommittees.reduce((sum, c) => sum + c.contributionAmount, 0)}
            </p>
            <p className="text-sm text-blue-600">Monthly Contributions</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              ${myCommittees.filter(c => c.status === 'active').reduce((sum, c) => sum + c.totalPayout, 0)}
            </p>
            <p className="text-sm text-green-600">Next Expected Payout</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">{myCommittees.length}</p>
            <p className="text-sm text-purple-600">Total Committees</p>
          </div>
        </Card>
      </div>
    </div>
  );
}