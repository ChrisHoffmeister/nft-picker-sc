import { ethers } from 'ethers';

const DRAW_CONTRACT_ADDRESS = "0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035";
const DRAW_CONTRACT_ABI = [
  "function hasAlreadyWon(address nftContract, uint256 tokenId) public view returns (bool)",
  "function storeWinner(address nftContract, uint256 tokenId) public",
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { nftContract } = req.body;

  if (!nftContract) {
    return res.status(400).json({ error: 'nftContract fehlt' });
  }

  try {
    // Token IDs per Rarible API abrufen
    const response = await fetch(`https://api.rarible.org/v0.1/items/byCollection?collection=${nftContract}&size=100`);
    const data = await response.json();
    const items = data.items || [];

    const tokenIds = items.map((item) => parseInt(item.tokenId));

    if (!tokenIds.length) {
      return res.status(404).json({ error: 'Keine Token-IDs gefunden' });
    }

    // Zufällige Token-ID ziehen (max. 10 Versuche)
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const drawContract = new ethers.Contract(DRAW_CONTRACT_ADDRESS, DRAW_CONTRACT_ABI, signer);

    let selected = null;

    for (let i = 0; i < 10; i++) {
      const randomId = tokenIds[Math.floor(Math.random() * tokenIds.length)];
      const alreadyWon = await drawContract.hasAlreadyWon(nftContract, randomId);
      if (!alreadyWon) {
        selected = randomId;
        break;
      }
    }

    if (selected === null) {
      return res.status(400).json({ error: 'Keine ungezogene Token-ID gefunden' });
    }

    const tx = await drawContract.storeWinner(nftContract, selected);
    await tx.wait();

    return res.status(200).json({ tokenId: selected, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
