import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// วัดประสิทธิภาพของแอป ส่งผลลัพธ์ไปยังฟังก์ชันที่ต้องการ เช่น reportWebVitals(console.log)
// เรียนรู้เพิ่มเติม: https://bit.ly/CRA-vitals
reportWebVitals();
