import "dotenv/config";
import { createPublicClient, getContract, http } from "viem";
import { mainnet } from "viem/chains";
import { nounsAbi } from "./abis/nouns.js";

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL env var required");
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.RPC_URL),
});

export function NounsGovInstance() {
  return getContract({
    address: "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d",
    abi: nounsAbi,
    client,
  });
}
