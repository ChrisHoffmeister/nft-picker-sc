import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035';

const CONTRACT_ABI = [
  "function getWinners(address nftContract) public view returns (uint256[])"
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  const { nftContract } = req.query;

  if (!nftContract) {
    return res.status(400).json({ error: 'nftContract address required' });
  }

  try {
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const winners = await contract.getWinners(nftContract);

    res.status(200).json({ winners: winners.map(id => id.toString()) });
  } catch (err) {
    console.error('Error fetching winners:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
