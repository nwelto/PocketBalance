import { firebase } from '../utils/client';

export const getIncome = async (uid) => {
  const incomeRef = firebase.database().ref(`/users/${uid}/income`);
  const snapshot = await incomeRef.once('value');
  return snapshot.exists() ? snapshot.val() : 0;
};

export const setIncome = async (uid, income) => {
  const incomeRef = firebase.database().ref(`/users/${uid}/income`);
  await incomeRef.set(income);
};
