import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { firebase } from '../client';

const AuthContext = createContext();

AuthContext.displayName = 'AuthContext';

const AuthProvider = (props) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((fbUser) => {
      if (fbUser) {
        // Check if user exists in Realtime Database
        firebase.database().ref(`/users/${fbUser.uid}`).once('value').then((snapshot) => {
          if (snapshot.exists()) {
            setUser({ fbUser, ...snapshot.val() });
          } else {
            // If user doesn't exist in the database, register the user
            const newUser = {
              displayName: fbUser.displayName,
              email: fbUser.email,
            };
            firebase.database().ref(`/users/${fbUser.uid}`).set(newUser);
            setUser({ fbUser, ...newUser });
          }
          setUserLoading(false);
        });
      } else {
        setUser(null);
        setUserLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const value = useMemo(
    () => ({
      user,
      userLoading,
    }),
    [user, userLoading],
  );

  return <AuthContext.Provider value={value} {...props} />;
};

const AuthConsumer = AuthContext.Consumer;

const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth, AuthConsumer };
