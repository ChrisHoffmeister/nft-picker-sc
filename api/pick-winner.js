import { ethers } from "ethers";
import ABI from "./abi.json";
import axios from "axios";

const CONTRACT_ADDRESS = "0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { nftContract } = req.body;
  if (!nftContract) return res.status(400).json({ error: "No contract address provided" });

  try {
    // 1. Token-IDs der Collection holen
    const response = await axios.get(
      `https://api.rarible.org/v0.1/items/byCollection?collection=${nftContract}&size=50`
    );
    const items = response.data.items || [];
    const tokenIds = items.map(item => parseInt(item.tokenId, 10)).filter(id => !isNaN(id));

    if (tokenIds.length === 0) return res.status(400).json({ error: "No token IDs found." });

    // 2. Zufällige ID auswählen
    const randomTokenId = tokenIds[Math.floor(Math.random() * tokenIds.length)];

    // 3. Gewinner speichern
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
    const tx = await contract.storeWinner(nftContract, randomTokenId);
    await tx.wait();

    return res.status(200).json({ success: true, tokenId: randomTokenId, txHash: tx.hash });
  } catch (error) {
    console.error("Fehler beim Ziehen:", error);
    return res.status(500).json({ error: "Draw failed", details: error.message });
  }
}
