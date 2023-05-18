import React, {
    ReactNode,
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import WebSocketClient from "../utils/websocket";
import { WS_HOST } from "../config";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { api } from "../utils/axios";

type WSContextType = {
    ws: WebSocketClient | null;
    isReady: boolean
};

type Props = {
    children: ReactNode;
};

const WSContext = createContext<WSContextType>({
    ws: null,
    isReady: false
});

export const WSProvider = ({ children }: Props) => {
    const [token, setToken] = useLocalStorage("token", null);
    const [isReady, setIsReady] = useState<boolean>(false)

    const refreshToken = useCallback(async () => {
        const res = await api.post(
            "api/token/refresh/",
            {
                refresh: token?.refresh,
            },
            {
                headers: { Authorization: false },
            }
        );
        setToken({ ...token, access: res.data.access });
    }, [token, setToken]);

    const ws = useMemo(() => {
        return new WebSocketClient(WS_HOST);
    }, []);

    useEffect(() => {
        ws.onAuthSuccess = () => {
            ws.sendData({
                "request": "WHOAIM"
            });
            setIsReady(true)
        }

        ws.onAuthFailed = () => {
            if (token?.access) ws.sendAuth(token?.access)
        }

        ws.onTokenExpired = () => {
            refreshToken();
        }
    }, [ws, token, refreshToken]);

    useEffect(() => {
        setIsReady(false)
        if (ws) ws.connect();
    }, [ws]);

    const value = useMemo(
        () => ({
            ws,
            isReady,
        }),
        [ws, isReady]
    );

    return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
};

export const useWS = () => {
    return useContext(WSContext);
};
