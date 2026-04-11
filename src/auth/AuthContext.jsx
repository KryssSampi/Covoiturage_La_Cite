import { createContext, useContext, useState } from "react";
import { getToken, setToken, removeToken, getRole, setRole, removeRole } from "./jwt.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setAuthToken] = useState(getToken());
  const [role, setAuthRole] = useState(getRole());

  const login = (jwt, userRole) => {
    setToken(jwt);
    setRole(userRole);
    setAuthToken(jwt);
    setAuthRole(userRole);
  };

  const logout = () => {
    removeToken();
    removeRole();
    setAuthToken(null);
    setAuthRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
``