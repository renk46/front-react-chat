import { Box, Container, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { useWS } from "../contexts/WSProvider";

function Chat() {
    const { ws } = useWS();

    useEffect(() => {
        if (ws) {
            ws.subscribe(
                "broadcast",
                (data: string) => {
                    console.log(data);
                },
                "subsChatBroadcast"
            );
        }

        return () => {
            if (ws) ws.unsubscribe("subsChatBroadcast");
        };
    }, [ws]);

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    width: 350,
                    height: 500,
                }}
            >
                MESSAGES
            </Box>
            <TextField
                sx={{
                    width: 350,
                }}
                multiline
                maxRows={4}
            />
        </Container>
    );
}

export default Chat;
