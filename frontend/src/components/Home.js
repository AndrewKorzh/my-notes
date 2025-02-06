import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { TextField, Button, Card, CardContent, Typography, Box, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, } from "@mui/material";


const MyDialog = ({ open, onClose }) => {
  const [value, setValue] = useState('');
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <Dialog open={open} onClose={onClose} disableScrollLock>
      <DialogTitle>Добавить запись</DialogTitle>
      <DialogContent>
      <TextField
        label="Запись"
        multiline
        rows={6}
        variant="outlined"
        value={value}
        fullWidth
        onChange={handleChange}
        sx={{
          width: '400px',
          maxHeight: '400px',
          marginTop: '8px',
          display: 'block',
        }}
      />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

const Home = () => {
  const { token, username, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState([
    { id: 106, text: "Следующая запись", created_at: "2025-02-05 17:00:00" },
    { id: 107, text: "Ещё одна запись", created_at: "2025-02-05 17:10:00" },
  ]);

  
  return (
  <Card sx={{ 
    maxWidth: 500, 
    margin: "auto", 
    padding: 0,
    boxShadow: 3, 
    borderRadius: "16px", 
    position: "absolute", 
    top: "50%", 
    left: "50%", 
    transform: "translate(-50%, -50%)", 
    overflow: "hidden"
  }}>
  {/* Верхняя плашка */}
  <Box sx={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "12px 16px", 
    backgroundColor: "#f5f5f5", 
    borderRadius: "16px 16px 0 0", 
    width: "100%", 
    boxSizing: "border-box" // Чтобы padding не влиял на размеры
  }}>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>{username}</Typography>
    <Button 
      onClick={logout} 
      variant="contained" 
      color="error" 
      size="small"
      sx={{ minWidth: "auto" }} // Уменьшаем минимальную ширину кнопки
    >
      Выйти
    </Button>
  </Box>


  <CardContent sx={{ padding: "16px" }}>
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <h2 className="text-xl">Привет, вот твой токен:</h2>
      <h3>{token}</h3>
      <p>Добро пожаловать в приложение</p>
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>Добавить запись</Button>
    </Box>
    
    <MyDialog open={open} onClose={() => setOpen(false)} />
  </CardContent>
</Card>

  );
};







export default Home;
