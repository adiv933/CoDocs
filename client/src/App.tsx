import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import TextEditor from "./TextEditor";

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doc/:docId" element={<TextEditor />} />
          <Route path="*" element={<h2 className="text-center mt-20 text-2xl">404 - Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
