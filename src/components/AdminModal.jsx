import { useState, useEffect } from 'react';

const AdminModal = ({ show, onClose, onSave, admin, roles }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'operator',
    isActive: true,
    telegramId: '',
    whatsappId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin) {
      // Edit mode
      setFormData({
        username: admin.username || '',
        password: '', // Don't populate password for security
        email: admin.email || '',
        fullName: admin.fullName || '',
        role: admin.role || 'operator',
        isActive: admin.isActive !== undefined ? admin.isActive : true,
        telegramId: admin.telegramId || '',
        whatsappId: admin.whatsappId || '',
      });
    } else {
      // Create mode
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        role: 'operator',
        isActive: true,
        telegramId: '',
        whatsappId: '',
      });
    }
    setErrors({});
  }, [admin, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!admin && !formData.password) {
      newErrors.password = 'Password is required for new admins';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data - don't send empty password for updates
      const dataToSend = { ...formData };
      if (admin && !dataToSend.password) {
        delete dataToSend.password;
      }

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save admin' });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {admin ? 'Edit Admin' : 'Create New Admin'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {errors.submit && (
                <div className="alert alert-danger" role="alert">
                  {errors.submit}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!!admin} // Can't change username once created
                  required
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password {!admin && <span className="text-danger">*</span>}
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={admin ? 'Leave blank to keep current password' : ''}
                  required={!admin}
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
                <small className="form-text text-muted">
                  Minimum 6 characters
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
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
                  name="telegramId"
                  value={formData.telegramId}
                  onChange={handleChange}
                  placeholder="Enter Telegram user ID for notifications"
                />
                <small className="form-text text-muted">
                  Numeric Telegram user ID for receiving admin notifications
                </small>
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
                  name="whatsappId"
                  value={formData.whatsappId}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp phone number ID"
                />
                <small className="form-text text-muted">
                  WhatsApp phone number ID for receiving admin notifications
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  {roles && roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {formData.role && roles && (
                  <small className="form-text text-muted">
                    Permissions: {roles.find(r => r.value === formData.role)?.permissions.join(', ')}
                  </small>
                )}
              </div>

              {admin && (
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active
                  </label>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  admin ? 'Update Admin' : 'Create Admin'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
