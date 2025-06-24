import { ethers } from 'ethers';

const drawContract = {
  address: '0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035',
  abi: [
    "function storeWinner(address nftContract, uint256 tokenId) public",
    "function getWinners(address nftContract) public view returns (uint256[])"
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' });
  }

  const { nftContract } = req.body;

  if (!nftContract) {
    return res.status(400).json({ error: 'NFT Contract erforderlich' });
  }

  try {
    const tokenRes = await fetch(`https://api.rarible.org/v0.1/items/byCollection?collection=${nftContract}&size=50`);
    const json = await tokenRes.json();
    const tokenIds = json.items.map(item => parseInt(item.tokenId));

    if (tokenIds.length === 0) {
      return res.status(404).json({ error: 'Keine Token-IDs gefunden' });
    }

    const randomId = tokenIds[Math.floor(Math.random() * tokenIds.length)];

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(drawContract.address, drawContract.abi, signer);

    const tx = await contract.storeWinner(nftContract, randomId);
    await tx.wait();

    return res.status(200).json({ txHash: tx.hash, tokenId: randomId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
