import { useState } from "react";
import "./App.css";
import TodoList from "./features/todos/TodoList";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <div className="App">
      <ToastContainer />
      <TodoList />
    </div>
  );
}

export default App;
