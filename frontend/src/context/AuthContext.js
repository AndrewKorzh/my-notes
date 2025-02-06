import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUser(savedUsername);
    }
    navigate("/home");
  }, []);

  const login = (token, username) => {
    setToken(token);
    setUser(username)
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    navigate("/home");
  };

  const logout = () => {
    setToken(null);
    setUser("")
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
