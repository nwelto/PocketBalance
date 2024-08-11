import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { firebase } from '../utils/client';

function Expenses() {
  const { user, userLoading } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

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

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
      type: 'expense',
    };

    if (!Number.isNaN(newExpense.amount) && newExpense.description.trim() !== '') {
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.once('value').then((snapshot) => {
        const currentPayAmount = snapshot.val() || 0;
        payRef.set(currentPayAmount - newExpense.amount);
      });

      firebase.database().ref(`/users/${user.fbUser.uid}/transactions`).push(newExpense);

      setAmount('');
      setDescription('');
    }
  };

  const handleDelete = (key, transactionAmount) => {
    const transactionsRef = firebase.database().ref(`/users/${user.fbUser.uid}/transactions/${key}`);
    transactionsRef.remove();

    const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
    payRef.once('value').then((snapshot) => {
      const currentPayAmount = snapshot.val() || 0;
      const updatedPayAmount = currentPayAmount + transactionAmount; // Adding the expense amount back
      payRef.set(updatedPayAmount);
    });
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
          <Form.Control
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={handleDescriptionChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" size="lg" className="mt-3">
          Add Expense
        </Button>
      </Form>

      <h2 className="mt-5">Expenses</h2>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Description</th>
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
    </div>
  );
}

export default Expenses;
