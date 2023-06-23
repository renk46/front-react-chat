import React, {
    useState,
    ReactNode,
    createContext,
    useContext,
    useMemo,
    useEffect,
    useCallback,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { api, setAccessToken } from "../utils/axios";

type UserType = {
    id: string;
    username: string;
    email: string;
};

type AuthContextType = {
    user: UserType | null;
    login: (user: string, pass: string) => Promise<any>;
    isLoading: boolean;
    token: any | null,
    setToken: (token: string) => void;
};

type Props = {
    children: ReactNode;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: (user: string, pass: string) =>
        new Promise((resolve, reject) => {
            reject();
        }),
    isLoading: true,
    token: null,
    setToken: (token: string) => {}
});

export const AuthProvider = ({ children }: Props) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<UserType | null>(null);
    const [token, setToken] = useLocalStorage("token", null);

    const login = useCallback(async (user: string, pass: string) => {
        const res = await api.post("api/token/", {
            username: user,
            password: pass,
        });
        return res.data;
    }, []);

    const getUserInfo = useCallback(async (token: string) => {
        let res = null
        try {
            res = await api.post("api/token/verify/", {
                token: token
            });
        } catch {
            const token = window.localStorage.getItem("token")
            const parsedToken = (token) ? JSON.parse(token) : null
            res = await api.post("api/token/verify/", {
                token: parsedToken?.access
            });
        }
        return res.data;
    }, []);

    useEffect(() => {
        const _getUserinfo = async (token: string) => {
            try {
                const data = await getUserInfo(token);
                setUser(data);
                setIsLoading(false);
            } catch (e) {
                setIsLoading(false);
            }
        };

        if (token) {
            setAccessToken(token.access);
            _getUserinfo(token.access);
        } else {
            setIsLoading(false);
        }
    }, [getUserInfo, token]);

    const value = useMemo(
        () => ({
            user,
            login,
            isLoading,
            token,
            setToken,
        }),
        [user, login, isLoading, token, setToken]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
