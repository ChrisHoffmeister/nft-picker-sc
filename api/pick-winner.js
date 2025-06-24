import { ethers } from 'ethers';

const winnerContractAddress = "0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035";

const winnerContractABI = [
  "function storeWinner(address nftContract, uint256 tokenId) public",
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST erlaubt' });
    return;
  }

  const { contractAddress, tokenIds } = req.body;

  if (!contractAddress || !Array.isArray(tokenIds) || tokenIds.length === 0) {
    res.status(400).json({ error: 'contractAddress und tokenIds erforderlich' });
    return;
  }

  try {
    const signerProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await signerProvider.getSigner();
    const winnerContract = new ethers.Contract(winnerContractAddress, winnerContractABI, signer);

    // jeden Token einzeln speichern
    const txs = [];
    for (const tokenId of tokenIds) {
      const tx = await winnerContract.storeWinner(contractAddress, tokenId);
      await tx.wait();
      txs.push(tx.hash);
    }

    res.status(200).json({ message: 'Alle Gewinner gespeichert', txHashes: txs });
  } catch (error) {
    console.error('Fehler beim Speichern der Gewinner:', error);
    res.status(500).json({ error: error.message });
  }
}
