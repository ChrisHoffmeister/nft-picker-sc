import { useState } from 'react';
import './style.css';

export default function App() {
  const [tokenIds, setTokenIds] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState([]);

  const contractAddress = "0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035";

  const handlePick = async () => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const ids = tokenIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => parseInt(id));

      const res = await fetch('/api/pick-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenIds: ids })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTxHash(data.txHash);
      setWinners(ids.slice(0, 3)); // Optional: Zeige genau die eingesendeten TokenIds
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Pick 3 Random NFTs 🎯</h1>

      <input
        type="text"
        placeholder={contractAddress}
        disabled
        style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
      />

      <textarea
        rows="3"
        placeholder="Token IDs (z. B. 7,18,23)"
        value={tokenIds}
        onChange={(e) => setTokenIds(e.target.value)}
        style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
      />

      <button onClick={handlePick} disabled={loading || !tokenIds}>
        {loading ? 'Picking…' : 'Pick 3 Players'}
      </button>

      {txHash && (
        <p style={{ marginTop: '1rem' }}>
          ✅ Transaction saved:{' '}
          <a
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-6)}
          </a>
        </p>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>❌ {error}</p>}

      {winners.length > 0 && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Latest 3 Winners 🎉</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {winners.map((id) => (
              <div
                key={id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '1rem',
                  width: '150px',
                  textAlign: 'center'
                }}
              >
                <strong>Token ID: {id}</strong>
                <br />
                <img
                  src={`https://your-nft-hosting.com/nft/${id}.png`}
                  alt={`NFT ${id}`}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
