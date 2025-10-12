import { useState } from 'react';
import Alert from '../components/Alert';

const Settings = () => {
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    // TODO: Implement general settings save
    showAlert('General settings saved successfully', 'success');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    // TODO: Implement notification settings save
    showAlert('Notification settings saved successfully', 'success');
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    // TODO: Implement security settings save
    showAlert('Security settings saved successfully', 'success');
  };

  return (
    <div className="container-fluid">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <h2 className="mb-4">System Settings</h2>

      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <i className="fas fa-cog me-2"></i>
              General
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="fas fa-bell me-2"></i>
              Notifications
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="fas fa-shield-alt me-2"></i>
              Security
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <i className="fas fa-credit-card me-2"></i>
              Payment Gateways
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'bot' ? 'active' : ''}`}
              onClick={() => setActiveTab('bot')}
            >
              <i className="fas fa-robot me-2"></i>
              Bot Configuration
            </button>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              {/* General Settings Tab */}
              {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneral}>
                  <h4 className="mb-4">General Settings</h4>

                  <div className="mb-3">
                    <label className="form-label">Application Name</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue="Payment Bot Admin"
                      placeholder="Enter application name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Support Email</label>
                    <input
                      type="email"
                      className="form-control"
                      defaultValue="support@example.com"
                      placeholder="Enter support email"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Timezone</label>
                    <select className="form-select">
                      <option value="Africa/Harare">Africa/Harare (GMT+2)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">America/New York (GMT-5)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Currency</label>
                    <select className="form-select">
                      <option value="USD">USD - US Dollar</option>
                      <option value="ZWL">ZWL - Zimbabwean Dollar</option>
                    </select>
                  </div>

                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="maintenanceMode" />
                    <label className="form-check-label" htmlFor="maintenanceMode">
                      Maintenance Mode
                    </label>
                    <small className="form-text text-muted d-block">
                      Enable this to temporarily disable all bot operations
                    </small>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </button>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleSaveNotifications}>
                  <h4 className="mb-4">Notification Settings</h4>

                  <div className="mb-4">
                    <h5>Email Notifications</h5>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="emailNewOrder" defaultChecked />
                      <label className="form-check-label" htmlFor="emailNewOrder">
                        New order received
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="emailPayment" defaultChecked />
                      <label className="form-check-label" htmlFor="emailPayment">
                        Payment received
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="emailNewCustomer" />
                      <label className="form-check-label" htmlFor="emailNewCustomer">
                        New customer registered
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5>System Notifications</h5>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="sysLowStock" defaultChecked />
                      <label className="form-check-label" htmlFor="sysLowStock">
                        Low product stock alert
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="sysFailedPayment" defaultChecked />
                      <label className="form-check-label" htmlFor="sysFailedPayment">
                        Failed payment attempt
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="sysSecurity" defaultChecked />
                      <label className="form-check-label" htmlFor="sysSecurity">
                        Security alerts
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </button>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handleSaveSecurity}>
                  <h4 className="mb-4">Security Settings</h4>

                  <div className="mb-3">
                    <label className="form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue="30"
                      min="5"
                      max="1440"
                    />
                    <small className="form-text text-muted">
                      Time before inactive users are logged out
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Max Login Attempts</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue="5"
                      min="3"
                      max="10"
                    />
                    <small className="form-text text-muted">
                      Number of failed login attempts before account lockout
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue="30"
                      min="5"
                      max="1440"
                    />
                    <small className="form-text text-muted">
                      How long accounts remain locked after max failed attempts
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Minimum Password Length</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue="6"
                      min="6"
                      max="20"
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="require2FA" />
                    <label className="form-check-label" htmlFor="require2FA">
                      Require Two-Factor Authentication for admins
                    </label>
                  </div>

                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="ipWhitelist" />
                    <label className="form-check-label" htmlFor="ipWhitelist">
                      Enable IP Whitelist
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </button>
                </form>
              )}

              {/* Payment Gateways Tab */}
              {activeTab === 'payment' && (
                <div>
                  <h4 className="mb-4">Payment Gateway Configuration</h4>

                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Configure your payment gateway settings in the backend .env file.
                  </div>

                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            <i className="fas fa-money-bill-wave me-2 text-primary"></i>
                            Paynow
                          </h5>
                          <p className="text-muted mb-0">Zimbabwe payment gateway</p>
                        </div>
                        <span className="badge bg-success">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            <i className="fas fa-wallet me-2 text-info"></i>
                            Wallet System
                          </h5>
                          <p className="text-muted mb-0">Internal wallet for customers</p>
                        </div>
                        <span className="badge bg-success">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bot Configuration Tab */}
              {activeTab === 'bot' && (
                <div>
                  <h4 className="mb-4">Bot Configuration</h4>

                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Bot tokens and API keys are configured in the backend .env file for security.
                  </div>

                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            <i className="fab fa-whatsapp me-2 text-success"></i>
                            WhatsApp Bot
                          </h5>
                          <p className="text-muted mb-0">Meta Business API integration</p>
                        </div>
                        <span className="badge bg-success">Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">
                            <i className="fab fa-telegram me-2 text-primary"></i>
                            Telegram Bot
                          </h5>
                          <p className="text-muted mb-0">Telegram Bot API integration</p>
                        </div>
                        <span className="badge bg-success">Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5>Bot Behavior</h5>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="autoRespond" defaultChecked />
                      <label className="form-check-label" htmlFor="autoRespond">
                        Enable automatic responses
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="sendReceipts" defaultChecked />
                      <label className="form-check-label" htmlFor="sendReceipts">
                        Send payment receipts automatically
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input type="checkbox" className="form-check-input" id="orderConfirmation" defaultChecked />
                      <label className="form-check-label" htmlFor="orderConfirmation">
                        Require order confirmation before processing
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
