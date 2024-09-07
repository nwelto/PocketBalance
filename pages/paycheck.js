import React, { useState, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import {
  getIncome, setIncome, addTransaction, getTransactions, deleteTransaction,
} from '../API/income';

function Paycheck() {
  const { user, userLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ amount: '', category: 'Paycheck' });
  const [currentIncome, setCurrentIncome] = useState(0);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user && !userLoading) {
      // Fetch income from Firebase
      getIncome(user.fbUser.uid).then((fetchedIncome) => {
        setCurrentIncome(Number(fetchedIncome)); // Ensure the income is a number
      });

      // Fetch transactions from Firebase
      getTransactions(user.fbUser.uid).then((fetchedTransactions) => {
        setTransactions(fetchedTransactions || []);
      });
    }
  }, [user, userLoading]);

  const handleAddTransaction = async () => {
    const amount = parseFloat(newTransaction.amount);
    if (!Number.isNaN(amount)) {
      const transaction = {
        id: `${newTransaction.category}-${Date.now()}`,
        ...newTransaction,
        amount,
      };

      // Add the transaction to Firebase
      await addTransaction(user.fbUser.uid, transaction);

      // Update the transaction list and income locally
      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);

      // Update the current income
      const newIncome = currentIncome + amount;
      setCurrentIncome(newIncome);
      await setIncome(user.fbUser.uid, newIncome);

      // Reset the input
      setNewTransaction({ amount: '', category: 'Paycheck' });
    } else {
      alert('Please enter a valid number');
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    const updatedTransactions = transactions.filter((t) => t.id !== transaction.id);
    setTransactions(updatedTransactions);

    // Update the current income by subtracting the deleted amount
    const newIncome = currentIncome - transaction.amount;
    setCurrentIncome(newIncome);
    await setIncome(user.fbUser.uid, newIncome);

    // Delete the transaction from Firebase
    await deleteTransaction(user.fbUser.uid, transaction.key);
  };

  const handleEditIncomeClick = () => {
    setEditMode(true);
  };

  const handleSaveIncomeClick = async () => {
    const income = parseFloat(currentIncome);
    if (!Number.isNaN(income)) {
      // Update the income in Firebase
      await setIncome(user.fbUser.uid, income);
      setEditMode(false);
    } else {
      alert('Please enter a valid number for income');
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
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}
    >
      <h1>Paycheck & Extras</h1>
      <div className="mb-4 text-center">
        {editMode ? (
          <div>
            <Form.Control
              type="number"
              value={currentIncome}
              onChange={(e) => setCurrentIncome(e.target.value)}
              placeholder="Edit your total income"
              className="mt-2"
            />
            <Button onClick={handleSaveIncomeClick} className="mt-2">Save</Button>
          </div>
        ) : (
          <div>
            <h2>Current Income: ${Number(currentIncome).toFixed(2)}</h2>
            <Button onClick={handleEditIncomeClick} className="mt-2">Edit Income</Button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <Form.Control
          type="number"
          name="amount"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          placeholder="Enter amount"
          className="mt-2"
        />
        <Form.Select
          name="category"
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
          className="mt-2"
        >
          <option value="Paycheck">Paycheck</option>
          <option value="Extras">Extras</option>
        </Form.Select>
        <Button onClick={handleAddTransaction} className="mt-2">Add Transaction</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.category}</td>
              <td>${transaction.amount.toFixed(2)}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDeleteTransaction(transaction)}>
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

export default Paycheck;
