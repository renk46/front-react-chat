import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

type Props = {
    children: JSX.Element;
};

export const ProtectedRoute = ({ children }: Props) => {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" />;
    return children;
};
