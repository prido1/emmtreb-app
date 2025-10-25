import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../services/api';
import RegistrationModal from '../components/RegistrationModal';
import { formatDate } from '../utils/helpers';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/admin/customers/registrations/pending');
      setRegistrations(response.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleViewClick = (registration) => {
    setSelectedRegistration(registration);
  };

  const handleCloseModal = () => {
    setSelectedRegistration(null);
  };

  const handleUpdate = () => {
    handleCloseModal();
    fetchRegistrations();
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
    <>
      <div className="content-section">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">Pending Registrations</h1>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={fetchRegistrations}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>Refresh
          </button>
        </div>

        {error && (
          <Alert
            message={error}
            type="danger"
            onClose={() => setError(null)}
          />
        )}

        <div className="card shadow mb-4">
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>ID Number</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Platform</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length > 0 ? (
                      registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td>
                            {registration.name && registration.surname
                              ? `${registration.name} ${registration.surname}`
                              : registration.name || 'N/A'}
                          </td>
                          <td>{registration.idNumber || 'N/A'}</td>
                          <td>{registration.email || 'N/A'}</td>
                          <td>{registration.phoneNumber}</td>
                          <td>
                            <span className={`badge ${getPlatformBadgeClass(registration.platform)}`}>
                              {registration.platform}
                            </span>
                          </td>
                          <td>{formatDate(registration.createdAt)}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleViewClick(registration)}
                            >
                              <i className="fas fa-eye me-1"></i>View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No pending registrations
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRegistration && (
        <RegistrationModal
          registration={selectedRegistration}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
};

export default Registrations;
