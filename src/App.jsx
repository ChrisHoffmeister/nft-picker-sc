import { useState } from "react";
import "./style.css";

export default function App() {
  const [nftContract, setNftContract] = useState("");
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    if (!nftContract) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pick-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nftContract }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWinner(data.tokenId);
      loadHistory();
    } catch (e) {
      setError(e.message);
    }
    setBusy(false);
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/winners?nftContract=${nftContract}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setHistory(d.winners);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container">
      <h1>3member.me Draw</h1>
      <input
        type="text"
        placeholder="NFT Contract Adresse"
        value={nftContract}
        onChange={(e) => setNftContract(e.target.value)}
      />
      <button onClick={pick} disabled={busy}>
        {busy ? "Ziehen…" : "Pick Winner"}
      </button>
      {winner && <p>🎉 Gewinner: {winner}</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      <hr />
      <h2>Gewinnerhistorie</h2>
      {history.length === 0 && <p>Keine bisherigen Gewinner</p>}
      <ul>{history.map((id) => <li key={id}>#{id}</li>)}</ul>
    </div>
  );
}
