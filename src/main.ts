import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db, proposals, votes } from "./db/schema.js";
import { client, NounsGovInstance, sleep } from "./utils.js";

async function getContractEvents() {
  /*  
    Alchemy allows up to 2000 blocks per request
  */
  const STEP_SIZE = 2000n;

  const blkNum = await client.getBlockNumber();

  /*
    fromBlock is when the contract was initially deployed
    so we dont have to start from 0, set first 
    target to end of the provider block limit
  */
  let fromBlock = 12985453n;
  // let fromBlock = 17998594n;
  let toBlock = fromBlock + STEP_SIZE;

  const gov = NounsGovInstance();

  while (fromBlock <= blkNum) {
    try {
      const voteCast = await gov.getEvents.VoteCast(undefined, {
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      const propCreated = await gov.getEvents.ProposalCreated({
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      const propExecuted = await gov.getEvents.ProposalExecuted({
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      for (const { args } of propCreated) {
        console.log("prop inserted: ");
        console.log({
          id: args.id,
          proposer: args.proposer,
          endblock: args.endBlock,
          desc: args.description?.substring(0, 250),
        });

        await db.insert(proposals).values({
          id: Number(args.id),
          description: args.description,
          proposer: args.proposer,
          startBlock: Number(args.startBlock),
          endBlock: Number(args.endBlock),
        });
      }

      for (const { args } of voteCast) {
        await db.insert(votes).values({
          id: nanoid(),
          voter: args.voter as string,
          proposalId: Number(args.proposalId),
          support: Number(args.support),
          votes: Number(args.votes),
          reason: args.reason,
        });
      }

      for (const { args } of propExecuted) {
        console.log(Number(args.id), "prop executed");
        await db
          .update(proposals)
          .set({ executed: true })
          .where(eq(proposals.id, Number(args.id)));
      }

      fromBlock = toBlock + 1n;
      toBlock = fromBlock + STEP_SIZE;

      await sleep(60);
    } catch (e: unknown) {
      console.log({ e });
    }
  }
}

async function main() {
  await getContractEvents();
}
main();
