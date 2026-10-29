import { createContext, useContext, useEffect, useState } from 'react';

//create the authentication context
const AuthContext = createContext();

//access authentication details from other components
export function useAuth() {
  return useContext(AuthContext);
}

//provide authentication details to the application
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  //restore the login session when the website opens
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Unable to restore user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }

    setLoading(false);
  }, []);

  //save the user details and token after login
  function login(userData, userToken) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('token', userToken);

    setCurrentUser(userData);
    setToken(userToken);
  }

  //clear the current login session
  function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    setCurrentUser(null);
    setToken(null);
  }

  const value = {
    currentUser,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}