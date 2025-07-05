import React, { useState, useRef } from 'react';
import { User, Mail, Lock, Bell, Shield, CreditCard, Smartphone, LogOut, Camera, Eye, EyeOff } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { changePassword } from '../api/auth';

export default function Settings() {
  const { user } = useAuth();
  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const firstLetter = userName.charAt(0).toUpperCase();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy' | 'terms'>(() => {
    const tabParam = searchParams.get('tab');
    return (tabParam as any) || 'profile';
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Lock },
    { id: 'terms', name: 'Terms of Service', icon: Lock },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating profile:', user);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 bg-[#042E3A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-6 lg:space-y-0">
        <Card className="lg:col-span-1" padding="sm">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="mr-3 w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </Card>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-4xl">{firstLetter}</span>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={handleImageClick}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
                  <p className="text-gray-600">{userEmail}</p>
                  <Button variant="outline" size="sm" className="mt-2"
                  onClick={handleImageClick}
                  >
                    Upload Photo
                  </Button>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={userName}
                    onChange={(e) => console.log('Name changed:', e.target.value)}
                    icon={User}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={userEmail}
                    onChange={(e) => console.log('Email changed:', e.target.value)}
                    icon={Mail}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                {passwordError && (
                  <div className="text-red-600 text-sm font-medium">{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div className="text-green-600 text-sm font-medium">{passwordSuccess}</div>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'expense-reminders', label: 'Expense tracking reminders', enabled: true },
                      { id: 'committee-updates', label: 'Committee updates', enabled: true },
                      { id: 'goal-progress', label: 'Goal progress updates', enabled: false },
                      { id: 'monthly-report', label: 'Monthly financial report', enabled: true }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-gray-700">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'new-expenses', label: 'New expense additions', enabled: true },
                      { id: 'budget-alerts', label: 'Budget limit alerts', enabled: true },
                      { id: 'committee-payments', label: 'Committee payment reminders', enabled: true },
                      { id: 'security-alerts', label: 'Security alerts', enabled: true }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-gray-700">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
              <div className="space-y-4 text-gray-700 text-sm">
                <p>Your privacy is important to us. Expenza collects only the data necessary to provide our services and does not sell your personal information to third parties. We use industry-standard security measures to protect your data.</p>
                <ul className="list-disc pl-5">
                  <li>We collect your name, email, and usage data for account management.</li>
                  <li>Your data is encrypted and securely stored.</li>
                  <li>You can request deletion of your account and data at any time.</li>
                  <li>Contact us for any privacy-related concerns.</li>
                  <li>We may use anonymized data to improve our services and user experience.</li>
                  <li>We do not share your personal data with advertisers or third parties without your explicit consent.</li>
                  <li>Our platform complies with applicable data protection regulations, including GDPR where relevant.</li>
                  <li>We may update this policy from time to time; continued use of Expenza constitutes acceptance of any changes.</li>
                </ul>
                <h3 className="font-semibold mt-4">How We Use Your Data</h3>
                <ul className="list-disc pl-5">
                  <li>To provide and maintain our services.</li>
                  <li>To notify you about changes to our services.</li>
                  <li>To allow you to participate in interactive features of our service when you choose to do so.</li>
                  <li>To provide customer support.</li>
                  <li>To gather analysis or valuable information so that we can improve our service.</li>
                  <li>To monitor the usage of our service.</li>
                  <li>To detect, prevent and address technical issues.</li>
                </ul>
                <h3 className="font-semibold mt-4">Your Rights</h3>
                <ul className="list-disc pl-5">
                  <li>You have the right to access, update, or delete your personal information.</li>
                  <li>You have the right to withdraw consent at any time where we rely on your consent to process your personal information.</li>
                  <li>You have the right to complain to a Data Protection Authority about our collection and use of your personal data.</li>
                </ul>
              </div>
            </Card>
          )}

          {activeTab === 'terms' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Terms of Service</h2>
              <div className="space-y-4 text-gray-700 text-sm">
                <p>Welcome to Expenza! By creating an account, you agree to abide by our terms of service. These include using the platform responsibly, not engaging in fraudulent activities, and respecting other users. Expenza reserves the right to update these terms at any time. Please review them regularly.</p>
                <ul className="list-disc pl-5">
                  <li>Use Expenza for lawful purposes only.</li>
                  <li>Do not share your password with others.</li>
                  <li>Respect the privacy and data of other users.</li>
                  <li>Expenza is not liable for financial losses incurred through misuse.</li>
                  <li>Users must provide accurate and complete information during registration.</li>
                  <li>Any attempt to disrupt or compromise the platform's security is strictly prohibited.</li>
                  <li>Expenza may suspend or terminate accounts that violate these terms.</li>
                  <li>All content and data on Expenza are the property of their respective owners.</li>
                  <li>Users are responsible for maintaining the confidentiality of their account credentials.</li>
                  <li>These terms are governed by the laws of the applicable jurisdiction.</li>
                </ul>
                <h3 className="font-semibold mt-4">User Responsibilities</h3>
                <ul className="list-disc pl-5">
                  <li>Keep your login credentials secure and confidential.</li>
                  <li>Report any unauthorized use of your account immediately.</li>
                  <li>Do not use Expenza for any illegal or unauthorized purpose.</li>
                </ul>
                <h3 className="font-semibold mt-4">Changes to Terms</h3>
                <p>Expenza reserves the right to modify these terms at any time. We will notify users of any significant changes. Continued use of the service after changes constitutes acceptance of the new terms.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
