import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../contexts/DatabaseContext';
import './Settings.scss';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
}

interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
  language: string;
}

interface PaymentMethod {
  type: string;
  number: string;
  isDefault: boolean;
}

type EditMode = 'profile' | 'email' | 'phone' | 'payment' | null;

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateProfile, logout, isApiConnected, trackEvent } = useDatabase();
  const [editMode, setEditMode] = useState<EditMode>(null);
  
  // User profile state (initialized from database user or localStorage fallback)
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.name || 'User',
    email: user?.email || 'user@example.com',
    phone: user?.phoneNumber || '+263 77 XXX XXXX',
    avatar: '',
  });

  // Preferences state (initialized from database user or localStorage fallback)
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: user?.preferences?.pushNotifications ?? true,
    darkMode: user?.preferences?.darkMode ?? true,
    soundEffects: user?.preferences?.soundEffects ?? true,
    language: 'en',
  });

  // Payment methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { type: 'EcoCash', number: '**** 1234', isDefault: true },
  ]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newEcoCashNumber: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load saved settings and sync with database user
  useEffect(() => {
    // If we have a database user, use their data
    if (user) {
      setProfile({
        fullName: user.name || 'User',
        email: user.email || 'user@example.com',
        phone: user.phoneNumber || '+263 77 XXX XXXX',
        avatar: '',
      });
      setPreferences({
        notifications: user.preferences?.pushNotifications ?? true,
        darkMode: user.preferences?.darkMode ?? true,
        soundEffects: user.preferences?.soundEffects ?? true,
        language: 'en',
      });
    } else {
      // Fallback to localStorage
      const savedProfile = localStorage.getItem('userProfile');
      const savedPreferences = localStorage.getItem('userPreferences');
      
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, [user]);

  // Save preferences to both localStorage and database
  const savePreferences = async (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    
    // Sync to database if connected
    if (isApiConnected && user) {
      try {
        await updateProfile({
          preferences: {
            pushNotifications: newPrefs.notifications,
            darkMode: newPrefs.darkMode,
            soundEffects: newPrefs.soundEffects,
          },
        });
      } catch (error) {
        console.error('Failed to sync preferences:', error);
      }
    }
    
    trackEvent('preferences_updated', { preferences: newPrefs });
  };

  // Toggle preference
  const togglePreference = (key: keyof UserPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPrefs);
    
    // Play sound effect if enabled and we're toggling something other than sound
    if (preferences.soundEffects && key !== 'soundEffects') {
      // Could play a toggle sound here
    }
  };

  // Start editing
  const startEditing = (mode: EditMode) => {
    setEditMode(mode);
    setEditForm({
      ...editForm,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
    });
  };

  // Save profile changes
  const saveProfile = async () => {
    setIsSaving(true);
    
    const newProfile = { ...profile };
    
    if (editMode === 'profile') {
      newProfile.fullName = editForm.fullName;
    } else if (editMode === 'email') {
      newProfile.email = editForm.email;
    } else if (editMode === 'phone') {
      newProfile.phone = editForm.phone;
    }
    
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    
    // Sync to database if connected
    if (isApiConnected && user) {
      try {
        await updateProfile({
          name: newProfile.fullName,
          email: newProfile.email,
          phoneNumber: newProfile.phone,
        });
        trackEvent('profile_updated', { editMode });
      } catch (error) {
        console.error('Failed to sync profile:', error);
      }
    }
    
    setIsSaving(false);
    setEditMode(null);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentUser');
    
    // Clear session to require fresh login
    sessionStorage.removeItem('sessionActive');
    
    logout(); // Call database logout
    trackEvent('logout', {});
    navigate('/');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-sections">
        {/* Account Section */}
        <section className="settings-section">
          <h2>Account</h2>
          
          {/* Profile */}
          <div className="settings-item" onClick={() => startEditing('profile')}>
            <div className="item-info">
              <span className="material-symbols-outlined">person</span>
              <div>
                <h3>Profile</h3>
                <p>{profile.fullName || 'Edit your name and photo'}</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>

          {/* Email */}
          <div className="settings-item" onClick={() => startEditing('email')}>
            <div className="item-info">
              <span className="material-symbols-outlined">mail</span>
              <div>
                <h3>Email</h3>
                <p>{profile.email}</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>

          {/* Phone */}
          <div className="settings-item" onClick={() => startEditing('phone')}>
            <div className="item-info">
              <span className="material-symbols-outlined">phone</span>
              <div>
                <h3>Phone Number</h3>
                <p>{profile.phone}</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="settings-section">
          <h2>Preferences</h2>
          
          <div className="settings-item toggle">
            <div className="item-info">
              <span className="material-symbols-outlined">notifications</span>
              <div>
                <h3>Push Notifications</h3>
                <p>Get alerts for jobs and courses</p>
              </div>
            </div>
            <button 
              className={`toggle-btn ${preferences.notifications ? 'active' : ''}`}
              onClick={() => togglePreference('notifications')}
            >
              <span className="toggle-thumb"></span>
            </button>
          </div>

          <div className="settings-item toggle">
            <div className="item-info">
              <span className="material-symbols-outlined">dark_mode</span>
              <div>
                <h3>Dark Mode</h3>
                <p>Always use dark theme</p>
              </div>
            </div>
            <button 
              className={`toggle-btn ${preferences.darkMode ? 'active' : ''}`}
              onClick={() => togglePreference('darkMode')}
            >
              <span className="toggle-thumb"></span>
            </button>
          </div>

          <div className="settings-item toggle">
            <div className="item-info">
              <span className="material-symbols-outlined">volume_up</span>
              <div>
                <h3>Sound Effects</h3>
                <p>Play sounds for achievements</p>
              </div>
            </div>
            <button 
              className={`toggle-btn ${preferences.soundEffects ? 'active' : ''}`}
              onClick={() => togglePreference('soundEffects')}
            >
              <span className="toggle-thumb"></span>
            </button>
          </div>
        </section>

        {/* Payment Section */}
        <section className="settings-section">
          <h2>Payment</h2>
          
          <div className="settings-item" onClick={() => startEditing('payment')}>
            <div className="item-info">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <div>
                <h3>EcoCash</h3>
                <p>{paymentMethods[0]?.number || 'Add payment method'}</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>

          <div className="settings-item" onClick={() => navigate('/wallet')}>
            <div className="item-info">
              <span className="material-symbols-outlined">receipt_long</span>
              <div>
                <h3>Transaction History</h3>
                <p>View past payments</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>
        </section>

        {/* About Section */}
        <section className="settings-section">
          <h2>About</h2>
          
          <div className="settings-item">
            <div className="item-info">
              <span className="material-symbols-outlined">info</span>
              <div>
                <h3>About Future Work Zimbabwe</h3>
                <p>Version 1.0.0</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>

          <div className="settings-item">
            <div className="item-info">
              <span className="material-symbols-outlined">help</span>
              <div>
                <h3>Help & Support</h3>
                <p>Get assistance</p>
              </div>
            </div>
            <span className="material-symbols-outlined arrow">chevron_right</span>
          </div>
        </section>

        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
          <span className="material-symbols-outlined">logout</span>
          Log Out
        </button>
      </div>

      {/* Edit Modal */}
      {editMode && (
        <div className="edit-modal-overlay" onClick={() => setEditMode(null)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editMode === 'profile' && 'Edit Profile'}
                {editMode === 'email' && 'Change Email'}
                {editMode === 'phone' && 'Change Phone Number'}
                {editMode === 'payment' && 'Payment Method'}
              </h2>
              <button className="close-btn" onClick={() => setEditMode(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-content">
              {editMode === 'profile' && (
                <>
                  <div className="avatar-upload">
                    <div className="avatar-preview">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" />
                      ) : (
                        <span className="material-symbols-outlined">person</span>
                      )}
                    </div>
                    <button className="change-avatar-btn">
                      <span className="material-symbols-outlined">photo_camera</span>
                      Change Photo
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                </>
              )}

              {editMode === 'email' && (
                <>
                  <div className="form-group">
                    <label>Current Email</label>
                    <input type="email" value={profile.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>New Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Enter new email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={editForm.currentPassword}
                      onChange={e => setEditForm({ ...editForm, currentPassword: e.target.value })}
                      placeholder="Enter your password"
                    />
                  </div>
                </>
              )}

              {editMode === 'phone' && (
                <>
                  <div className="form-group">
                    <label>Current Phone</label>
                    <input type="tel" value={profile.phone} disabled />
                  </div>
                  <div className="form-group">
                    <label>New Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+263 77 XXX XXXX"
                    />
                  </div>
                  <p className="helper-text">
                    We'll send a verification code to your new number.
                  </p>
                </>
              )}

              {editMode === 'payment' && (
                <>
                  <div className="payment-method-card">
                    <div className="method-icon">
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                    </div>
                    <div className="method-info">
                      <h4>EcoCash</h4>
                      <p>{paymentMethods[0]?.number}</p>
                    </div>
                    <span className="default-badge">Default</span>
                  </div>
                  
                  <div className="form-group">
                    <label>Add New EcoCash Number</label>
                    <input
                      type="tel"
                      value={editForm.newEcoCashNumber}
                      onChange={e => setEditForm({ ...editForm, newEcoCashNumber: e.target.value })}
                      placeholder="07X XXX XXXX"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setEditMode(null)}>
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={saveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="edit-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="edit-modal confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <h2>Log Out?</h2>
            <p>Are you sure you want to log out of your account?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
