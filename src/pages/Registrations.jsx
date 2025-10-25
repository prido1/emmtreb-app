import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import RegistrationModal from '../components/RegistrationModal';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/customers/registrations/pending');
      setRegistrations(response.data.customers);
    } catch (err) {
      setError(err.message);
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

  if (loading && registrations.length === 0) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="container-fluid">
        <h1 className="h3 mb-4 text-gray-800">Pending Registrations</h1>
        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length > 0 ? (
                    registrations.map((registration) => (
                      <tr key={registration.id}>
                        <td>{`${registration.firstName} ${registration.lastName}`}</td>
                        <td>{registration.email}</td>
                        <td>{registration.phoneNumber}</td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => handleViewClick(registration)}>View</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No pending registrations</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
