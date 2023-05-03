import { Box, Container, TextField, Stack, Card, CardContent, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import React, { useEffect, useRef, useState } from "react";
import { useWS } from "../contexts/WSProvider";
import { useParams } from "react-router-dom";

type Props = {
    data: any
}

function Message({ data }: Props) {
    return <Card sx={{ minWidth: 275 }}>
        <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                {data.author}
            </Typography>
            <Typography variant="body2">
                {data.text}
            </Typography>
        </CardContent>
    </Card>;
}

function Chat() {
    const { ws, isReady } = useWS();
    const [messages, setMessages] = useState<any>([])
    const messagesEndRef = useRef<any>(null)
    let { room } = useParams();

    useEffect(() => {
        if (ws) {
            ws.subscribe(
                "broadcast",
                (data: string) => {
                    console.log(data);
                },
                "subsChatBroadcast"
            );

            ws.subscribe(
                "MESSAGE",
                (data: any) => {
                    messages.push(data.message)
                    setMessages([...messages])
                },
                "MESSAGESCATCHER"
            )
        }

        return () => {
            if (ws) {
                ws.unsubscribe("subsChatBroadcast");
                ws.unsubscribe("MESSAGESCATCHER");
            }
        };
    }, [ws, messages]);

    useEffect(() => {
        if (isReady) ws?.send({
            type: "INFO",
            message: `JOIN ROOM ${room}`
        })
    }, [isReady, ws, room])

    const [text, setText] = useState<string>("")

    const keyPress = (e: any) => {
        if (e.keyCode === 13 && !e.ctrlKey) {
            e.preventDefault();
            ws?.send({
                type: "MESSAGE",
                message: `${room} ${text}`
            })
            setText("")
        } else if (e.keyCode === 13 && e.ctrlKey) {
            setText(text + '\n')
        }
    };

    const handleChange = (e: any) => {
        setText(e.target.value)
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    p: 2,
                    width: 350,
                    backgroundColor: grey[500],
                    display: "flex",
                    flexDirection: "column",
                    height: 700,
                    overflow: "hidden",
                    overflowY: "scroll",
                }}
            >
                <Stack
                    direction="column"
                    alignItems="stretch"
                    spacing={2}
                >
                    {messages.map((e: any) => <Message data={e} />)}
                    <div ref={messagesEndRef} />
                </Stack>
            </Box>
            <TextField
                sx={{
                    width: 350,
                }}
                multiline
                maxRows={4}
                onKeyDown={keyPress}
                value={text}
                onChange={handleChange}
            />
        </Container>
    );
}

export default Chat;
