import React from "react";
import ReactDOM from "react-dom/client";
import Dashboard from "./App";
import './styles/main.scss'
import "antd/dist/reset.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Dashboard />
    </React.StrictMode>
);
