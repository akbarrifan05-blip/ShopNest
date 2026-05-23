import React,{createContext, useState} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   // const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("userInfo");
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            localStorage.removeItem("userInfo");
            return null;
        }
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("userInfo", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("userInfo");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
    
