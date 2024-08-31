import { firebase } from '../utils/client';

export const getCategories = async (uid, type) => {
  const categoriesRef = firebase.database().ref(`/users/${uid}/categories/${type}`);
  const snapshot = await categoriesRef.once('value');
  const categories = [];
  snapshot.forEach((childSnapshot) => {
    categories.push({ key: childSnapshot.key, name: childSnapshot.val() });
  });
  return categories;
};

export const addCategory = async (uid, type, categoryName) => {
  const categoriesRef = firebase.database().ref(`/users/${uid}/categories/${type}`);
  await categoriesRef.push(categoryName);
};

export const updateCategory = async (uid, type, categoryId, categoryName) => {
  const categoryRef = firebase.database().ref(`/users/${uid}/categories/${type}/${categoryId}`);
  await categoryRef.set(categoryName);
};

export const deleteCategory = async (uid, type, categoryId) => {
  const categoryRef = firebase.database().ref(`/users/${uid}/categories/${type}/${categoryId}`);
  await categoryRef.remove();
};
