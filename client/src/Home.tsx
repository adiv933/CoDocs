import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
    const [docId, setDocId] = useState("");
    const navigate = useNavigate();

    const createNewDocument = () => {
        const newDocId = uuidv4();
        navigate(`/doc/${newDocId}`);
    };

    const joinDocument = () => {
        if (!docId.trim()) return;
        navigate(`/doc/${docId}`);
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
                <button
                    onClick={createNewDocument}
                    className="w-full flex items-center justify-center gap-1 bg-black text-white py-3 text-lg font-semibold uppercase tracking-wide border border-black transition hover:bg-white hover:text-black"
                >
                    Create New Document
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>

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
                        onClick={joinDocument}
                        className="bg-black text-white px-6 py-3 text-lg font-semibold uppercase border border-black transition hover:bg-white hover:text-black"
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
