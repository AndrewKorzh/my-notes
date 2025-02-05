import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { token, logout } = useContext(AuthContext);

  const [records, setRecords] = useState([
    { id: 105, text: "gay", created_at: "2025-02-05 16:35:54" },
    { id: 106, text: "Следующая запись", created_at: "2025-02-05 17:00:00" },
    { id: 107, text: "Ещё одна запись", created_at: "2025-02-05 17:10:00" },
  ]);

  return (
    <div className="p-4">
      <h2 className="text-xl">Привет, вот твой токен: {token}</h2>
      <p>Добро пожаловать в приложение</p>
      <button onClick={logout} className="bg-red-500 text-white p-2 mt-2">
        Выйти
      </button>
    </div>
  );
};

export default Home;
