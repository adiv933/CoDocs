import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API_URL = "http://localhost:3000"; //! for dev mode only
const socket = io(API_URL);

const Home = () => {
    const [docId, setDocId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const getUserId = () => {
        return localStorage.getItem("userId");
    };

    const createNewDocument = async () => {
        setLoading(true);
        setError("");
        const owner = getUserId();

        try {
            const response = await fetch(`${API_URL}/document/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ owner }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("userId", data.user._id);
                socket.emit("joinDocument", data.docId);
                navigate(`/doc/${data.docId}`, { state: data.user });
            } else {
                setError(data.message || "Failed to create document");
            }
        } catch (err) {
            setError("Server error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    const joinRoom = async () => {
        if (!docId.trim()) {
            setError("Please enter a valid document ID.");
            return;
        }
        setLoading(true);
        setError("");
        const userId = getUserId();

        try {
            const response = await fetch(`${API_URL}/document/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ docId, userId }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("userId", data.user._id);
                socket.emit("joinDocument", docId);
                navigate(`/doc/${docId}`, { state: data.user });
            } else {
                setError(data.message || "Room does not exist.");
            }
        } catch (err) {
            setError("Server error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-6">
            <div className="w-full max-w-xl border border-black p-10 text-center">
                <h1 className="text-4xl font-semibold flex items-center justify-center mb-6">
                    <img src="/C.png" alt="C" className="w-10 h-10 border-2" />
                    oDocs
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                    Create & collaborate on documents in real time.
                </p>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <button
                    onClick={createNewDocument}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1 bg-black text-white py-3 text-lg font-semibold uppercase tracking-wide border border-black transition hover:bg-white hover:text-black disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create New Document"}
                    {!loading && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                    )}
                </button>

                <div className="my-6 border-t border-black"></div>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter Document ID"
                        value={docId}
                        onChange={(e) => setDocId(e.target.value)}
                        className="w-full px-4 py-3 text-lg border border-black bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        onClick={joinRoom}
                        disabled={loading}
                        className="bg-black text-white px-6 py-3 text-lg font-semibold uppercase border border-black transition hover:bg-white hover:text-black disabled:opacity-50"
                    >
                        {loading ? "Joining..." : "Join"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
