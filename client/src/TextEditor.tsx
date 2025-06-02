import { useEffect, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useParams } from "react-router-dom";
import CustomTooltip from "./CustomTooltip";
import GroupAvatars from "./GroupAvatars";
import jsPDF from "jspdf";
import { API_URL } from "./config";

const socket = io(API_URL);

const TextEditor = () => {
    const { docId } = useParams<{ docId: string }>();
    const location = useLocation();
    const user = location.state;
    const { username, avatar } = user || {};

    const [text, setText] = useState("");
    const [users, setUsers] = useState([]);
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (docId) {
            socket.emit("joinDocument", docId);

            socket.on("loadDocument", ({ content, users }) => {
                setText(content || "");
                setUsers(users || []);
                console.log(users)
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

    const handleSaveAsPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);

        let y = 10;
        const lineHeight = 7;
        const lines = doc.splitTextToSize(text, 180);

        lines.forEach((line: string) => {
            if (y > 280) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += lineHeight;
        });

        doc.save(`Document_${docId}.pdf`);
        showToast("PDF downloaded successfully!");
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
            {avatar && username && users && (
                <div className="absolute top-4 right-4 flex items-center gap-2 group">
                    <GroupAvatars currentUser={username} users={users} />
                </div>
            )}

            <div className="w-full max-w-6xl border-b border-black flex gap-3 p-4 items-center justify-between">
                <div className="flex gap-3">
                    <CustomTooltip title="Bold">
                        <button
                            className={`p-3 border border-black text-lg uppercase transition ${bold
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            onClick={handleBold}
                        >
                            <Bold className="w-5 h-5" />
                        </button>
                    </CustomTooltip>

                    <CustomTooltip title="Italics">
                        <button
                            className={`p-3 border border-black text-lg uppercase transition ${italic
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            onClick={handleItalic}
                        >
                            <Italic className="w-5 h-5" />
                        </button>
                    </CustomTooltip>

                    <CustomTooltip title="Underline">
                        <button
                            className={`p-3 border border-black text-lg uppercase transition ${underline
                                ? "bg-black text-white"
                                : "bg-white text-black hover:bg-black hover:text-white"
                                }`}
                            onClick={handleUnderline}
                        >
                            <Underline className="w-5 h-5" />
                        </button>
                    </CustomTooltip>
                </div>

                <div className="flex gap-3">
                    <CustomTooltip title="Save as PDF">
                        <button
                            onClick={handleSaveAsPDF}
                            className="p-3 border border-black text-lg uppercase transition bg-white text-black hover:bg-black hover:text-white"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                />
                            </svg>
                        </button>
                    </CustomTooltip>

                    <CustomTooltip title="Share">
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
                    </CustomTooltip>
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
