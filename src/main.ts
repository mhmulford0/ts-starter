import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db, proposals, votes } from "./db/schema.js";
import { client, NounsGovInstance, sleep } from "./utils.js";

async function getContractEvents() {
  /*  
    Alchemy allows up to 2000 blocks per request
    setting the limit just under to avoid rate limits
  */
  const STEP_SIZE = 1900n;

  const blkNum = await client.getBlockNumber();

  /*
    fromBlock is when the contract was initially deployed
    so we dont have to start from 0, set first 
    target to end of the provider block limit
  */
  let fromBlock = 12985453n;
  let toBlock = fromBlock + STEP_SIZE;

  const gov = NounsGovInstance();

  while (fromBlock <= blkNum) {
    try {
      const voteCast = await gov.getEvents.VoteCast(undefined, {
        fromBlock: fromBlock,
        toBlock: toBlock,
      });
      const propCreated = await gov.getEvents.ProposalCreatedWithRequirements({
        fromBlock: fromBlock,
        toBlock: toBlock,
      });
      const propExecuted = await gov.getEvents.ProposalExecuted({
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      propCreated.forEach(async ({ args }) => {
        console.log("prop inserted: ");
        console.log({ args });
        if (args.id && args.proposer && args.quorumVotes && args.description) {
          await db.insert(proposals).values({
            id: Number(args.id),
            description: args.description,
            proposer: args.proposer,
            quorumVotes: Number(args.quorumVotes),
            startBlock: Number(args.startBlock),
            endBlock: Number(args.endBlock),
            proposalThreshold: Number(args.proposalThreshold),
          });
        }
      });
      voteCast.forEach(async ({ args }) => {
        await db.insert(votes).values({
          id: nanoid(),
          voter: args.voter as string,
          proposalId: Number(args.proposalId),
          support: Number(args.support),
          votes: Number(args.votes),
          reason: args.reason,
        });
      });

      propExecuted.forEach(async (p) => {
        console.log(Number(p.args.id), "prop executed");
        if (p.args.id) {
          await db
            .update(proposals)
            .set({ executed: true })
            .where(eq(proposals.id, Number(p.args.id)));
        }
      });

      fromBlock = toBlock + 1n;
      toBlock = fromBlock + STEP_SIZE;

      await sleep(90);
    } catch (e: unknown) {
      console.log({ e });
    }
  }
}

async function main() {
  await getContractEvents();
}
main();
