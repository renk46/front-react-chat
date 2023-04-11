import React, { useEffect, useMemo } from "react";
import WebSocketClient from "../websocket";

function Chat() {
    const WSClient = useMemo(() => new WebSocketClient('ws://localhost'), [])

    useEffect(() => {
        WSClient.subscribe('broadcast', (data: string) => {
            console.log(data)
        }, 'subsChatBroadcast')

        return () => {
            WSClient.unsubscribe('subsChatBroadcast')
        }
    }, [WSClient])

    return (
        <div>
            Chat
        </div>
    );
}

export default Chat;
