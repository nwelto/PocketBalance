import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Button, Form, Table,
} from 'react-bootstrap';

function BudgetCard({
  title, initialBudget, onUpdate, onBudgetSet, onBudgetDelete,
}) {
  const [originalBudget, setOriginalBudget] = useState(initialBudget);
  const [currentBudget, setCurrentBudget] = useState(initialBudget); // Start at the original budget
  const [newTransaction, setNewTransaction] = useState('');
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const handleSetBudget = () => {
    const budget = parseFloat(newTransaction);
    if (!Number.isNaN(budget)) {
      if (originalBudget !== 0) {
        onBudgetDelete(originalBudget); // Restore the previous budget to income before setting a new one
      }
      setOriginalBudget(budget);
      setCurrentBudget(budget);
      onBudgetSet(budget); // Deduct the budget from the original income
      setNewTransaction('');
      setIsSettingBudget(false);
    } else {
      alert('Please enter a valid number');
    }
  };

  const handleAddTransaction = (isAddition) => {
    const amount = parseFloat(newTransaction);
    if (!Number.isNaN(amount)) {
      const updatedBudget = isAddition ? currentBudget + amount : currentBudget - amount;
      setCurrentBudget(updatedBudget);
      setTransactions([
        ...transactions,
        { id: `${title}-${Date.now()}`, amount: isAddition ? amount : -amount },
      ]);
      onUpdate(title, updatedBudget);
      setNewTransaction('');
    } else {
      alert('Please enter a valid number');
    }
  };

  const handleDeleteTransaction = (id, amount) => {
    const updatedTransactions = transactions.filter((transaction) => transaction.id !== id);
    setTransactions(updatedTransactions);
    setCurrentBudget(currentBudget - amount); // Adjust the current budget when a transaction is deleted
    onUpdate(title, currentBudget - amount);
  };

  const handleDeleteBudget = () => {
    onBudgetDelete(originalBudget);
    setOriginalBudget(0);
    setCurrentBudget(0);
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <div className="d-flex justify-content-between align-items-center">
          <h4>Original Budget Set: ${originalBudget.toFixed(2)}</h4>
          <Button variant="primary" onClick={() => setIsSettingBudget(true)} className="ml-2">Set Budget</Button>
          {originalBudget > 0 && (
            <Button variant="danger" onClick={handleDeleteBudget} className="ml-2">Delete Budget</Button>
          )}
        </div>
        <h4>Current Budget Left: ${currentBudget.toFixed(2)}</h4>

        {isSettingBudget && (
          <div>
            <Form.Control
              type="number"
              value={newTransaction}
              onChange={(e) => setNewTransaction(e.target.value)}
              placeholder="Set your budget"
              className="mt-3"
            />
            <Button onClick={handleSetBudget} className="mt-2">Confirm Budget</Button>
          </div>
        )}

        {!isSettingBudget && (
          <div>
            <Form.Control
              type="number"
              value={newTransaction}
              onChange={(e) => setNewTransaction(e.target.value)}
              placeholder="Enter amount"
              className="mt-3"
            />
            <div className="mt-2">
              <Button variant="success" onClick={() => handleAddTransaction(true)} className="mr-2">Add</Button>
              <Button variant="danger" onClick={() => handleAddTransaction(false)}>Subtract</Button>
            </div>
          </div>
        )}

        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteTransaction(transaction.id, transaction.amount)}>
                    X
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

BudgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  initialBudget: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onBudgetSet: PropTypes.func.isRequired,
  onBudgetDelete: PropTypes.func.isRequired,
};

export default BudgetCard;
