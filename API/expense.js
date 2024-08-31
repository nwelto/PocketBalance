import { firebase } from '../utils/client';

export const getExpenses = async (uid) => {
  const expensesRef = firebase.database().ref(`/users/${uid}/expenses`);
  const snapshot = await expensesRef.once('value');
  const expenses = [];
  snapshot.forEach((childSnapshot) => {
    expenses.push({ key: childSnapshot.key, ...childSnapshot.val() });
  });
  return expenses;
};

export const addExpense = async (uid, expense) => {
  const expensesRef = firebase.database().ref(`/users/${uid}/expenses`);
  await expensesRef.push(expense);
};

export const deleteExpense = async (uid, expenseId) => {
  const expenseRef = firebase.database().ref(`/users/${uid}/expenses/${expenseId}`);
  await expenseRef.remove();
};
