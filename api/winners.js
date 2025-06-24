import { ethers } from "ethers";
import ABI from "./abi.json";

const CONTRACT_ADDRESS = "0x43e4Ff40ce09BB9Df38a815be2D5e26Bba50D035";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  const nftContract = req.query.nftContract;
  if (!nftContract) return res.status(400).json({ error: "No contract address" });

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const winners = await contract.getWinners(nftContract);
    res.status(200).json({ winners: winners.map((w) => w.toString()) });
  } catch (err) {
    console.error("Fehler beim Abrufen:", err);
    res.status(500).json({ error: "Fetch failed", details: err.message });
  }
}
