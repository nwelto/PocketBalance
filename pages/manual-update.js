import React, { useState, useEffect } from 'react';
import {
  Button, Form, Modal, Table,
} from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { firebase } from '../utils/client';

function ManualUpdate() {
  const { user, userLoading } = useAuth();
  const [payAmount, setPayAmount] = useState(0);
  const [manualAmount, setManualAmount] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal, setShowModal] = useState(false); // Added this
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    if (user && !userLoading) {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
          setPayAmount(snapshot.val());
        }
      });

      const categoriesRef = firebase.database().ref(`/users/${user.fbUser.uid}/categories`);
      categoriesRef.on('value', (snapshot) => {
        const categoriesList = [];
        snapshot.forEach((childSnapshot) => {
          categoriesList.push({ key: childSnapshot.key, name: childSnapshot.val() });
        });
        setCategories(categoriesList);
      });

      // Cleanup listeners on unmount
      return () => {
        payRef.off();
        categoriesRef.off();
      };
    }

    // Explicitly return undefined if the user is not logged in or still loading
    return undefined;
  }, [user, userLoading]);

  const handleManualChange = () => {
    if (agree) {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      const newAmount = parseFloat(manualAmount);
      if (!Number.isNaN(newAmount)) {
        payRef.set(newAmount);
        setManualAmount('');
        setAgree(false);
        setShowModal(false);
      }
    }
  };

  const handleReset = () => {
    if (agree) {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.set(0);
      setManualAmount('');
      setAgree(false);
      setShowModal(false);
    }
  };

  const handleShowCategoryModal = () => setShowCategoryModal(true);
  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setNewCategory('');
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categoriesRef = firebase.database().ref(`/users/${user.fbUser.uid}/categories`);
      categoriesRef.push(newCategory.trim());
      setShowCategoryModal(false);
      setNewCategory('');
    }
  };

  const handleShowEditModal = (category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
    setShowEditModal(true);
  };

  const handleUpdateCategory = () => {
    if (newCategory.trim() && editingCategory) {
      const categoryRef = firebase.database().ref(`/users/${editingCategory.key}/categories/${editingCategory.key}`);
      categoryRef.set(newCategory.trim());
      setShowEditModal(false);
      setEditingCategory(null);
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (key) => {
    const categoryRef = firebase.database().ref(`/users/${user.fbUser.uid}/categories/${key}`);
    categoryRef.remove();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setNewCategory('');
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

      <h2 className="mt-5">Manage Categories</h2>
      <Button variant="success" onClick={handleShowCategoryModal} className="mb-3">
        Add New Category
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.key}>
              <td>{category.name}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleShowEditModal(category)}>
                  Edit
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDeleteCategory(category.key)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showCategoryModal} onHide={handleCloseCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCategoryModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
          >
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Edit category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateCategory}
            disabled={!newCategory.trim()}
          >
            Update Category
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Manual Adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to manually adjust your pay? This could lead to information on your charts.</p>
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
