import React, { useState, useEffect } from 'react';
import {
  Table, Button, Form, Modal,
} from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { firebase } from '../utils/client';

function Expenses() {
  const { user, userLoading } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(['Groceries', 'Bullshit', 'Health']);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (user && !userLoading) {
      const transactionsRef = firebase.database().ref(`/users/${user.fbUser.uid}/transactions`);
      transactionsRef.orderByChild('type').equalTo('expense').on('value', (snapshot) => {
        const expensesList = [];
        snapshot.forEach((childSnapshot) => {
          expensesList.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });
        setExpenses(expensesList);
      });
    }
  }, [user, userLoading]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleCategoryChange = (e) => {
    if (e.target.value === 'Add New Category') {
      setShowModal(true);
    } else {
      setCategory(e.target.value);
    }
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory = category || newCategory;
    const newExpense = {
      amount: parseFloat(amount),
      description: finalCategory,
      date: new Date().toISOString(),
      type: 'expense',
    };

    if (!Number.isNaN(newExpense.amount) && finalCategory.trim() !== '') {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.once('value').then((snapshot) => {
        const currentPayAmount = snapshot.val() || 0;
        payRef.set(currentPayAmount - newExpense.amount);
      });

      firebase.database().ref(`/users/${user.fbUser.uid}/transactions`).push(newExpense);

      if (newCategory && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        setCategory(newCategory); // Automatically select the new category
      }

      setAmount('');
      setCategory('Groceries');
      setNewCategory('');
      setShowModal(false);
    }
  };

  const handleDelete = (key, transactionAmount) => {
    const transactionsRef = firebase.database().ref(`/users/${user.fbUser.uid}/transactions/${key}`);
    transactionsRef.remove();

    const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
    payRef.once('value').then((snapshot) => {
      const currentPayAmount = snapshot.val() || 0;
      const updatedPayAmount = currentPayAmount + transactionAmount;
      payRef.set(updatedPayAmount);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCategory('');
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory]);
      setCategory(newCategory); // Set the new category as selected
      setShowModal(false);
    }
  };

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
      <h2>Add Expense</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Control as="select" value={category} onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Add New Category">Add New Category</option>
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit" size="lg" className="mt-3">
          Add Expense
        </Button>
      </Form>

      <h2 className="mt-5">Expenses</h2>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.key}>
              <td>{expense.description}</td>
              <td style={{ color: 'red' }}>
                -${expense.amount.toFixed(2)}
              </td>
              <td>{new Date(expense.date).toLocaleDateString()}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(expense.key, expense.amount)}>
                  X
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter new category"
              value={newCategory}
              onChange={handleNewCategoryChange}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddNewCategory}
            disabled={!newCategory.trim()}
          >
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Expenses;
