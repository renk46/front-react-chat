import React, { useState } from "react";
import FormControl from "@mui/material/FormControl";
import { Container, Button, Stack, TextField } from "@mui/material";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../contexts/AuthProvider";

function Login() {
    const { login } = useAuth()
    const [name, setName] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const [ token, setToken ] = useLocalStorage("token", null)

    const handleClick = async () => {
        const credentials = login(name, pass);
        setToken(credentials)
    };

    return (
        <Container maxWidth="sm">
            <FormControl sx={{ width: 450 }}>
                <Stack spacing={2}>
                    <TextField
                        label="Login"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => handleClick()}
                    >
                        Login
                    </Button>
                </Stack>
            </FormControl>
        </Container>
    );
}

export default Login;
