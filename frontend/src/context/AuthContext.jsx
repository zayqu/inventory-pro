import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("pos-user");
        return storedUser ? JSON.parse(storedUser) : null;
    })

    const login = (userData, token ) => {
        setUser(userData);
        localStorage.setItem("pos-user", JSON.stringify(userData));
        localStorage.setItem("pos-token", token);
    }

    const logout = ( ) => {
        setUser(null);
        localStorage.setItem("pos-user");
        localStorage.setItem("pos-token");
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;