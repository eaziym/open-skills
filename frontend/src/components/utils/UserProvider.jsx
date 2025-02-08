import React, { createContext, useContext, useState, useEffect } from 'react'
import { defaultUser } from './defaultUser'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const initialUser = (() => {
    const stored = window.localStorage.getItem("userData");
    return stored ? JSON.parse(stored) : {...defaultUser};
  })();
  const [userData, setUserData] = useState(initialUser);

  useEffect(() => {
    window.localStorage.setItem("userData", JSON.stringify(userData));
    if (userData._id) {
      window.localStorage.setItem("user_id", userData._id);
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  return useContext(UserContext)
}