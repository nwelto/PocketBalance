import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form } from 'react-bootstrap';

function BudgetCard({ title, initialBudget, onUpdate }) {
  const [originalBudget, setOriginalBudget] = useState(initialBudget);
  const [currentBudget, setCurrentBudget] = useState(0); // Start at 0 for user adjustments
  const [newTransaction, setNewTransaction] = useState('');
  const [isSettingBudget, setIsSettingBudget] = useState(false);

  const handleSetBudget = () => {
    const budget = parseFloat(newTransaction);
    if (!Number.isNaN(budget)) {
      setOriginalBudget(budget);
      setCurrentBudget(budget); // Set the current budget to the original budget when first set
      onUpdate(title, budget);
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
      onUpdate(title, updatedBudget);
      setNewTransaction('');
    } else {
      alert('Please enter a valid number');
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <h4>Original Budget Set: ${originalBudget.toFixed(2)}</h4>
        <h4>Current Budget Left: ${currentBudget.toFixed(2)}</h4>

        {isSettingBudget ? (
          <div>
            <Form.Control
              type="number"
              value={newTransaction}
              onChange={(e) => setNewTransaction(e.target.value)}
              placeholder="Set your budget"
              className="mt-3"
            />
            <Button onClick={handleSetBudget} className="mt-2">Set Budget</Button>
          </div>
        ) : (
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

        <Button variant="primary" onClick={() => setIsSettingBudget(true)} className="mt-3">Set Budget</Button>
      </Card.Body>
    </Card>
  );
}

BudgetCard.propTypes = {
  title: PropTypes.string.isRequired,
  initialBudget: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default BudgetCard;
