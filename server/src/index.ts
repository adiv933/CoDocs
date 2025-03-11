import express from 'express';
import dotenv from "dotenv"
dotenv.config();
const app = express();

const port: number = Number(process.env.PORT) || 3000;

app.get('/', (req, res) => {
    res.end('home');
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
