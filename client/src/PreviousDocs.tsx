import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000"; //! for dev mode only

interface IpreviousDocs {
    _id: string;
    docId: string;
    content: string;
    createdAt: string;
}

const PreviousDocs = () => {
    const [user, setUser] = useState({});
    const [previousDocs, setPreviousDocs] = useState<IpreviousDocs[]>([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const getUserId = () => localStorage.getItem("userId");

    const fetchPreviousDocs = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await fetch(`${API_URL}/document/all/?userId=${userId}`);
            const data = await response.json();

            if (response.ok) {
                setPreviousDocs(data.documents);
                setUser(data.user)
            } else {
                setError(data.message || "Failed to fetch previous documents.");
            }
        } catch (err) {
            setError("Server error while fetching previous documents.");
        }
    };

    useEffect(() => {
        fetchPreviousDocs();
    }, []);

    const formatDate = (dateString: string | number | Date) => {
        const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="w-full max-w-5xl text-left mt-8">
            <h2 className="text-2xl font-semibold mb-4">Previous Documents</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {previousDocs.length === 0 ? (
                <p className="text-gray-600">No previous documents found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {previousDocs.map((doc) => (
                        <div
                            key={doc._id}
                            className="p-4 border border-black cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => navigate(`/doc/${doc.docId}`, { state: user })}
                        >
                            <h3 className="text-lg font-semibold mb-2">{formatDate(doc.createdAt)}</h3>
                            <p className="text-gray-700 line-clamp-2">{doc.content.substring(0, 100)}...</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PreviousDocs;
