import { db, proposals } from "./db/schema.js";
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
      console.log(`start: ${fromBlock}, end: ${toBlock}`);

      propCreated.forEach(async ({ args }) => {
        if (
          args.id &&
          args.proposer &&
          args.quorumVotes &&
          args.proposalThreshold &&
          args.description
        ) {
          await db.insert(proposals).values({
            id: args.id,
            description: args.description,
            proposer: args.proposer,
            quorumVotes: args.quorumVotes,
            proposalThreshold: args.proposalThreshold,
          });
        }
      });
      voteCast.forEach((v) => console.log(v.args));
      propExecuted.forEach((p) => console.log(p.args));

      fromBlock = toBlock + 1n;
      toBlock = fromBlock + STEP_SIZE;

      console.log("-------------------------------- \n");

      if (toBlock - fromBlock !== 1900n) {
        console.error("your math is wrong");
      }

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
