import { useEffect, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const TextEditor = () => {
    const [text, setText] = useState("");
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);

    useEffect(() => {
        socket.on("updateText", setText);
        socket.on("setBold", setBold);
        socket.on("setItalic", setItalic);
        socket.on("setUnderline", setUnderline);

        return () => {
            socket.off("updateText");
            socket.off("setBold");
            socket.off("setItalic");
            socket.off("setUnderline");
        };
    }, []);

    const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        socket.emit("edit", e.target.value);
    };

    const handleBold = () => {
        const newBold = !bold;
        setBold(newBold);
        socket.emit("bold", newBold);
    };

    const handleItalic = () => {
        const newItalics = !italic;
        setItalic(newItalics);
        socket.emit("italic", newItalics);
    };

    const handleUnderline = () => {
        const newUnderline = !underline;
        setUnderline(newUnderline);
        socket.emit("underline", newUnderline);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-4">
                <div className="flex gap-2 border-b pb-2 mb-2">
                    <button className="p-2 rounded" onClick={handleBold}>
                        <Bold className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded" onClick={handleItalic}>
                        <Italic className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded" onClick={handleUnderline}>
                        <Underline className="w-5 h-5" />
                    </button>
                </div>
                <textarea
                    className={`w-full h-64 p-4 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                                ${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}
                        `}
                    placeholder="Start typing..."
                    value={text}
                    onChange={handleEdit}
                ></textarea>
                <p className="mt-2 text-gray-600 text-sm">Character Count: {text.length}</p>
            </div>
        </div>
    );
};

export default TextEditor;
