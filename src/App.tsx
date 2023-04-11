import React from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Chat from "./components/Chat";
import Login from "./components/Login";

const router = createBrowserRouter([
    {
        path: "/",
        element: <div>Hello world!</div>,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/chat",
        element: <Chat />,
    }
]);

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;
