import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import api from '../services/api';

const RegistrationModal = ({ registration, onClose, onUpdate }) => {
  if (!registration) {
    return null;
  }

  const handleApprove = async () => {
    try {
      await api.post(`/customers/${registration.id}/approve`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error approving registration:', error);
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/customers/${registration.id}/reject`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting registration:', error);
    }
  };

  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Registration Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Name:</strong> {registration.firstName} {registration.lastName}</p>
        <p><strong>Email:</strong> {registration.email}</p>
        <p><strong>Phone Number:</strong> {registration.phoneNumber}</p>
        {/* Add more fields as needed */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="danger" onClick={handleReject}>
          Reject
        </Button>
        <Button variant="success" onClick={handleApprove}>
          Approve
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RegistrationModal;
