import React from "react";
import App from "./app";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(document.getElementById("app-placeholder") as HTMLElement);
root.render(
   <React.StrictMode>
      <link
         href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
         rel="stylesheet"
         integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
         crossOrigin="anonymous"></link>
      <App />
   </React.StrictMode>
);
