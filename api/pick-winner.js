import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035';

const CONTRACT_ABI = [
  "function storeWinner(address nftContract, uint256 tokenId) public",
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { contractAddress } = req.body;

  if (!contractAddress) {
    return res.status(400).json({ error: 'NFT Contract-Adresse fehlt' });
  }

  try {
    // ✅ Step 1: Token-IDs über Rarible API abrufen
    const response = await fetch(`https://api.rarible.org/v0.1/items/byCollection?collection=${contractAddress}&size=50`);
    const json = await response.json();
    const tokens = json.items;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ error: 'Keine Token-IDs gefunden' });
    }

    // ✅ Step 2: Zufälligen Token wählen
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    const tokenIdHex = randomToken.tokenId;
    const tokenId = BigInt(tokenIdHex).toString(); // sicherstellen, dass es ein String bleibt

    // ✅ Step 3: Signer & Contract
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // ✅ Step 4: Smart Contract call
    const tx = await contract.storeWinner(contractAddress, tokenId);
    await tx.wait();

    return res.status(200).json({ txHash: tx.hash, tokenId });
  } catch (err) {
    console.error('Fehler:', err);
    return res.status(500).json({ error: err.message || 'Unbekannter Fehler' });
  }
}
