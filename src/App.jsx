import React, { useState } from "react";
import axios from "axios";
import "./style.css";

function App() {
  const [nftContract, setNftContract] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [winners, setWinners] = useState([]);

  const pickWinner = async () => {
    setStatus("Ziehung läuft...");
    try {
      const res = await axios.post("/api/pick-winner", { nftContract });
      setTxHash(res.data.txHash);
      fetchWinners(); // Reload list
      setStatus(`🎉 Token ID ${res.data.tokenId} gespeichert!`);
    } catch (err) {
      setStatus("❌ " + (err.response?.data?.error || err.message));
    }
  };

  const fetchWinners = async () => {
    if (!nftContract) return;
    try {
      const res = await axios.get(`/api/winners?nftContract=${nftContract}`);
      setWinners(res.data.winners || []);
    } catch (err) {
      console.error("Fehler beim Laden der Gewinner", err);
    }
  };

  return (
    <div className="container">
      <h1>3member.me Draw</h1>
      <input
        type="text"
        placeholder="0x123…"
        value={nftContract}
        onChange={(e) => setNftContract(e.target.value)}
      />
      <button onClick={pickWinner}>Pick Winner</button>
      <p style={{ color: status.startsWith("❌") ? "red" : "green" }}>{status}</p>
      {txHash && (
        <p>
          🔗 <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">Zur Transaktion</a>
        </p>
      )}
      <hr />
      <h2>Gewinnerhistorie</h2>
      {winners.length === 0 ? (
        <p>Keine bisherigen Gewinner</p>
      ) : (
        <ul>
          {winners.map((id, i) => (
            <li key={i}>Token ID: {id}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

