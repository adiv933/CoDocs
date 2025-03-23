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

    socket.on("italic", ({ docId, content }) => {
        socket.to(docId).emit("setItalic", content);
    });

    socket.on("underline", ({ docId, content }) => {
        socket.to(docId).emit("setUnderline", content);
    });

    socket.on("disconnect", () => {
        console.log(`[-] Client disconnected: ${socket.id}`);
    });
});

// api routes
app.post("/document/create", async (req, res): Promise<any> => {
    var { owner } = req.body;
    let user;

    if (!owner) {
        try {
            user = new User();
            await user.save();
            owner = user._id;
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: "Error creating user" });
        }
    } else {
        try {
            user = await User.findById(owner);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ message: "Error fetching user" });
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
        res.status(201).json({ message: "Document created", user, docId });
    } catch (err) {
        console.error("Error creating document:", err);
        res.status(500).json({ message: "Failed to create document" });
    }
});

app.post("/document/join", async (req, res): Promise<any> => {
    const { docId } = req.body;
    var { userId } = req.body;
    let user;

    if (!userId) {
        try {
            user = new User();
            await user.save();
            userId = user._id;
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: "Error creating user" });
        }
    } else {
        try {
            user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ message: "Error fetching user" });
        }
    }

    try {
        const document = await Document.findOne({ docId });

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        if (!document.access.includes(userId)) {
            document.access.push(userId);
            await document.save();
        }

        res.status(200).json({ message: "Joined document", user, docId });
    } catch (err) {
        console.error("Error joining document:", err);
        res.status(500).json({ message: "Failed to join document" });
    }
});

app.get('/test', (req, res) => {
    res.send('help');
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});