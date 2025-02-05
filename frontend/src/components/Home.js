import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { TextField, Button, Card, CardContent, Typography, IconButton, InputAdornment } from "@mui/material";


const Home = () => {
  const { token, logout } = useContext(AuthContext);

  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const [records, setRecords] = useState([
    { id: 105, text: "gay", created_at: "2025-02-05 16:35:54" },
    { id: 106, text: "Следующая запись", created_at: "2025-02-05 17:00:00" },
    { id: 107, text: "Ещё одна запись", created_at: "2025-02-05 17:10:00" },
  ]);

  
  return (
    <div className="p-4">
      <h2 className="text-xl">Привет, вот твой токен:</h2>
      <h3>{token}</h3>
      <p>Добро пожаловать в приложение</p>
      <button 
        onClick={logout} 
        className="bg-red-500 text-white p-2 mt-2"
        style={{ marginBottom: '20px' }} // Добавляем отступ снизу
      >
        Выйти
      </button>
      <TextField
        label="Заметка"
        multiline
        rows={5}
        variant="outlined"
        value={value}
        onChange={handleChange}
        sx={{
          width: '400px',
          maxHeight: '200px',
          marginTop: '20px',
          display: 'block',
        }}
      />
    </div>
  );
};







export default Home;
