import { createContext, useState } from "react";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    // baseURL: "http://127.0.0.1:5000",
    baseURL: "http://192.168.31.121:5000",
    language: "ru",
  });

  return (
    <AppContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </AppContext.Provider>
  );
};
