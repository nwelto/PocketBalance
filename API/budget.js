import { firebase } from '../utils/client';

export const getBudget = async (uid) => {
  const budgetRef = firebase.database().ref(`/users/${uid}/budget`);
  const snapshot = await budgetRef.once('value');
  const budget = {};
  snapshot.forEach((childSnapshot) => {
    budget[childSnapshot.key] = childSnapshot.val();
  });
  return budget;
};

export const setBudget = async (uid, budget) => {
  const budgetRef = firebase.database().ref(`/users/${uid}/budget`);
  await budgetRef.set(budget);
};

export const updateBudget = async (uid, category, amount) => {
  const budgetRef = firebase.database().ref(`/users/${uid}/budget/${category}`);
  await budgetRef.set(amount);
};
