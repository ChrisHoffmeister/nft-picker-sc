import React, { useState, useEffect } from 'react';
import './style.css';

export default function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [winner, setWinner] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [winnersList, setWinnersList] = useState([]);

  const handlePickWinner = async () => {
    setLoading(true);
    setError(null);
    setWinner(null);
    setTxHash(null);

    try {
      const res = await fetch('/api/pick-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nftContract: contractAddress }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Draw failed');

      setWinner(data.tokenId);
      setTxHash(data.txHash);
      fetchWinners(); // Reload after storing winner
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const fetchWinners = async () => {
    if (!contractAddress) return;
    try {
      const res = await fetch(`/api/winners?nftContract=${contractAddress}`);
      const data = await res.json();
      setWinnersList(data.winners);
    } catch (err) {
      console.error('Fehler beim Abrufen der Gewinner:', err);
    }
  };

  return (
    <div className="container">
      <h1>Draw Random NFT Winner</h1>

      <input
        type="text"
        placeholder="NFT Contract Adresse eingeben"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
      />

      <button onClick={handlePickWinner} disabled={loading || !contractAddress}>
        {loading ? 'Ziehe Gewinner...' : 'Zufälligen Gewinner ziehen'}
      </button>

      {txHash && (
        <p>
          ✅ Gespeichert auf-chain:{" "}
          <a
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash}
          </a>
        </p>
      )}

      {winner && (
        <p>🎉 Gewinner Token ID: <strong>{winner}</strong></p>
      )}

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      <h2>Bisher gezogene Gewinner</h2>
      <ul>
        {winnersList.map((id, i) => (
          <li key={i}>Token ID: {id}</li>
        ))}
      </ul>
    </div>
  );
}
