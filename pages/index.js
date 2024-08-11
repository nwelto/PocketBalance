import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useAuth } from '../utils/context/authContext';
import { firebase } from '../utils/client';

function Home() {
  const { user, userLoading } = useAuth();
  const [payAmount, setPayAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user && !userLoading) {
      // Set up a real-time listener for payAmount
      const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
      payRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
          setPayAmount(snapshot.val());
        }
      });

      // Set up a listener for transactions
      const transactionsRef = firebase.database().ref(`/users/${user.fbUser.uid}/transactions`);
      transactionsRef.on('value', (snapshot) => {
        const transactionsList = [];
        snapshot.forEach((childSnapshot) => {
          transactionsList.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });
        setTransactions(transactionsList);
      });

      // Cleanup function to remove listeners when component unmounts
      return () => {
        payRef.off();
        transactionsRef.off();
      };
    }

    // Return nothing explicitly if no user is logged in or userLoading is true
    return undefined;
  }, [user, userLoading]);

  const handleDelete = (key, transactionAmount, type) => {
    const transactionsRef = firebase.database().ref(`/users/${user.fbUser.uid}/transactions/${key}`);
    transactionsRef.remove();

    const payRef = firebase.database().ref(`/users/${user.fbUser.uid}/payAmount`);
    payRef.once('value').then((snapshot) => {
      const currentPayAmount = snapshot.val() || 0;
      const updatedPayAmount = type === 'income' ? currentPayAmount - transactionAmount : currentPayAmount + transactionAmount;
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
      <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>
        ${payAmount.toFixed(2)}
      </h1>

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
          {transactions.map((transaction) => (
            <tr key={transaction.key}>
              <td>{transaction.description}</td>
              <td style={{ color: transaction.type === 'expense' ? 'red' : 'green' }}>
                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
              </td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(transaction.key, transaction.amount, transaction.type)}>
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

export default Home;
