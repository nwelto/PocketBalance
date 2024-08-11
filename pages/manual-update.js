import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { firebase } from '../utils/client';

function ManualUpdate() {
  const { user, userLoading } = useAuth();
  const [payAmount, setPayAmount] = useState(0);
  const [manualAmount, setManualAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (user && !userLoading) {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
          setPayAmount(snapshot.val());
        }
      });

      // Cleanup function to remove listener when component unmounts
      return () => payRef.off();
    }

    // Return undefined explicitly if no user is logged in or userLoading is true
    return undefined;
  }, [user, userLoading]);

  const handleManualChange = () => {
    if (agree) {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      const newAmount = parseFloat(manualAmount);
      if (!Number.isNaN(newAmount)) {
        payRef.set(newAmount);
        setShowModal(false);
        setManualAmount('');
        setAgree(false);
      }
    }
  };

  const handleReset = () => {
    if (agree) {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.set(0);
      setShowModal(false);
      setManualAmount('');
      setAgree(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  if (userLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please log in.</p>;
  }

  return (
    <div
      className="text-center d-flex flex-column justify-content-center align-content-center"
      style={{
        height: '90vh', padding: '30px', maxWidth: '600px', margin: '0 auto',
      }}
    >
      <h2>Manual Update</h2>
      <h3>Current Pay: ${payAmount.toFixed(2)}</h3>
      <Form>
        <Form.Group>
          <Form.Control
            type="number"
            step="0.01"
            placeholder="Enter new pay amount"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" className="mt-3" onClick={handleShowModal}>
          Update Pay
        </Button>
        <Button variant="danger" className="mt-3 ml-2" onClick={handleShowModal}>
          Reset Pay
        </Button>
      </Form>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Manual Adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to manually adjust your pay? This could lead to inaccurate information on your charts.</p>
          <Form.Check
            type="checkbox"
            label="I agree"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={manualAmount ? handleManualChange : handleReset}
            disabled={!agree}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManualUpdate;
