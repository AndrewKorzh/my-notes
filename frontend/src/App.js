import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AppProvider, AppContext } from "./context/AppContext";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import { useContext } from "react";

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const { globalState } = useContext(AppContext)
  console.log(globalState)
  return (
    <Router>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;