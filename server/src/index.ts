import express, { json } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { DocumentModel } from "./models/Document";
import { IUser, UserModel } from "./models/User";

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
        try {
            socket.join(docId);
            console.log(`[+] Client ${socket.id} joined document: ${docId}`);

            const document = await DocumentModel.findOne({ docId })
                .populate<{ access: IUser[] }>("access", "username avatar")
                .exec();

            if (document) {
                const usersWithAccess = document.access.map((user) => ({
                    username: user.username,
                    avatar: user.avatar,
                }));

                socket.emit("loadDocument", {
                    content: document.content,
                    users: usersWithAccess,
                });
            } else {
                console.log(`[!] Document not found: ${docId}`);
                socket.emit("error", { message: "Document not found" });
            }
        } catch (error) {
            console.error("Error joining document:", error);
            socket.emit("error", { message: "Failed to load document" });
        }
    });

    socket.on("edit", ({ docId, content }) => {
        socket.to(docId).emit("updateText", content);

        let cachedContent = "";
        setInterval(async () => {
            if (cachedContent !== content) {
                await DocumentModel.findOneAndUpdate(
                    { docId },
                    { content: content }
                );
                cachedContent = content;
                console.log(`[+] Autosaved changes from doc: ${docId}`);
            }
        }, 5000);
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
            user = new UserModel();
            await user.save();
            owner = user._id;
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: "Error creating user" });
        }
    } else {
        try {
            user = await UserModel.findById(owner);
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
        const newDocument = new DocumentModel({
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
            user = new UserModel();
            await user.save();
            userId = user._id;
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(500).json({ message: "Error creating user" });
        }
    } else {
        try {
            user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ message: "Error fetching user" });
        }
    }

    try {
        const document = await DocumentModel.findOne({ docId });

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

app.get("/document/all", async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        res.status(400).json({ message: "User ID is required." });
        return;
    }

    try {
        const user = await UserModel.findById(userId)
        const documents = await DocumentModel.find({ owner: userId })
            .sort({ createdAt: -1 })
            .select("docId content createdAt");
        res.status(200).json({ user, documents });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.get('/test', (req, res) => {
    res.send('help');
});

server.listen(PORT, () => {
    console.log(`Server running on Port:${PORT}`);
});