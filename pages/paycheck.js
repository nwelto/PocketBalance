import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/context/authContext';
import { getBudget } from '../API/budget';

function Paycheck() {
  const { user, userLoading } = useAuth();
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    let isMounted = true;

    if (user && !userLoading) {
      getBudget(user.fbUser.uid).then((fetchedBudgets) => {
        if (isMounted) setBudgets(fetchedBudgets || {});
      });
    }

    return () => {
      isMounted = false;
    };
  }, [user, userLoading]);

  if (userLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please log in.</p>;
  }

  return (
    <div>
      <h2>Your Budgets</h2>
      <ul>
        {Object.keys(budgets).map((category) => (
          <li key={category}>
            {category}: ${budgets[category].toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Paycheck;
