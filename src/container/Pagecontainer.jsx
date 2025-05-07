import Container from '@mui/material/Container';
import React from 'react'

function Pagecontainer({ children }) {
    return (
        <Container maxWidth="xl">{children}</Container>
    )
}

export default Pagecontainer