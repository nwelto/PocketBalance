import { firebase } from '../utils/client';

// Fetch the total income
export const getIncome = async (uid) => {
  const incomeRef = firebase.database().ref(`/users/${uid}/income`);
  const snapshot = await incomeRef.once('value');
  return snapshot.exists() ? snapshot.val() : 0; // Return 0 if no income exists
};

// Set the total income
export const setIncome = async (uid, income) => {
  const incomeRef = firebase.database().ref(`/users/${uid}/income`);
  await incomeRef.set(Number(income)); // Ensure we save income as a number
};

// Add a new income transaction to the transaction list
export const addTransaction = async (uid, transaction) => {
  const transactionsRef = firebase.database().ref(`/users/${uid}/transactions`);
  await transactionsRef.push(transaction); // Save the new transaction in the list
};

// Fetch all income transactions
export const getTransactions = async (uid) => {
  const transactionsRef = firebase.database().ref(`/users/${uid}/transactions`);
  const snapshot = await transactionsRef.once('value');
  const transactions = [];
  snapshot.forEach((childSnapshot) => {
    transactions.push({ key: childSnapshot.key, ...childSnapshot.val() });
  });
  return transactions;
};

// Delete a transaction by its ID
export const deleteTransaction = async (uid, transactionKey) => {
  const transactionRef = firebase.database().ref(`/users/${uid}/transactions/${transactionKey}`);
  await transactionRef.remove();
};

// Edit a specific transaction in the transaction list
export const editTransaction = async (uid, updatedTransaction) => {
  const transactionRef = firebase.database().ref(`/users/${uid}/transactions/${updatedTransaction.key}`);
  await transactionRef.update(updatedTransaction);
};
