import { Container, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

function Index() {
    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h2">
                This is <Link to={'chat/test/'}>Chat</Link>
            </Typography>
        </Container>
    );
}

export default Index;
