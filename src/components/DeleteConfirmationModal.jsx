import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'bootstrap';

const DeleteConfirmationModal = ({ customer, onClose, onConfirm }) => {
  const [bsModal, setBsModal] = useState(null);

  useEffect(() => {
    const modalElement = document.getElementById('deleteConfirmationModal');
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

  return (
    <div className="modal fade" id="deleteConfirmationModal" tabIndex="-1" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="deleteConfirmationModalLabel">Confirm Deletion</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => bsModal.hide()}></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete the customer: <strong>{customer?.name || customer?.phoneNumber}</strong>?</p>
            <p className="text-danger">This action is irreversible.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => bsModal.hide()}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmationModal.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteConfirmationModal;
