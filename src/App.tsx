import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CssBaseline } from "@mui/material";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { AuthProvider, useAuth } from "./contexts/AuthProvider";

import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Index from "./pages/Index";

import { WSProvider } from "./contexts/WSProvider";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Index />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/chat",
        element: (
            <ProtectedRoute>
                <Chat />
            </ProtectedRoute>
        ),
    },
]);

function Layout() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <WSProvider>
                <RouterProvider router={router} />
            </WSProvider>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CssBaseline />
            <Layout />
        </AuthProvider>
    );
}

export default App;
