import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppContext } from "../context/AppContext";

import { 
  TextField, Button, Card, CardContent, Typography, Box, Dialog, DialogTitle, 
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, Paper 
} from "@mui/material";

const MyDialog = ({ open, onClose, records, setRecords, baseURL, token, onAddRecord }) => {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${baseURL}/notes/add_note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization-client": `Bearer ${token}`,
        },
        body: JSON.stringify({"text": value}),
      });

      const data = await response.json();

      if (response.ok) {
        const newRecord = {
          id: data.id,
          text: data.text,
          created_at: data.created_at 
        }
        console.log(newRecord);
        onAddRecord(newRecord);
        setValue('');
      } else {
        alert(`Ошибка при добавлении записи: ${data.message}`);
      }
    } catch (error) {
      console.error("Ошибка при сохранении записи:", error);
      alert("Не удалось сохранить запись");
    }
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
        <Button onClick={handleSave} color="primary">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};


const Home = () => {
  const { token, username, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

    const { globalState } = useContext(AppContext)
    const baseURL = globalState.baseURL

  const [records, setRecords] = useState([
    // { id: 106, text: "Привет. Вообщем сегодня я решил пойти погулять и втретил одного человека. Он был похож на тебя оч сильно.", created_at: "2025-02-05 17:00:00" },
    // { id: 107, text: "Ещё одна запись", created_at: "2025-02-05 17:10:00" },
  ]);

  useEffect(() => {
    // Функция для загрузки записей при монтировании компонента
    const fetchRecords = async () => {
      try {
        const response = await fetch(`${baseURL}/notes/all_user_notes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "authorization-client": `Bearer ${token}`,
          }
        });
        const data = await response.json();
        if (response.ok) {
          setRecords(data.notes); // Сохраняем данные в состоянии records
        } else {
          alert(`Ошибка при загрузке записей: ${data.message}`);
        }
      } catch (error) {
        console.error("Ошибка при загрузке записей:", error);
        alert("Не удалось загрузить записи");
      }
    };

    fetchRecords();
  }, []);

  const [selectedRecords, setSelectedRecords] = useState([]);

  const handleSelect = (id) => {
    setSelectedRecords((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((recordId) => recordId !== id) // Удалить, если уже выбрано
        : [...prevSelected, id] // Добавить, если не выбрано
    );
  }

  const handleDelete = () => {
    setRecords((prevRecords) =>
      prevRecords.filter((record) => !selectedRecords.includes(record.id))
    );
    setSelectedRecords([]); // Сбрасываем выбранные записи после удаления
  };

  const handleAddRecord = (newRecord) => {
    setRecords([...records, newRecord]);
    setOpen(false); // Закрыть диалог после добавления
  };

  
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


        {/* Кнопки управления */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={() => setOpen(true)}>Добавить запись</Button>
          {/* Кнопка для удаления выбранных записей */}
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDelete} 
            disabled={selectedRecords.length === 0} // Деактивировать, если нет выбранных записей
          >
            Удалить выбранные записи
          </Button>
        </Box>

        <MyDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        records={records} 
        setRecords={setRecords} 
        baseURL={baseURL}
        token={token} 
        onAddRecord={handleAddRecord} // Передаем функцию для добавления записи
      />
      </CardContent>
    </Card>
  );
};







export default Home;
