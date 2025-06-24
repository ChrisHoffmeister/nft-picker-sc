import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035';

const CONTRACT_ABI = [
  "function getWinners(address nftContract) public view returns (uint256[])"
];

export default async function handler(req, res) {
  const { contract } = req.query;

  if (!contract) {
    return res.status(400).json({ error: 'NFT Contract-Adresse fehlt' });
  }

  try {
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const winners = await contractInstance.getWinners(contract);

    res.status(200).json({ winners: winners.map(id => Number(id)) });
  } catch (err) {
    console.error('Fehler beim Abrufen der Gewinner:', err);
    res.status(500).json({ error: err.message || 'Fehler beim Abrufen der Gewinner' });
  }
}
