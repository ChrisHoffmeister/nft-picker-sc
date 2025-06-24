import { useState } from 'react';
import './style.css';

export default function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const [txHashes, setTxHashes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePick = async () => {
    setLoading(true);
    setError(null);
    setTxHashes([]);

    try {
      const idArray = tokenIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id !== '')
        .map((id) => Number(id));

      const res = await fetch('/api/pick-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractAddress,
          tokenIds: idArray
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Unknown error');

      setTxHashes(data.txHashes);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Pick a Random NFTs from 3member.me events </h1>

      <input
        type="text"
        placeholder="NFT Contract Address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
      />

      <textarea
        rows="3"
        placeholder="Token IDs (e.g. 1,2,3)"
        value={tokenIds}
        onChange={(e) => setTokenIds(e.target.value)}
        style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
      />

      <button onClick={handlePick} disabled={loading || !contractAddress || !tokenIds}>
        {loading ? 'Picking…' : 'Pick 3 Players'}
      </button>

      {txHashes.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          ✅ Transaction(s) saved:
          <ul>
            {txHashes.map((hash, idx) => (
              <li key={idx}>
                <a
                  href={`https://polygonscan.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hash}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>❌ {error}</p>}
    </div>
  );
}
