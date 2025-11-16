import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Send, MapPin, Loader2, ChevronDown, ChevronUp, Download } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [parsedDays, setParsedDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const parseItinerary = (text) => {
    const sections = text.split(/Day\s+\d+:/i);
    const headers = text.match(/Day\s+\d+:/gi);

    if (!headers) return [];

    return headers.map((header, index) => ({
      day: header.trim(),
      content: sections[index + 1].trim(),
    }));
  };

  const sendQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setAnswer("");
    setParsedDays([]);

    try {
      const res = await axios.post("http://localhost:8000/query", { question: query });
      const text = res.data.answer;

      setAnswer(text);
      setParsedDays(parseItinerary(text));
    } catch {
      setAnswer("❌ Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
  const input = document.getElementById("itinerary-section");

  const canvas = await html2canvas(input, {
    scale: 2,           // High quality
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Add more pages as needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save("itinerary.pdf");
};


  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
            Travel Planner AI
          </h1>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Input */}
        <div className="space-y-4 mb-8">
          <textarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            placeholder='e.g., "Plan a 5-day trip to Mumbai with budget"'
            className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white"
          />
          <button
            onClick={sendQuery}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            {loading ? "Generating..." : "Get Itinerary"}
          </button>
        </div>

        {/* Answer */}
        {answer && (
  <div className="animate-in fade-in duration-500 space-y-6">

    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-white">
        Your Personalized Itinerary
      </h2>

      {/* PDF Export Button */}
      <button
        onClick={exportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 
        text-white rounded-xl transition shadow-lg"
      >
        <Download className="w-5 h-5" />
        Download PDF
      </button>
    </div>

    {/* Itinerary Cards Wrapper (important for PDF export) */}
    <div id="itinerary-section" className="space-y-6">
      {(() => {
        const sections = answer.split(/(?=Day\s+\d+:)/i);

        return sections.map((section, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800/70 to-slate-900/80
              border border-slate-700 rounded-2xl p-6 shadow-xl 
              hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">
              {section.split("\n")[0]}
            </h3>

            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>
                {section.replace(section.split("\n")[0], "")}
              </ReactMarkdown>
            </div>
          </div>
        ));
      })()}
    </div>

    {/* Action Buttons */}
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => setAnswer("")}
        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 
          border border-slate-700 text-white rounded-xl font-medium transition"
      >
        Clear
      </button>

      <button
        onClick={() => {
          setQuery("");
          setAnswer("");
        }}
        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 
          border border-slate-700 text-white rounded-xl font-medium transition"
      >
        New Plan
      </button>
    </div>

  </div>
)}


      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";

// function App() {
//   const [query, setQuery] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendQuery = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setAnswer("");

//     try {
//       const res = await axios.post("http://localhost:8000/query", {
//         question: query
//       });

//       console.log("FULL RESPONSE:", res.data);

//       // IMPORTANT: Your backend returns { "answer": "<text>" }
//       setAnswer(res.data.answer);

//     } catch {
//       setAnswer("❌ Error connecting to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Travel Agent</h1>

//       <textarea
//         className="w-full p-3 border rounded mb-4"
//         placeholder='e.g. plan a trip to kashi for 5 days'
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       <button
//         onClick={sendQuery}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         disabled={loading}
//       >
//         {loading ? "Thinking..." : "Send"}
//       </button>

//       {answer && (
//         <div className="mt-6 p-4 border rounded bg-gray-700 text-amber-500 whitespace-pre-wrap">
//           <ReactMarkdown>{answer}</ReactMarkdown>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;





// import React, { useState } from "react";
// import axios from "axios";

// function App() {
//   const [query, setQuery] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendQuery = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setAnswer("");

//     try {
//       const res = await axios.post("http://localhost:8000/query", {
//         question: query
//       });

//       console.log("FULL RESPONSE:", res.data);

//       // IMPORTANT: Your backend returns { "answer": "<text>" }
//       setAnswer(res.data.answer);

//     } catch (err) {
//       setAnswer("❌ Error connecting to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Travel Agent</h1>

//       <textarea
//         className="w-full p-3 border rounded mb-4"
//         placeholder='e.g. plan a trip to goa for 5 days'
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       <button
//         onClick={sendQuery}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         disabled={loading}
//       >
//         {loading ? "Thinking..." : "Send"}
//       </button>

//       {answer && (
//         <div className="mt-6 p-4 border rounded bg-gray-50 whitespace-pre-wrap">
//           {answer}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



// import React, { useState } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";
// import {
//   Send,
//   MapPin,
//   Loader2,
//   Plane,
//   Sparkles,
//   Trash2,
//   RefreshCcw
// } from 'lucide-react';

// export default function App() {
//   const [query, setQuery] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendQuery = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setAnswer("");

//     try {
//       const res = await axios.post("http://localhost:8000/query", {
//         question: query
//       });

//       setAnswer(res.data.answer);
//     } catch {
//       setAnswer("❌ Unable to reach the server. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEnter = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendQuery();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
//       {/* Top Header */}
//       <header className="sticky top-0 backdrop-blur-md bg-black/20 border-b border-slate-800 z-50">
//         <div className="max-w-5xl mx-auto px-7 py-5 flex items-center gap-3">
//           <Plane className="w-7 h-7 text-emerald-400" />
//           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
//             Travel Planner AI
//           </h1>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-5xl mx-auto px-7 py-10">
        
//         {/* Query Input Card */}
//         <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-lg backdrop-blur-md mb-10">
//           <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
//             <Sparkles className="w-5 h-5 text-cyan-400" />
//             Describe your dream trip
//           </h2>

//           <textarea
//             className="w-full min-h-[140px] p-5 bg-slate-800/60 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-500 text-slate-100"
//             placeholder='Ex: "Plan a 5-day trip to Mumbai with cost breakdown and must-visit places."'
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={handleEnter}
//           ></textarea>

//           <div className="flex justify-end mt-2 text-slate-500 text-xs">
//             {query.length}/500
//           </div>

//           <button
//             onClick={sendQuery}
//             disabled={loading || !query.trim()}
//             className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Planning your itinerary...
//               </>
//             ) : (
//               <>
//                 <Send className="w-5 h-5" /> Generate Plan
//               </>
//             )}
//           </button>
//         </div>

//         {/* Output Section */}
//         {answer && (
//           <section className="animate-fadeIn">
//             <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-xl">
//               <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
//                 <MapPin className="w-5 h-5 text-emerald-400" />
//                 <h2 className="text-xl font-semibold">Your Personalized Itinerary</h2>
//               </div>

//               <div className="prose prose-invert max-w-none leading-relaxed prose-headings:text-emerald-300 prose-strong:text-emerald-200 prose-a:text-cyan-300">
//                 <ReactMarkdown>{answer}</ReactMarkdown>
//               </div>
//             </div>

//             {/* Footer Buttons */}
//             <div className="flex gap-4 mt-6">
//               <button
//                 onClick={() => setAnswer("")}
//                 className="flex-1 border border-slate-700 bg-slate-800/70 hover:bg-slate-700 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
//               >
//                 <Trash2 className="w-5 h-5" />
//                 Clear
//               </button>
//               <button
//                 onClick={() => {
//                   setQuery("");
//                   setAnswer("");
//                 }}
//                 className="flex-1 border border-slate-700 bg-slate-800/70 hover:bg-slate-700 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
//               >
//                 <RefreshCcw className="w-5 h-5" />
//                 New Trip
//               </button>
//             </div>
//           </section>
//         )}

//         {/* Empty State */}
//         {!answer && !loading && (
//           <div className="text-center mt-20 opacity-70 animate-fadeIn">
//             <MapPin className="w-16 h-16 text-slate-700 mx-auto mb-4" />
//             <p className="text-slate-400 text-lg max-w-lg mx-auto">
//               Start by describing your travel destination. The AI will generate a detailed,
//               personalized itinerary including **budget**, **places to visit**, **activities**, and **day-wise plan**.
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
