import { useState } from 'react';

export default function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [error, setError] = useState(null);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePickWinner = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pick-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftContract: contractAddress }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      setTokenId(data.tokenId);
      setTxHash(data.txHash);
      fetchWinners();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const fetchWinners = async () => {
    try {
      const res = await fetch(`/api/winners?nftContract=${contractAddress}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setWinners(data.winners);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Draw Winner from NFT Contract</h1>
      <input
        type="text"
        placeholder="NFT Contract Address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />
      <button onClick={handlePickWinner} disabled={loading || !contractAddress}>
        {loading ? 'Drawing…' : 'Draw Winner'}
      </button>

      {txHash && (
        <p>✅ Winner stored on-chain: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank">{txHash}</a></p>
      )}
      {tokenId && <p>🎉 Token #{tokenId} was selected as winner!</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      <h2>Previous Winners</h2>
      <ul>
        {winners.map((id, i) => (
          <li key={i}>Token #{id}</li>
        ))}
      </ul>
    </div>
  );
}
