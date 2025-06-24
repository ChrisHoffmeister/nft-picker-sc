import { useState } from 'react';

export default function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState('');

  const fetchWinners = async () => {
    try {
      const res = await fetch(`/api/winners?nftContract=${contractAddress}`);
      const data = await res.json();
      if (res.ok) setWinners(data.winners);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePick = async () => {
    setLoading(true);
    setError('');
    setWinner(null);

    try {
      const res = await fetch('/api/pick-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftContract: contractAddress }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setWinner(data);
      await fetchWinners();
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>3member.me Draw</h1>

      <input
        type="text"
        placeholder="NFT Contract Address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <button onClick={handlePick} disabled={loading || !contractAddress}>
        {loading ? 'Zieht...' : 'Pick Winner'}
      </button>

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {winner && (
        <div style={{ marginTop: '1rem' }}>
          ✅ Gewinner: Token #{winner.tokenId}
          <br />
          <a
            href={`https://polygonscan.com/tx/${winner.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Transaction
          </a>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h3>Gewinnerhistorie</h3>
      {winners.length === 0 ? (
        <p>Keine bisherigen Gewinner</p>
      ) : (
        <ul>
          {winners.map((id, i) => (
            <li key={i}>
              Token #{id} –{' '}
              <a
                href={`https://rarible.com/token/${contractAddress}:${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Rarible Link
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
