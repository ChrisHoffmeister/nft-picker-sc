// api/pick-winner.js
import { ethers } from "ethers";
import ABI from "./abi.json";
import axios from "axios";

const CONTRACT_ADDRESS = "0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Nur POST erlaubt" });

  const { nftContract } = req.body;
  if (!nftContract) return res.status(400).json({ error: "NFT-Adresse fehlt" });

  try {
    const apiRes = await axios.get(
      `https://api.rarible.org/v0.1/items/byCollection?collection=${nftContract}&size=50`
    );
    const items = apiRes.data.items;
    if (!items || items.length === 0)
      return res.status(400).json({ error: "Keine Token-IDs gefunden" });

    const tokenIds = items
      .map((i) => parseInt(i.tokenId))
      .filter((i) => !isNaN(i));
    const tokenId = tokenIds[Math.floor(Math.random() * tokenIds.length)];

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    const tx = await contract.storeWinner(nftContract, tokenId);
    await tx.wait();

    res.status(200).json({ success: true, tokenId, txHash: tx.hash });
  } catch (err) {
    console.error("Draw error:", err);
    res.status(500).json({ error: err.message });
  }
}
