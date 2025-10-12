import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import AdminModal from '../components/AdminModal';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminManagement = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    active: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Check permissions
  const canManageAdmins = user?.role === 'super_admin';

  useEffect(() => {
    fetchRoles();
    fetchAdmins();
  }, [filters, pagination.page]);

  const fetchRoles = async () => {
    try {
      const response = await adminAPI.getRoles();
      if (response.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await adminAPI.getAll(params);
      if (response.success) {
        setAdmins(response.data.admins);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination,
        }));
      }
    } catch (error) {
      showAlert('Failed to load admins: ' + (error.message || 'Unknown error'), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreateClick = () => {
    if (!canManageAdmins) {
      showAlert('You do not have permission to manage admins', 'danger');
      return;
    }
    setSelectedAdmin(null);
    setShowModal(true);
  };

  const handleEditClick = (admin) => {
    if (!canManageAdmins) {
      showAlert('You do not have permission to manage admins', 'danger');
      return;
    }
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      let response;
      if (selectedAdmin) {
        // Update existing admin
        response = await adminAPI.update(selectedAdmin.id, formData);
      } else {
        // Create new admin
        response = await adminAPI.create(formData);
      }

      if (response.success) {
        showAlert(
          selectedAdmin ? 'Admin updated successfully' : 'Admin created successfully',
          'success'
        );
        fetchAdmins();
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to save admin';
      showAlert(errorMessage, 'danger');
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleDelete = async (adminId, adminUsername) => {
    if (!canManageAdmins) {
      showAlert('You do not have permission to manage admins', 'danger');
      return;
    }

    if (adminId === user?.id) {
      showAlert('You cannot delete your own account', 'danger');
      return;
    }

    if (!confirm(`Are you sure you want to delete admin "${adminUsername}"?`)) {
      return;
    }

    try {
      const response = await adminAPI.delete(adminId);
      if (response.success) {
        showAlert('Admin deleted successfully', 'success');
        fetchAdmins();
      }
    } catch (error) {
      showAlert('Failed to delete admin: ' + (error.message || 'Unknown error'), 'danger');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'danger';
      case 'admin':
        return 'primary';
      case 'operator':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading && admins.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Management</h2>
        {canManageAdmins && (
          <button className="btn btn-primary" onClick={handleCreateClick}>
            <i className="fas fa-plus me-2"></i>
            Create Admin
          </button>
        )}
      </div>

      {!canManageAdmins && (
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          You have view-only access to this page. Only Super Admins can manage admin accounts.
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="active"
                value={filters.active}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  {canManageAdmins && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={canManageAdmins ? 8 : 7} className="text-center py-4">
                      <i className="fas fa-users fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No admins found</p>
                    </td>
                  </tr>
                ) : (
                  admins.map(admin => (
                    <tr key={admin.id}>
                      <td>
                        <strong>{admin.username}</strong>
                        {admin.id === user?.id && (
                          <span className="badge bg-success ms-2">You</span>
                        )}
                      </td>
                      <td>{admin.fullName || '-'}</td>
                      <td>{admin.email || '-'}</td>
                      <td>
                        <span className={`badge bg-${getRoleBadgeColor(admin.role)}`}>
                          {admin.roleDisplay}
                        </span>
                      </td>
                      <td>
                        {admin.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                        {admin.isLocked && (
                          <span className="badge bg-danger ms-1">Locked</span>
                        )}
                      </td>
                      <td>
                        <small>{formatDate(admin.lastLoginAt)}</small>
                        {admin.lastLoginIp && (
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {admin.lastLoginIp}
                          </div>
                        )}
                      </td>
                      <td>
                        <small>{formatDate(admin.createdAt)}</small>
                      </td>
                      {canManageAdmins && (
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEditClick(admin)}
                            title="Edit Admin"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {admin.id !== user?.id && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(admin.id, admin.username)}
                              title="Delete Admin"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <nav aria-label="Page navigation" className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(pagination.pages)].map((_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Admin Modal */}
      <AdminModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        admin={selectedAdmin}
        roles={roles}
      />
    </div>
  );
};

export default AdminManagement;
