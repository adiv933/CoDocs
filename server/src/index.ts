import express, { json } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import Document from "./models/Document";
import mongoose from "mongoose";
import User from "./models/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

// mongo Connection
mongoose.connect(process.env.MONGO_URI || '')
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// websocket handling
io.on("connection", (socket) => {
    console.log(`[+] New client connected: ${socket.id}`);

    socket.on("joinDocument", async (docId) => {
        socket.join(docId);
        console.log(`[+] Client ${socket.id} joined document: ${docId}`);

        const document = await Document.findOne({ docId });
        if (document) {
            socket.emit("loadDocument", document.content);
        }
    });

    socket.on("edit", ({ docId, content }) => {
        socket.to(docId).emit("updateText", content);
    });

    socket.on("bold", ({ docId, content }) => {
        socket.to(docId).emit("setBold", content);
    });

    socket.on("italics", ({ docId, content }) => {
        socket.to(docId).emit("setItalics", content);
    });

    socket.on("underline", ({ docId, content }) => {
        socket.to(docId).emit("setUnderline", content);
    });

    socket.on("disconnect", () => {
        console.log(`[-] Client disconnected: ${socket.id}`);
    });
});

// api routes
app.post("/document/create", async (req, res) => {
    var { owner } = req.body;

    if (!owner) {
        try {
            const newUser = new User();
            await newUser.save();
            owner = newUser._id;
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }

    try {
        const docId = uuidv4();
        const newDocument = new Document({
            docId,
            owner,
            content: "",
            access: [owner],
        });

        await newDocument.save();
        res.status(201).json({ message: "Document created", owner, docId });
    } catch (err) {
        res.status(500).json({ message: "Failed to create document" });
    }
});

app.post("/document/join", async (req, res) => {
    const { docId } = req.body;
    var { userId } = req.body;

    if (!userId) {
        const newUser = new User();
        await newUser.save();
        userId = newUser._id;
    }

    try {
        const document = await Document.findOne({ docId });

        if (!document) {
            res.status(404).json({ message: "Document not found" });
            return;
        }

        if (!document.access.includes(userId)) {
            document.access.push(userId);
            await document.save();
        }

        res.status(200).json({ message: "Joined document", userId, docId });
    } catch (err) {
        res.status(500).json({ message: "Failed to join document" });
    }

});

app.get('/test', (req, res) => {
    res.send('help');
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});