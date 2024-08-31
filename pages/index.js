import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { getIncome, setIncome } from '../API/income';
import { getBudget, updateBudget } from '../API/budget';
import BudgetCard from '../components/BudgetCard';

function Home() {
  const { user, userLoading } = useAuth();
  const [payAmount, setPayAmount] = useState(0);
  const [budgets, setBudgets] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [newIncome, setNewIncome] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (user && !userLoading) {
      getIncome(user.fbUser.uid).then((fetchedIncome) => {
        if (isMounted) setPayAmount(fetchedIncome || 0);
      });

      getBudget(user.fbUser.uid).then((fetchedBudgets) => {
        if (isMounted) setBudgets(fetchedBudgets || {});
      });
    }

    return () => {
      isMounted = false;
    };
  }, [user, userLoading]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    const income = parseFloat(newIncome);
    if (!Number.isNaN(income)) {
      await setIncome(user.fbUser.uid, income);
      setPayAmount(income);
      setEditMode(false);
      setNewIncome('');
    } else {
      alert('Please enter a valid number for income');
    }
  };

  const handleUpdateBudget = async (category, amount) => {
    const updatedBudgets = {
      ...budgets,
      [category]: amount,
    };
    setBudgets(updatedBudgets);
    await updateBudget(user.fbUser.uid, category, amount);
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
      style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}
    >
      <div className="text-center mb-4">
        {editMode ? (
          <div>
            <Form.Control
              type="number"
              value={newIncome}
              onChange={(e) => setNewIncome(e.target.value)}
              placeholder="Enter new income"
            />
            <Button onClick={handleSaveClick} className="mt-2">Save</Button>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '4rem' }}>${Number(payAmount).toFixed(2)}</h1>
            <Button onClick={handleEditClick} className="mt-2">Edit</Button>
          </div>
        )}
      </div>

      <div className="budget-cards-grid">
        <BudgetCard
          title="Bills"
          originalBudget={budgets.Bills || 300}
          initialBudget={0}
          onUpdate={handleUpdateBudget}
        />
        <BudgetCard
          title="Groceries"
          originalBudget={budgets.Groceries || 150}
          initialBudget={0}
          onUpdate={handleUpdateBudget}
        />
        <BudgetCard
          title="Debt"
          originalBudget={budgets.Debt || 200}
          initialBudget={0}
          onUpdate={handleUpdateBudget}
        />
        <BudgetCard
          title="Fun Money"
          originalBudget={budgets.FunMoney || 100}
          initialBudget={0}
          onUpdate={handleUpdateBudget}
        />
        <BudgetCard
          title="Savings"
          originalBudget={budgets.Savings || 500}
          initialBudget={0}
          onUpdate={handleUpdateBudget}
        />
      </div>
    </div>
  );
}

export default Home;
