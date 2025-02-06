import { useState, useContext } from "react";
import axios from 'axios';
import { TextField, Button, Card, CardContent, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";



const Register = () => {
  const baseURL = "http://127.0.0.1:5000"

  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");


  const handleRegister = async () => {

    if (!username || !password) {
      setError("Все поля обязательны");
      return;
    }
    if (confirmPassword !== password) {
      setError("Пароли не совпадают");
      return;
    }

    const data = {
      username: username,
      password: password
    };

    try {
      const response = await axios.post(`${baseURL}/authorization/register`, data);
      if (response.data.access_token) {
        localStorage.setItem("registeredUser", username);
        login(response.data.access_token, username)
        console.log('Access Token:', response.data.access_token);
      } else {
        setError('Ошибка при получении токена');
        console.error('Ошибка при получении токена');
        return;
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400 && error.response.data.detail) {
          setError(error.response.data.detail);
          console.error('Ошибка от сервера:', error.response.data.detail);
        } else {
          setError('Ошибка при регистрации');
          console.error('Ошибка при регистрации:', error);
        }
      } else {
        setError('Ошибка при подключении к серверу');
        console.error('Ошибка при подключении к серверу:', error);
      }
      return;
    }

    setError("");
    alert("Регистрация успешна!");
    setUsername("");
    setPassword("");
    setConfirmPassword("")
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
        <Typography variant="h5" align="center">Регистрация</Typography>
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
          <TextField
            fullWidth
            label="Повторите пароль"
            type={"password"} // showPassword ? "text" : 
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Typography variant="body2" align="center" style={{ marginTop: 16 }}>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </Typography>
          {error && <Typography color="error" style={{ textAlign: "center" }}>{error}</Typography>}
          <Button fullWidth variant="contained" color="primary" onClick={handleRegister} style={{ marginTop: 16 }}>
            Зарегистрироваться
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
