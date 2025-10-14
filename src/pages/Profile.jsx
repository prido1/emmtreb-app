import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { authAPI } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile update form
  const [profileForm, setProfileForm] = useState({
    email: '',
    fullName: '',
    telegramId: '',
    whatsappId: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      if (response.success) {
        setProfile(response.data.admin);
        setProfileForm({
          email: response.data.admin.email || '',
          fullName: response.data.admin.fullName || '',
          telegramId: response.data.admin.telegramId || '',
          whatsappId: response.data.admin.whatsappId || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setAlert({ message: 'Failed to load profile', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      setAlert(null);

      const response = await authAPI.updateProfile({
        email: profileForm.email || null,
        fullName: profileForm.fullName || null,
        telegramId: profileForm.telegramId || null,
        whatsappId: profileForm.whatsappId || null,
      });

      if (response.success) {
        setProfile(response.data.admin);
        setAlert({ message: 'Profile updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setAlert({
        message: error.message || 'Failed to update profile',
        type: 'danger',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({ message: 'New passwords do not match', type: 'danger' });
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 8) {
      setAlert({ message: 'New password must be at least 8 characters long', type: 'danger' });
      return;
    }

    try {
      setPasswordLoading(true);
      setAlert(null);

      const response = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setAlert({ message: 'Password changed successfully', type: 'success' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setAlert({
        message: error.message || 'Failed to change password',
        type: 'danger',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-section">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="fas fa-user-circle me-2"></i>
          Profile Settings
        </h1>
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="row">
        <div className="col-md-3">
          {/* Profile Info Card */}
          <div className="card shadow mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-user-circle" style={{ fontSize: '80px', color: '#4e73df' }}></i>
              </div>
              <h5 className="mb-1">{profile?.username}</h5>
              <p className="text-muted mb-2">{profile?.fullName || 'No name set'}</p>
              <span className={`badge bg-${profile?.role === 'super_admin' ? 'danger' : profile?.role === 'admin' ? 'primary' : 'secondary'}`}>
                {profile?.role?.replace('_', ' ').toUpperCase()}
              </span>
              <hr />
              <div className="text-start">
                <small className="text-muted">
                  <i className="fas fa-calendar me-2"></i>
                  Joined: {new Date(profile?.createdAt).toLocaleDateString()}
                </small>
                <br />
                <small className="text-muted">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Last Login: {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : 'N/A'}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user me-1"></i>
                Profile Information
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <i className="fas fa-lock me-1"></i>
                Change Password
              </button>
            </li>
          </ul>

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="card shadow">
              <div className="card-header">
                <h6 className="m-0 font-weight-bold text-primary">
                  <i className="fas fa-user me-2"></i>
                  Update Profile Information
                </h6>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="fas fa-user me-1"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={profile?.username || ''}
                      disabled
                      readOnly
                    />
                    <small className="text-muted">Username cannot be changed</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      <i className="fas fa-id-card me-1"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="Enter your full name"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-1"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your email address"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="telegramId" className="form-label">
                      <i className="fab fa-telegram me-1"></i>
                      Telegram ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="telegramId"
                      placeholder="Enter your Telegram ID for notifications"
                      value={profileForm.telegramId}
                      onChange={(e) => setProfileForm({ ...profileForm, telegramId: e.target.value })}
                      disabled={profileLoading}
                    />
                    <small className="text-muted">Your Telegram user ID (numeric) for receiving admin notifications</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="whatsappId" className="form-label">
                      <i className="fab fa-whatsapp me-1"></i>
                      WhatsApp ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="whatsappId"
                      placeholder="Enter your WhatsApp ID for notifications"
                      value={profileForm.whatsappId}
                      onChange={(e) => setProfileForm({ ...profileForm, whatsappId: e.target.value })}
                      disabled={profileLoading}
                    />
                    <small className="text-muted">Your WhatsApp phone number ID for receiving admin notifications</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      <i className="fas fa-user-tag me-1"></i>
                      Role
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      value={profile?.role?.replace('_', ' ').toUpperCase() || ''}
                      disabled
                      readOnly
                    />
                    <small className="text-muted">Role can only be changed by a super admin</small>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="card shadow">
              <div className="card-header">
                <h6 className="m-0 font-weight-bold text-primary">
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </h6>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      <i className="fas fa-key me-1"></i>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      disabled={passwordLoading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      <i className="fas fa-lock me-1"></i>
                      New Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      placeholder="Enter your new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      disabled={passwordLoading}
                      minLength="8"
                      required
                    />
                    <small className="text-muted">
                      Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters
                    </small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="fas fa-lock me-1"></i>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm your new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      disabled={passwordLoading}
                      minLength="8"
                      required
                    />
                  </div>

                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Password Requirements:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Minimum 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character</li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key me-1"></i>
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;