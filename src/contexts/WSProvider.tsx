import React, { ReactNode, createContext, useContext, useMemo } from "react";
import WebSocketClient from "../utils/websocket";
import { WS_HOST } from "../config";
import { useLocalStorage } from "../hooks/useLocalStorage";

type WSContextType = {
    ws: WebSocketClient | null;
};

type Props = {
    children: ReactNode;
};

const WSContext = createContext<WSContextType>({
    ws: null,
});

export const WSProvider = ({ children }: Props) => {
    const [token] = useLocalStorage("token", null);
    const ws = useMemo(() => {
        const ws = new WebSocketClient(WS_HOST);
        ws.onWSOpen = () => {
            ws.send({
                type: "AUTH",
                message: token?.access
            })
        }
        ws.connect();
        return ws;
    }, []);

    const value = useMemo(
        () => ({
            ws,
        }),
        [ws]
    );

    return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
};

export const useWS = () => {
    return useContext(WSContext);
};
