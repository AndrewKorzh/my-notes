import { useState, useContext } from "react";
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const baseURL = "http://127.0.0.1:5000"
    const data = {
      username: username,
      password: password
    };

    try {
      const response = await axios.post(`${baseURL}/authorization/login`, data);
      if (response.data.access_token) {
        login(response.data.access_token)
        console.log('Access Token:', response.data.access_token);
      } else {
        setError('Ошибка при получении токена');
        console.error('Ошибка при получении токена');
        return;
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.detail) {
          setError(error.response.data.detail);
        }
        console.error('Ошибка при входе:', error);
      } else {
        setError('Ошибка при подключении к серверу');
        console.error('Ошибка при подключении к серверу:', error);
      }
      return;
    }
    alert("Вход выполнен!");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f0f0" }}>
        <Card
          style={{
            padding: 20,
            width: "100%",
            maxWidth: 350,
            margin: "0 10px",
          }}
        >
        <Typography variant="h5" align="center">Вход</Typography>
        <CardContent>
          <TextField 
            fullWidth 
            label="Имя пользователя" 
            margin="normal" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <TextField
            fullWidth
            label="Пароль"
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Typography variant="body2" align="center" style={{ marginTop: 16 }}>
            Нет аккаунта? <Link to="/register">Регистрация</Link>
          </Typography>
          {error && <Typography color="error" style={{ textAlign: "center" }}>{error}</Typography>}
          <Button fullWidth variant="contained" color="primary" onClick={handleLogin} style={{ marginTop: 16 }}>
            Войти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
