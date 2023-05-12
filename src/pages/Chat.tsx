import { Box, Container, Stack, Card, CardContent, Typography, Paper, InputBase, IconButton, Divider } from "@mui/material";
import { grey } from "@mui/material/colors";
import React, { useEffect, useRef, useState } from "react";
import { useWS } from "../contexts/WSProvider";
import { useParams } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";

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
                "MESSAGE",
                (data: any) => {
                    messages.push(data)
                    setMessages([...messages])
                },
                "MESSAGESCATCHER"
            )
        }

        return () => {
            if (ws) {
                ws.unsubscribe("MESSAGESCATCHER");
            }
        };
    }, [ws, messages]);

    useEffect(() => {
        if (isReady) ws?.send({
            t: "INFO",
            p: { request: "JOIN ROOM", data: room }
        })
    }, [isReady, ws, room])

    const [text, setText] = useState<string>("")
    const [emojiShow, setEmojiShow] = useState<boolean>(false)

    const keyPress = (e: any) => {
        if (e.keyCode === 13 && !e.ctrlKey && text) {
            e.preventDefault();
            ws?.send({
                t: "INFO",
                p: {
                    request: "MESSAGE",
                    room: room,
                    text: text
                }
            })
            setText("")
        } else if (e.keyCode === 13 && e.ctrlKey) {
            setText(text + '\n')
        } else if (e.keyCode === 13 && !e.ctrlKey) {
            e.preventDefault();
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

    const handleAddEmoji = (e: any) => {
        setText(`${text} ${e.emoji}`)
    }

    const handleToggleEmoji = (status: boolean) => {
        setEmojiShow(status)
    }

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
            {emojiShow ? <Stack sx={{
                position: "absolute",
                top: 251
            }} onMouseEnter={() => { handleToggleEmoji(true) }} onMouseLeave={() => { handleToggleEmoji(false) }}>
                <EmojiPicker onEmojiClick={handleAddEmoji} />
            </Stack> : false}
            <Paper
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 350 }}
                >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    multiline
                    maxRows={4}
                    onKeyDown={keyPress}
                    value={text}
                    onChange={handleChange}
                />
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                    <Stack onMouseEnter={() => { handleToggleEmoji(true) }} onMouseLeave={() => { handleToggleEmoji(false) }}>
                        😀
                    </Stack>
                </IconButton>
            </Paper>
        </Container>
    );
}

export default Chat;
