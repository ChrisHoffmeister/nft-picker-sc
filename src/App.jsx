import { useState, useEffect } from 'react';
import './style.css';

export default function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWinners = async (contract) => {
    if (!contract) return;
    try {
      const res = await fetch(`/api/winners.js?contract=${contract}`);
      const data = await res.json();
      if (res.ok) {
        setWinners(data.winners || []);
      } else {
        throw new Error(data.error || 'Fehler beim Abrufen der Gewinner');
      }
    } catch (err) {
      console.error(err);
      setWinners([]);
    }
  };

  const handlePickWinner = async () => {
    setError(null);
    setTxHash(null);
    setLoading(true);

    try {
      const res = await fetch('/api/pick-winner.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contractAddress })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unbekannter Fehler');

      setTxHash(data.txHash);
      fetchWinners(contractAddress); // Aktualisiere die Gewinnerliste
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWinners(contractAddress);
  }, [contractAddress]);

  return (
    <div className="container">
      <h1>3member.me Draw</h1>

      <input
        type="text"
        placeholder="NFT Contract Address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
      />

      <button onClick={handlePickWinner} disabled={!contractAddress || loading}>
        {loading ? 'Drawing…' : 'Pick Winner'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>❌ {error}</p>}
      {txHash && (
        <p style={{ marginTop: '1rem' }}>
          ✅ Gewinner gespeichert: <br />
          <a
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash}
          </a>
        </p>
      )}

      <hr />

      <h2>Gewinnerhistorie</h2>
      {winners.length > 0 ? (
        <ul>
          {winners.map((id, idx) => (
            <li key={idx}>🎉 Token ID: {id}</li>
          ))}
        </ul>
      ) : (
        <p>Keine bisherigen Gewinner</p>
      )}
    </div>
  );
}
