import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, DollarSign, Calendar, Star, X, Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { getCommittees, joinCommittee } from '../api/committees';
import { Committee, CommitteeFilters } from '../types';
import { toast } from 'react-toastify';

// Verification Modal Component
const VerificationModal = ({ isOpen, onClose, onComplete, selectedCommittee, selectedSlot }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicImage, setCnicImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [cnicVerified, setCnicVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  
  const cnicInputRef = useRef(null);
  const faceInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);

  const resetModal = () => {
    setCurrentStep(1);
    setCnicNumber('');
    setCnicImage(null);
    setFaceImage(null);
    setIsVerifying(false);
    setVerificationError('');
    setCnicVerified(false);
    setFaceVerified(false);
    setIsUsingCamera(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const formatCNIC = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXXXX-XXXXXXX-X
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 12) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
  };

  const handleCnicChange = (e) => {
    const formatted = formatCNIC(e.target.value);
    setCnicNumber(formatted);
  };

  const handleFileUpload = (file, type) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'cnic') {
          setCnicImage(e.target.result);
        } else {
          setFaceImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (err) {
      setVerificationError('Unable to access camera. Please upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setFaceImage(imageData);
      
      // Stop camera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setIsUsingCamera(false);
    }
  };

  const verifyCNIC = async () => {
    if (!cnicNumber || cnicNumber.length !== 15) {
      setVerificationError('Please enter a valid CNIC number (XXXXX-XXXXXXX-X)');
      return;
    }
    
    if (!cnicImage) {
      setVerificationError('Please upload your CNIC image');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      // Convert base64 image to blob for API
      const cnicBlob = await fetch(cnicImage).then(res => res.blob());
      
  
      const formData = new FormData();
      formData.append('cnic_number', cnicNumber.replace(/-/g, '')); // Remove dashes
      formData.append('id_image', cnicBlob, 'cnic.jpg');
      
      setCnicVerified(true);
      setCurrentStep(2);
    } catch (error) {
      setVerificationError('CNIC verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };


  const verifyFace = async () => {
    if (!faceImage) {
      setVerificationError('Please capture or upload your photo');
      return;
    }

    if (!cnicImage) {
      setVerificationError('CNIC verification required first');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {

      const idBlob = await fetch(cnicImage).then(res => res.blob());
      const selfieBlob = await fetch(faceImage).then(res => res.blob());
      
      
      const formData = new FormData();
      formData.append('id_image', idBlob, 'id.jpg');
      formData.append('selfie_image', selfieBlob, 'selfie.jpg');
      
      
      const response = await fetch('http://127.0.0.1:5000/verify', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.verified) {
        throw new Error(`Face verification failed. Confidence: ${result.confidence}% (needs to be above ${result.threshold})`);
      }

      setFaceVerified(true);
      
      
      setTimeout(() => {
        onComplete();
        handleClose();
      }, 1000);
    } catch (error) {
      setVerificationError(error.message || 'Face verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Identity Verification</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {cnicVerified ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {faceVerified ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
          </div>

          {/* Step 1: CNIC Verification */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CNIC Verification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please enter your CNIC number and upload a clear photo of your CNIC card.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNIC Number
                </label>
                <input
                  type="text"
                  value={cnicNumber}
                  onChange={handleCnicChange}
                  placeholder="XXXXX-XXXXXXX-X"
                  maxLength={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNIC Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {cnicImage ? (
                    <div className="text-center">
                      <img src={cnicImage} alt="CNIC" className="max-w-full h-32 object-contain mx-auto mb-2" />
                      <button
                        onClick={() => cnicInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <button
                        onClick={() => cnicInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Upload CNIC Image
                      </button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={cnicInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'cnic')}
                    className="hidden"
                  />
                </div>
              </div>

              {verificationError && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{verificationError}</span>
                </div>
              )}

              <Button
                fullWidth
                onClick={verifyCNIC}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify CNIC'}
              </Button>
            </div>
          )}

          {/* Step 2: Face Verification */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Face Verification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please take a selfie or upload a clear photo of your face.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {faceImage ? (
                  <div className="text-center">
                    <img src={faceImage} alt="Face" className="max-w-full h-32 object-contain mx-auto mb-2" />
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={startCamera}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Retake Photo</span>
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => faceInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload New</span>
                      </button>
                    </div>
                  </div>
                ) : isUsingCamera ? (
                  <div className="text-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <Button onClick={capturePhoto} size="sm">
                      Capture Photo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="flex justify-center space-x-2 mb-2">
                      <button
                        onClick={startCamera}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                      </button>
                      <span className="text-gray-300">or</span>
                      <button
                        onClick={() => faceInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={faceInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'face')}
                  className="hidden"
                />
              </div>

              {verificationError && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{verificationError}</span>
                </div>
              )}

              {faceVerified && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Face verification successful!</span>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isVerifying}
                >
                  Back
                </Button>
                <Button
                  fullWidth
                  onClick={verifyFace}
                  disabled={isVerifying || !faceImage}
                >
                  {isVerifying ? 'Verifying...' : faceVerified ? 'Verified!' : 'Verify Face'}
                </Button>
              </div>
            </div>
          )}

          {/* Committee Info */}
          {selectedCommittee && selectedSlot && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-1">Joining Committee:</h4>
                <p className="text-sm text-blue-700">{selectedCommittee.name}</p>
                <p className="text-sm text-blue-700">Position #{selectedSlot}</p>
                <p className="text-sm text-blue-700">Payout: ${selectedCommittee.totalPayout}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function JoinCommittee() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchCommittees();
  }, [filters]);

  const fetchCommittees = async () => {
    try {
      setLoading(true);
      const response = await getCommittees(filters);
      setCommittees(response.data.committees);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch committees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      page: 1
    }));
  };

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'All' ? undefined : category,
      page: 1
    }));
  };

  const filteredCommittees = committees.filter(committee =>
    !searchQuery || 
    committee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    committee.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSlotGrid = (committee) => {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {committee.slots.map((slot) => {
          const isTaken = slot.isOccupied;
          const isSelected = selectedSlot === slot.position;
          
          return (
            <button
              key={slot._id}
              onClick={() => !isTaken && setSelectedSlot(slot.position)}
              disabled={isTaken}
              className={`
                p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                ${isTaken 
                  ? 'border-green-300 bg-green-100 text-green-700 cursor-not-allowed' 
                  : isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-red-300 bg-red-50 text-red-700 hover:border-red-400 cursor-pointer'
                }
              `}
            >
              <div>#{slot.position}</div>
              <div className="text-xs mt-1">
                {isTaken ? 'Taken' : 'Available'}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const handleJoinCommitteeClick = () => {
    if (!selectedCommittee || !selectedSlot) return;
    setShowVerificationModal(true);
  };

  const handleVerificationComplete = async () => {
    try {
      setJoining(true);
      const response = await joinCommittee(selectedCommittee._id, { slotPosition: selectedSlot });
      
      // Show payment instructions
      toast.success(`Successfully joined committee! Please make your payment via ${response.data.paymentInstructions.method}. Amount: $${response.data.paymentInstructions.amount}`);
      navigate('/committee');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join committee');
    } finally {
      setJoining(false);
    }
  };

  const categories = ['All', 'Professional', 'Education', 'Community', 'Business', 'Family', 'Other'];

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
    <>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/committee')}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Join Committee</h1>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search committees by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.category === category || (!filters.category && category === 'All')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Card>

        {!selectedCommittee ? (
          <>
            {filteredCommittees.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Committees Found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later for new committees.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCommittees.map((committee) => (
                  <Card key={committee._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{committee.name}</h3>
                          <p className="text-sm text-gray-600">Created by {committee.creator?.name}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {committee.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {committee.availableSlots}/{committee.totalSlots} available
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">${committee.contributionAmount}/month</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Starts {new Date(committee.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Rating: {committee.averageRating}/5</span>
                        </div>
                      </div>

                      {committee.description && (
                        <p className="text-sm text-gray-600">{committee.description}</p>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Filled Slots</span>
                          <span className="font-medium">
                            {Math.round((committee.occupiedSlots / committee.totalSlots) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(committee.occupiedSlots / committee.totalSlots) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Payout:</span>
                          <span className="font-bold text-lg text-green-600">${committee.totalPayout}</span>
                        </div>
                      </div>

                      <Button
                        fullWidth
                        onClick={() => setSelectedCommittee(committee)}
                        disabled={committee.availableSlots === 0}
                      >
                        {committee.availableSlots === 0 ? 'Committee Full' : 'Select Committee'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCommittee.name}</h2>
                  <p className="text-sm text-gray-600">Select your preferred slot position</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCommittee(null)}
                >
                  Back to List
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Committee Information:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Contribution Amount:</span>
                    <span className="font-medium ml-2">${selectedCommittee.contributionAmount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Payout:</span>
                    <span className="font-medium ml-2">${selectedCommittee.totalPayout}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Payment Method:</span>
                    <span className="font-medium ml-2">{selectedCommittee.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Start Date:</span>
                    <span className="font-medium ml-2">{new Date(selectedCommittee.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Available Slots:</h3>
                {renderSlotGrid(selectedCommittee)}
              </div>

              {selectedSlot && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-900">
                    <strong>Selected Position #{selectedSlot}</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    You will receive ${selectedCommittee.totalPayout} in month {selectedSlot}
                  </p>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCommittee(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinCommitteeClick}
                  disabled={!selectedSlot || joining}
                >
                  {joining ? 'Joining...' : 'Join Committee'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onComplete={handleVerificationComplete}
        selectedCommittee={selectedCommittee}
        selectedSlot={selectedSlot}
      />
    </>
  );
}