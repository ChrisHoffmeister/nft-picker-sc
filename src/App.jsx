import { useState } from 'react';
import './style.css';

export default function App() {
  const [nftContract, setNftContract] = useState('');
  const [txHash, setTxHash] = useState('');
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const pickWinner = async () => {
    setError('');
    try {
      const res = await fetch('/api/pick-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftContract })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTxHash(data.txHash);
      setWinner(data.tokenId);
      fetchWinners(nftContract);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchWinners = async (address) => {
    const res = await fetch(`/api/winners?nftContract=${address}`);
    const data = await res.json();
    setHistory(data.winners || []);
  };

  return (
    <div className="container">
      <h1>3member.me Draw</h1>
      <input
        placeholder="NFT Contract Address"
        value={nftContract}
        onChange={(e) => setNftContract(e.target.value)}
      />
      <button onClick={pickWinner}>Pick Winner</button>

      {txHash && (
        <p>✅ <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">Transaction saved</a></p>
      )}
      {winner && <p>🎉 Gewinner Token ID: {winner}</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      <hr />
      <h3>Gewinnerhistorie</h3>
      {history.length === 0 ? (
        <p>Keine bisherigen Gewinner</p>
      ) : (
        <ul>
          {history.map((id, i) => (
            <li key={i}>Token ID: {id}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
