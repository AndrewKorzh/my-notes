import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { 
  TextField, Button, Card, CardContent, Typography, Box, Dialog, DialogTitle, 
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, Paper 
} from "@mui/material";

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
    { id: 106, text: "Привет. Вообщем сегодня я решил пойти погулять и втретил одного человека. Он был похож на тебя оч сильно.", created_at: "2025-02-05 17:00:00" },
    { id: 107, text: "Ещё одна запись", created_at: "2025-02-05 17:10:00" },
  ]);

  const [selectedRecords, setSelectedRecords] = useState([]);

  const handleSelect = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id) // Удалить, если уже выбрано
        : [...prevSelected, id] // Добавить, если не выбрано
    );
  }

  
  return (
    <Card sx={{ 
      maxWidth: 500, 
      minWidth:300,
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
        boxSizing: "border-box" 
      }}>
        <Typography variant="h6">{username}</Typography>
        <Button 
          onClick={logout} 
          variant="contained" 
          color="error" 
          size="small"
          sx={{ minWidth: "auto" }}
        >
          Выйти
        </Button>
      </Box>

      <CardContent sx={{ padding: "3px" }}>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <p>Записи</p>
        </Box>

        {/* Таблица записей */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 3, 
            borderRadius: "8px",
            maxHeight: "300px",
            overflowY: "auto"
          }}
        >
          <Table size="small" stickyHeader> {/* Фиксируем заголовок */}
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRecords.length > 0 && selectedRecords.length < records.length}
                    checked={records.length > 0 && selectedRecords.length === records.length}
                    onChange={() => {
                      if (selectedRecords.length === records.length) {
                        setSelectedRecords([]);
                      } else {
                        setSelectedRecords(records.map((record) => record.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>Текст</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => handleSelect(record.id)}
                    />
                  </TableCell>
                  <TableCell>{record.text}</TableCell>
                  <TableCell>{record.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>


        {/* Кнопка добавления записи */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={() => setOpen(true)}>Добавить запись</Button>
        </Box>

        <MyDialog open={open} onClose={() => setOpen(false)} />
      </CardContent>
    </Card>
  );
};







export default Home;
