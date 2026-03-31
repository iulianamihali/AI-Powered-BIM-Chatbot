import { useState } from "react";
import { searchMessages } from "../services/chatService";
import "../styles/dashboard.css";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const data = await searchMessages(query);
      setResults(data);
    } catch (err) {
      console.error("Eroare la căutare:", err);
    }
  };

  return (
    <div className="page-container">
      <h2>Căutare în conversații</h2>
      <input
        type="text"
        placeholder="Caută un cuvânt sau o frază..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Caută</button>
      <ul className="results-list">
        {results.length > 0 ? (
          results.map((item, idx) => (
            <li key={idx}>
              <p><strong>{item.timestamp}</strong></p>
              <p>{item.content}</p>
            </li>
          ))
        ) : (
          <p>Nu există rezultate</p>
        )}
      </ul>
    </div>
  );
}

export default Search;
