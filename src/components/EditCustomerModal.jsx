import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'bootstrap';
import { customersAPI } from '../services/api';
import Alert from './Alert';

const EditCustomerModal = ({ customer, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    idNumber: '',
    telegramId: '',
    whatsappId: '',
    isActive: true,
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [bsModal, setBsModal] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        surname: customer.surname || '',
        email: customer.email || '',
        idNumber: customer.idNumber || '',
        telegramId: customer.telegramId || '',
        whatsappId: customer.whatsappId || '',
        isActive: customer.isActive,
        isVerified: customer.isVerified,
      });
    }
  }, [customer]);

  useEffect(() => {
    const modalElement = document.getElementById('editCustomerModal');
    const modal = new Modal(modalElement, {
      backdrop: 'static',
      keyboard: false,
    });
    modal.show();
    modalElement.addEventListener('hidden.bs.modal', onClose);
    setBsModal(modal);

    return () => {
      modalElement.removeEventListener('hidden.bs.modal', onClose);
      modal.dispose();
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await customersAPI.update(customer.id, formData);
      if (response && response.success) {
        onUpdate(response.data.customer);
        bsModal.hide();
      } else {
        setAlert({ message: response.message || 'Failed to update customer', type: 'danger' });
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setAlert({ message: error.message || 'Failed to update customer', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="editCustomerModal" tabIndex="-1" aria-labelledby="editCustomerModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editCustomerModalLabel">Edit Customer: {customer?.name || customer?.phoneNumber}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => bsModal.hide()}></button>
          </div>
          <div className="modal-body">
            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="surname" className="form-label">Surname</label>
                  <input
                    type="text"
                    className="form-control"
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="idNumber" className="form-label">ID Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="telegramId" className="form-label">Telegram ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="telegramId"
                    name="telegramId"
                    value={formData.telegramId}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="whatsappId" className="form-label">WhatsApp ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="whatsappId"
                    name="whatsappId"
                    value={formData.whatsappId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Is Active
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isVerified"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isVerified">
                      Is Verified
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => bsModal.hide()}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

EditCustomerModal.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default EditCustomerModal;
