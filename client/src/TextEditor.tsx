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
        <div className="flex flex-col items-center justify-start min-h-screen bg-white text-black p-4">
            <div className="w-full max-w-6xl border-b border-black flex gap-3 p-4">
                <button
                    className={`p-3 border border-black text-lg uppercase transition ${bold ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                        }`}
                    onClick={handleBold}
                >
                    <Bold className="w-5 h-5" />
                </button>
                <button
                    className={`p-3 border border-black text-lg uppercase transition ${italic ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                        }`}
                    onClick={handleItalic}
                >
                    <Italic className="w-5 h-5" />
                </button>
                <button
                    className={`p-3 border border-black text-lg uppercase transition ${underline ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                        }`}
                    onClick={handleUnderline}
                >
                    <Underline className="w-5 h-5" />
                </button>
            </div>

            <textarea
                className={`w-full max-w-6xl h-[80vh] mt-4 p-4 border border-black text-lg focus:outline-none focus:ring-2 focus:ring-black resize-none
                            ${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""}
                    `}
                placeholder="Start typing..."
                value={text}
                onChange={handleEdit}
            ></textarea>

            <p className="mt-2 text-gray-700 text-sm">Character Count: {text.length}</p>
        </div>
    );
};

export default TextEditor;
