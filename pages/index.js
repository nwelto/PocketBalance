import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/context/authContext';
import { getIncome } from '../API/income';
import { getBudget, updateBudget } from '../API/budget';
import BudgetCard from '../components/BudgetCard';

function Index() {
  const { user, userLoading } = useAuth();
  const [payAmount, setPayAmount] = useState(0);
  const [budgets, setBudgets] = useState({});

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

  const handleUpdateBudget = async (category, amount) => {
    const updatedBudgets = {
      ...budgets,
      [category]: amount,
    };
    setBudgets(updatedBudgets);
    await updateBudget(user.fbUser.uid, category, amount);
  };

  const handleBudgetSet = (budgetAmount) => {
    setPayAmount((prev) => prev - budgetAmount);
  };

  const handleBudgetDelete = (budgetAmount) => {
    setPayAmount((prev) => prev + budgetAmount);
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
        <h1 style={{ fontSize: '4rem' }}>${Number(payAmount).toFixed(2)}</h1>
      </div>

      <div className="budget-cards-grid">
        <BudgetCard
          title="Bills"
          initialBudget={budgets.Bills || 0}
          onUpdate={handleUpdateBudget}
          onBudgetSet={handleBudgetSet}
          onBudgetDelete={handleBudgetDelete}
        />
        <BudgetCard
          title="Groceries"
          initialBudget={budgets.Groceries || 0}
          onUpdate={handleUpdateBudget}
          onBudgetSet={handleBudgetSet}
          onBudgetDelete={handleBudgetDelete}
        />
        <BudgetCard
          title="Debt"
          initialBudget={budgets.Debt || 0}
          onUpdate={handleUpdateBudget}
          onBudgetSet={handleBudgetSet}
          onBudgetDelete={handleBudgetDelete}
        />
        <BudgetCard
          title="Fun Money"
          initialBudget={budgets.FunMoney || 0}
          onUpdate={handleUpdateBudget}
          onBudgetSet={handleBudgetSet}
          onBudgetDelete={handleBudgetDelete}
        />
        <BudgetCard
          title="Savings"
          initialBudget={budgets.Savings || 0}
          onUpdate={handleUpdateBudget}
          onBudgetSet={handleBudgetSet}
          onBudgetDelete={handleBudgetDelete}
        />
      </div>
    </div>
  );
}

export default Index;
