import { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import { settingsAPI } from '../services/api';

const Settings = () => {
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState([]);
  const [paynowConfig, setPaynowConfig] = useState({
    integrationId: '',
    integrationKey: '',
    returnUrl: '',
    resultUrl: '',
  });

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.getAll();
      if (response.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showAlert('Failed to load settings', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadPaynowConfig = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.getPaynowConfig();
      if (response.success) {
        setPaynowConfig(response.data.paynow);
      }
    } catch (error) {
      console.error('Error loading Paynow config:', error);
      showAlert('Failed to load Paynow configuration', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Load Paynow config when payment tab is selected
  useEffect(() => {
    if (activeTab === 'payment') {
      loadPaynowConfig();
    }
  }, [activeTab]);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Get form data
      const formData = new FormData(e.target);
      const appName = formData.get('appName');
      const supportEmail = formData.get('supportEmail');
      const timezone = formData.get('timezone');
      const currency = formData.get('currency');
      const maintenanceMode = formData.get('maintenanceMode') === 'on';

      // Update each setting
      const updates = [
        { key: 'APP_NAME', value: appName },
        { key: 'SUPPORT_EMAIL', value: supportEmail },
        { key: 'TIMEZONE', value: timezone },
        { key: 'CURRENCY', value: currency },
        { key: 'MAINTENANCE_MODE', value: maintenanceMode.toString() },
      ];

      for (const update of updates) {
        try {
          await settingsAPI.update(update.key, { value: update.value });
        } catch (error) {
          // If setting doesn't exist, create it
          if (error.statusCode === 404) {
            await settingsAPI.create({
              key: update.key,
              value: update.value,
              description: `System setting for ${update.key}`,
            });
          } else {
            throw error;
          }
        }
      }

      showAlert('General settings saved successfully', 'success');
      await loadSettings();
    } catch (error) {
      console.error('Error saving general settings:', error);
      showAlert(error.message || 'Failed to save general settings', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaynow = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const config = {
        integrationId: formData.get('integrationId'),
        integrationKey: formData.get('integrationKey'),
        returnUrl: formData.get('returnUrl'),
        resultUrl: formData.get('resultUrl'),
      };

      const response = await settingsAPI.updatePaynowConfig(config);
      if (response.success) {
        showAlert('Paynow configuration saved successfully', 'success');
        setPaynowConfig(response.data.paynow);
      }
    } catch (error) {
      console.error('Error saving Paynow config:', error);
      showAlert(error.message || 'Failed to save Paynow configuration', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleTestPaynow = async () => {
    setSaving(true);
    try {
      const response = await settingsAPI.testPaynowConnection();
      if (response.success) {
        showAlert('Paynow connection test successful!', 'success');
      }
    } catch (error) {
      console.error('Error testing Paynow:', error);
      showAlert(error.message || 'Paynow connection test failed', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const notificationSettings = {
        EMAIL_NEW_ORDER: formData.get('emailNewOrder') === 'on',
        EMAIL_PAYMENT: formData.get('emailPayment') === 'on',
        EMAIL_NEW_CUSTOMER: formData.get('emailNewCustomer') === 'on',
        SYS_LOW_STOCK: formData.get('sysLowStock') === 'on',
        SYS_FAILED_PAYMENT: formData.get('sysFailedPayment') === 'on',
        SYS_SECURITY: formData.get('sysSecurity') === 'on',
      };

      for (const [key, value] of Object.entries(notificationSettings)) {
        try {
          await settingsAPI.update(key, { value: value.toString() });
        } catch (error) {
          if (error.statusCode === 404) {
            await settingsAPI.create({
              key,
              value: value.toString(),
              description: `Notification setting for ${key}`,
            });
          } else {
            throw error;
          }
        }
      }

      showAlert('Notification settings saved successfully', 'success');
      await loadSettings();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showAlert(error.message || 'Failed to save notification settings', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const securitySettings = {
        SESSION_TIMEOUT: formData.get('sessionTimeout'),
        MAX_LOGIN_ATTEMPTS: formData.get('maxLoginAttempts'),
        LOCKOUT_DURATION: formData.get('lockoutDuration'),
        MIN_PASSWORD_LENGTH: formData.get('minPasswordLength'),
        REQUIRE_2FA: formData.get('require2FA') === 'on',
        IP_WHITELIST: formData.get('ipWhitelist') === 'on',
      };

      for (const [key, value] of Object.entries(securitySettings)) {
        try {
          await settingsAPI.update(key, { value: value.toString() });
        } catch (error) {
          if (error.statusCode === 404) {
            await settingsAPI.create({
              key,
              value: value.toString(),
              description: `Security setting for ${key}`,
            });
          } else {
            throw error;
          }
        }
      }

      showAlert('Security settings saved successfully', 'success');
      await loadSettings();
    } catch (error) {
      console.error('Error saving security settings:', error);
      showAlert(error.message || 'Failed to save security settings', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get setting value by key
  const getSettingValue = (key, defaultValue = '') => {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  return (
    <div className="container-fluid">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <h2 className="mb-4">System Settings</h2>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && (
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
                        name="appName"
                        className="form-control"
                        defaultValue={getSettingValue('APP_NAME', 'Payment Bot Admin')}
                        placeholder="Enter application name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Support Email</label>
                      <input
                        type="email"
                        name="supportEmail"
                        className="form-control"
                        defaultValue={getSettingValue('SUPPORT_EMAIL', 'support@example.com')}
                        placeholder="Enter support email"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Timezone</label>
                      <select name="timezone" className="form-select" defaultValue={getSettingValue('TIMEZONE', 'Africa/Harare')}>
                        <option value="Africa/Harare">Africa/Harare (GMT+2)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="America/New_York">America/New York (GMT-5)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Currency</label>
                      <select name="currency" className="form-select" defaultValue={getSettingValue('CURRENCY', 'USD')}>
                        <option value="USD">USD - US Dollar</option>
                        <option value="ZWL">ZWL - Zimbabwean Dollar</option>
                      </select>
                    </div>

                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        name="maintenanceMode"
                        className="form-check-input"
                        id="maintenanceMode"
                        defaultChecked={getSettingValue('MAINTENANCE_MODE') === 'true'}
                      />
                      <label className="form-check-label" htmlFor="maintenanceMode">
                        Maintenance Mode
                      </label>
                      <small className="form-text text-muted d-block">
                        Enable this to temporarily disable all bot operations
                      </small>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
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
                        <input
                          type="checkbox"
                          name="emailNewOrder"
                          className="form-check-input"
                          id="emailNewOrder"
                          defaultChecked={getSettingValue('EMAIL_NEW_ORDER', 'true') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="emailNewOrder">
                          New order received
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          name="emailPayment"
                          className="form-check-input"
                          id="emailPayment"
                          defaultChecked={getSettingValue('EMAIL_PAYMENT', 'true') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="emailPayment">
                          Payment received
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          name="emailNewCustomer"
                          className="form-check-input"
                          id="emailNewCustomer"
                          defaultChecked={getSettingValue('EMAIL_NEW_CUSTOMER') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="emailNewCustomer">
                          New customer registered
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5>System Notifications</h5>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          name="sysLowStock"
                          className="form-check-input"
                          id="sysLowStock"
                          defaultChecked={getSettingValue('SYS_LOW_STOCK', 'true') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="sysLowStock">
                          Low product stock alert
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          name="sysFailedPayment"
                          className="form-check-input"
                          id="sysFailedPayment"
                          defaultChecked={getSettingValue('SYS_FAILED_PAYMENT', 'true') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="sysFailedPayment">
                          Failed payment attempt
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          name="sysSecurity"
                          className="form-check-input"
                          id="sysSecurity"
                          defaultChecked={getSettingValue('SYS_SECURITY', 'true') === 'true'}
                        />
                        <label className="form-check-label" htmlFor="sysSecurity">
                          Security alerts
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
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
                        name="sessionTimeout"
                        className="form-control"
                        defaultValue={getSettingValue('SESSION_TIMEOUT', '30')}
                        min="5"
                        max="1440"
                      />
                      <small className="form-text text-muted">Time before inactive users are logged out</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Max Login Attempts</label>
                      <input
                        type="number"
                        name="maxLoginAttempts"
                        className="form-control"
                        defaultValue={getSettingValue('MAX_LOGIN_ATTEMPTS', '5')}
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
                        name="lockoutDuration"
                        className="form-control"
                        defaultValue={getSettingValue('LOCKOUT_DURATION', '30')}
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
                        name="minPasswordLength"
                        className="form-control"
                        defaultValue={getSettingValue('MIN_PASSWORD_LENGTH', '6')}
                        min="6"
                        max="20"
                      />
                    </div>

                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        name="require2FA"
                        className="form-check-input"
                        id="require2FA"
                        defaultChecked={getSettingValue('REQUIRE_2FA') === 'true'}
                      />
                      <label className="form-check-label" htmlFor="require2FA">
                        Require Two-Factor Authentication for admins
                      </label>
                    </div>

                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        name="ipWhitelist"
                        className="form-check-input"
                        id="ipWhitelist"
                        defaultChecked={getSettingValue('IP_WHITELIST') === 'true'}
                      />
                      <label className="form-check-label" htmlFor="ipWhitelist">
                        Enable IP Whitelist
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Payment Gateways Tab */}
                {activeTab === 'payment' && (
                  <div>
                    <h4 className="mb-4">Payment Gateway Configuration</h4>

                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="mb-0">
                          <i className="fas fa-money-bill-wave me-2 text-primary"></i>
                          Paynow Configuration
                        </h5>
                      </div>
                      <div className="card-body">
                        <form onSubmit={handleSavePaynow}>
                          <div className="mb-3">
                            <label className="form-label">Integration ID</label>
                            <input
                              type="text"
                              name="integrationId"
                              className="form-control"
                              defaultValue={paynowConfig.integrationId}
                              placeholder="Enter Paynow Integration ID"
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Integration Key</label>
                            <input
                              type="password"
                              name="integrationKey"
                              className="form-control"
                              defaultValue={paynowConfig.integrationKey}
                              placeholder="Enter Paynow Integration Key"
                              required
                            />
                            <small className="form-text text-muted">This value is encrypted in the database</small>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Return URL</label>
                            <input
                              type="url"
                              name="returnUrl"
                              className="form-control"
                              defaultValue={paynowConfig.returnUrl}
                              placeholder="https://yourdomain.com/payment/return"
                              required
                            />
                            <small className="form-text text-muted">
                              URL where users are redirected after payment
                            </small>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Result URL</label>
                            <input
                              type="url"
                              name="resultUrl"
                              className="form-control"
                              defaultValue={paynowConfig.resultUrl}
                              placeholder="https://yourdomain.com/api/payments/paynow/webhook"
                              required
                            />
                            <small className="form-text text-muted">
                              Webhook URL for payment notifications from Paynow
                            </small>
                          </div>

                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                              {saving ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-save me-2"></i>
                                  Save Configuration
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={handleTestPaynow}
                              disabled={saving}
                            >
                              <i className="fas fa-check-circle me-2"></i>
                              Test Connection
                            </button>
                          </div>
                        </form>
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
                      Bot tokens and API keys are configured in the backend for security. Check the system settings
                      in the database for:
                      <ul className="mb-0 mt-2">
                        <li>WHATSAPP_PHONE_NUMBER_ID</li>
                        <li>WHATSAPP_ACCESS_TOKEN</li>
                        <li>TELEGRAM_BOT_TOKEN</li>
                      </ul>
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
      )}
    </div>
  );
};

export default Settings;
