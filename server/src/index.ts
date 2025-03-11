import express, { json } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log(`[+] New client connected: ${socket.id}`);

    const handleSocketEvent = (event: string, emitEvent: string) => {
        socket.on(event, (data) => {
            io.emit(emitEvent, data);
        });
    };

    handleSocketEvent("edit", "updateText");
    handleSocketEvent("bold", "setBold");
    handleSocketEvent("italics", "setItalics");
    handleSocketEvent("underline", "setUnderline");

    socket.on("disconnect", () => {
        console.log(`[-] Client disconnected: ${socket.id}`);
    });
});

app.get('/', (req, res) => {
    res.send('home');
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}/`);
});
