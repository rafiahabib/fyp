import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Hash, CheckCircle, Calendar, Shield } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { createCommittee } from '../api/committees';
import { CreateCommitteeData } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function CreateCommittee() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCommitteeData>({
    name: '',
    totalSlots: 0,
    contributionAmount: 0,
    startDate: '',
    category: 'Other',
    description: '',
    rules: '',
    
    paymentMethod: 'jazzcash'
  });

  const steps = [
    { id: 1, title: 'Committee Details', icon: Users },
    { id: 2, title: 'Additional Settings', icon: Hash },
    { id: 3, title: 'Review & Create', icon: CheckCircle }
  ];

  const categories = [
    'Professional', 'Education', 'Community', 'Business', 'Family', 'Other'
  ];

  const paymentMethods = [
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'easypaisa', label: 'EasyPaisa' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' }
  ];

  const handleInputChange = (field: keyof CreateCommitteeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.totalSlots > 0 && formData.contributionAmount > 0 && formData.startDate);
      case 2:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/committee');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await createCommittee(formData);
      
      // Show success message and redirect
      toast.success('Committee created successfully!');
      navigate('/committee');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create committee');
    } finally {
      setLoading(false);
    }
  };

  const totalPayout = formData.totalSlots * formData.contributionAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={handleBack}
        >
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Create Committee</h1>
          {isAdmin() && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin() && (
        <Card className="border-purple-200 bg-purple-50">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-medium text-purple-900">Admin Access</h3>
              <p className="text-sm text-purple-700">
                You have administrative privileges to create new committees. Regular users can only join existing committees.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-0.5 mx-4 transition-colors
                  ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <Card>
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Committee Details</h2>
              <p className="text-gray-600">Set up your committee with basic information</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <Input
                label="Committee Name *"
                placeholder="e.g., Family Savings Circle"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />

              <Input
                label="Number of Slots *"
                type="number"
                placeholder="e.g., 10"
                value={formData.totalSlots || ''}
                onChange={(e) => handleInputChange('totalSlots', parseInt(e.target.value) || 0)}
                icon={Hash}
                required
                min={2}
                max={50}
              />

              <Input
                label="Contribution Amount per Member *"
                type="number"
                step="0.01"
                placeholder="e.g., 500.00"
                value={formData.contributionAmount || ''}
                onChange={(e) => handleInputChange('contributionAmount', parseFloat(e.target.value) || 0)}
                icon={DollarSign}
                required
                min={1}
              />

              <Input
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                icon={Calendar}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {totalPayout > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Payout per Turn:</span>
                    <span className="text-lg font-bold text-blue-600">${totalPayout.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Hash className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Settings</h2>
              <p className="text-gray-600">Configure optional committee settings</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <Input
                label="Description"
                placeholder="Brief description of the committee"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />

              <Input
                label="Rules"
                placeholder="Committee rules and guidelines"
                value={formData.rules || ''}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                multiline
                rows={3}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

      
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Review & Create</h2>
              <p className="text-gray-600">Review your committee details before creating</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Committee Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Slots:</span>
                  <span className="font-medium">{formData.totalSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contribution Amount:</span>
                  <span className="font-medium">${formData.contributionAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Payout:</span>
                  <span className="font-medium text-green-600">${totalPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{new Date(formData.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{paymentMethods.find(m => m.value === formData.paymentMethod)?.label}</span>
                </div>
              </div>

              {formData.description && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Description:</h4>
                  <p className="text-gray-600 text-sm">{formData.description}</p>
                </div>
              )}

              {formData.rules && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Rules:</h4>
                  <p className="text-gray-600 text-sm">{formData.rules}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={loading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Committee'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}