import { useEffect, useState } from "react";
import { Bold, Italic, Underline, Link } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "react-router-dom";

const socket = io("http://localhost:3000");

const TextEditor = () => {
    const { docId } = useParams<{ docId: string }>();
    const location = useLocation();
    const user = location.state;
    const { username, avatar } = user || {};

    const [text, setText] = useState("");
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (docId) {
            socket.emit("joinDocument", docId);

            socket.on("loadDocument", (content) => {
                setText(content || "");
            });

            socket.on("updateText", setText);
            socket.on("setBold", setBold);
            socket.on("setItalic", setItalic);
            socket.on("setUnderline", setUnderline);
        }

        return () => {
            socket.off("loadDocument");
            socket.off("updateText");
            socket.off("setBold");
            socket.off("setItalic");
            socket.off("setUnderline");
        };
    }, [docId]);

    const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        socket.emit("edit", { docId, content: newText });
    };

    const handleBold = () => {
        const newBold = !bold;
        setBold(newBold);
        socket.emit("bold", { docId, content: newBold });
    };

    const handleItalic = () => {
        const newItalic = !italic;
        setItalic(newItalic);
        socket.emit("italic", { docId, content: newItalic });
    };

    const handleUnderline = () => {
        const newUnderline = !underline;
        setUnderline(newUnderline);
        socket.emit("underline", { docId, content: newUnderline });
    };

    const handleShareLink = async () => {
        try {
            await navigator.clipboard.writeText(docId!);
            showToast("Document ID copied to clipboard!");
        } catch (err) {
            showToast("Failed to copy ID.");
        }
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);

            setTimeout(() => {
                setToastMessage(null);
            }, 300);
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-white text-black p-4 relative">
            {avatar && username && (
                <div className="absolute top-4 right-4 flex items-center gap-2 group">
                    <img
                        src={avatar}
                        alt={username}
                        className="w-10 h-10 rounded-full border-2 border-black cursor-pointer"
                    />
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {username}
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl border-b border-black flex gap-3 p-4 items-center justify-between">
                <div className="flex gap-3">
                    <div className="relative group">
                        <button
                            className={`p-3 border border-black text-lg uppercase transition ${bold
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            onClick={handleBold}
                        >
                            <Bold className="w-5 h-5" />
                        </button>
                        <span
                            className="absolute left-1/2 top-12 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            Bold
                        </span>
                    </div>

                    {/* Italic Button with Tooltip */}
                    <div className="relative group">
                        <button
                            className={`p-3 border border-black text-lg uppercase transition ${italic
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            onClick={handleItalic}
                        >
                            <Italic className="w-5 h-5" />
                        </button>
                        <span
                            className="absolute left-1/2 top-12 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            Italic
                        </span>
                    </div>

                    {/* Underline Button with Tooltip */}
                    <div className="relative group">
                        <button
                            className={`p-3 border border-black text-lg uppercase transition ${underline
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            onClick={handleUnderline}
                        >
                            <Underline className="w-5 h-5" />
                        </button>
                        <span
                            className="absolute left-1/2 top-12 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            Underline
                        </span>
                    </div>
                </div>

                {/* Copy Link Button with Tooltip */}
                <div className="relative group">
                    <button
                        onClick={handleShareLink}
                        className="p-3 border border-black text-lg uppercase transition bg-white text-black hover:bg-black hover:text-white"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                            />
                        </svg>
                    </button>
                    <span
                        className="absolute left-1/2 top-12 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                        Copy ID
                    </span>
                </div>
            </div>

            <textarea
                className={`w-full max-w-6xl h-[80vh] mt-4 p-4 border border-black text-lg focus:outline-none focus:ring-2 focus:ring-black resize-none
                    ${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${underline ? "underline" : ""
                    }`}
                placeholder="Start typing..."
                value={text}
                onChange={handleEdit}
            ></textarea>

            <p className="mt-2 text-gray-700 text-sm">
                Character Count: {text.length}
            </p>

            {toastMessage && (
                <div
                    className={`fixed bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg transition-all duration-300
                        ${toastVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                >
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default TextEditor;
