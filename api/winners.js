import { ethers } from 'ethers';

const drawContract = {
  address: '0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035',
  abi: [
    "function getWinners(address nftContract) public view returns (uint256[])"
  ]
};

export default async function handler(req, res) {
  const { nftContract } = req.query;

  if (!nftContract) {
    return res.status(400).json({ error: 'NFT Contract erforderlich' });
  }

  try {
    const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
    const contract = new ethers.Contract(drawContract.address, drawContract.abi, provider);

    const winners = await contract.getWinners(nftContract);
    res.status(200).json({ winners: winners.map(id => id.toString()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
