import { Block } from "./block";
import { BlockChain } from "./blockchain";
import { transactionRepresentation } from "./transaction";

export function prettyPrintBlock(block: Block): string {
  return `/------------------------------\\
|Previous Hash: ${
    block.previousBlockHash.length === 0 ? "GENESIS" : block.previousBlockHash.toString("hex").substring(0, 20) + "..."
  }
|Timestamp: ${block.timestamp}
|Username: ${block.username}
|Transactions:
| ${block.transactions.map(tr => transactionRepresentation(tr)).join("\n| ")}
|Signature: ${block.signature.toString("base64").substring(0, 20)}...
\\------------------------------/`;
}

export function prettyPrintChain(chain: BlockChain): string {
  return chain
    .map(prettyPrintBlock)
    .reverse()
    .join("\n               \\/               \n               /\\               \n");
}
