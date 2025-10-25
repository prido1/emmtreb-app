import React, { useState } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/helpers';

const RegistrationModal = ({ registration, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!registration) {
    return null;
  }

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this registration?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/admin/customers/registrations/${registration.id}/approve`);

      if (response.data.success) {
        alert('Registration approved successfully!');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      setError(error.response?.data?.message || 'Failed to approve registration');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    if (rejectionReason.trim().length < 5) {
      setError('Rejection reason must be at least 5 characters');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this registration?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/api/admin/customers/registrations/${registration.id}/reject`, {
        reason: rejectionReason.trim()
      });

      if (response.data.success) {
        alert('Registration rejected successfully!');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      setError(error.response?.data?.message || 'Failed to reject registration');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectForm(true);
    setError(null);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectionReason('');
    setError(null);
  };

  const getIdDocumentUrl = () => {
    if (!registration.idDocumentPath) return null;

    // Extract filename from the full path
    const pathParts = registration.idDocumentPath.split(/[/\\]/);
    const filename = pathParts[pathParts.length - 1];

    // Construct the URL to the backend
    return `${api.defaults.baseURL}/uploads/id-documents/${filename}`;
  };

  const getPlatformBadgeClass = (platform) => {
    switch (platform) {
      case 'whatsapp':
        return 'bg-success';
      case 'telegram':
        return 'bg-info';
      case 'web':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Registration Details</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            )}

            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Name:</strong>{' '}
                  {registration.name && registration.surname
                    ? `${registration.name} ${registration.surname}`
                    : registration.name || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>ID Number:</strong> {registration.idNumber || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {registration.email || 'N/A'}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Phone Number:</strong> {registration.phoneNumber}
                </p>
                <p className="mb-2">
                  <strong>Platform:</strong>{' '}
                  <span className={`badge ${getPlatformBadgeClass(registration.platform)}`}>
                    {registration.platform}
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Registration Date:</strong> {formatDate(registration.createdAt)}
                </p>
              </div>
            </div>

            {registration.idDocumentPath && (
              <div className="mt-3">
                <h6>ID Document:</h6>
                <div className="border rounded p-2 text-center" style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <img
                    src={getIdDocumentUrl()}
                    alt="ID Document"
                    className="img-fluid"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }}>
                    <p className="text-muted">Unable to load ID document image</p>
                    <p className="small">{registration.idDocumentPath}</p>
                  </div>
                </div>
              </div>
            )}

            {showRejectForm && (
              <div className="mt-3">
                <hr />
                <h6>Rejection Reason:</h6>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Please provide a reason for rejecting this registration (minimum 5 characters)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {!showRejectForm ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRejectClick}
                  disabled={loading}
                >
                  <i className="fas fa-times me-1"></i>Reject
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Approving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-1"></i>Approve
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelReject}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times me-1"></i>Confirm Rejection
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
