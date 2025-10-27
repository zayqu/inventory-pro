import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("pos-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Keep localStorage in sync if user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("pos-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pos-user");
      localStorage.removeItem("pos-token");
    }
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("pos-token", token);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
