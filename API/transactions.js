import { firebase } from '../utils/client';

export const getTransactions = async (uid) => {
  const transactionsRef = firebase.database().ref(`/users/${uid}/transactions`);
  const snapshot = await transactionsRef.once('value');
  const transactions = [];
  snapshot.forEach((childSnapshot) => {
    transactions.push({ key: childSnapshot.key, ...childSnapshot.val() });
  });
  return transactions;
};

export const addTransaction = async (uid, transaction) => {
  const transactionsRef = firebase.database().ref(`/users/${uid}/transactions`);
  await transactionsRef.push(transaction);
};

export const deleteTransaction = async (uid, transactionId) => {
  const transactionRef = firebase.database().ref(`/users/${uid}/transactions/${transactionId}`);
  await transactionRef.remove();
};
