import { createHash, KeyObject, sign } from "crypto";
import { transactionRepresentation, Transactions } from "./transaction";

export class Block {
  public readonly previousBlockHash: Buffer;
  public readonly signature: Buffer;

  constructor(
    public readonly timestamp: number,
    public readonly username: string,
    public readonly transactions: Transactions,
    privateKey: KeyObject,
    previousBlock?: Block
  ) {
    this.previousBlockHash = previousBlock?.hash ?? Buffer.alloc(0);
    this.signature = sign("RSA-SHA256", this.packed, privateKey);
  }

  public get packed(): NodeJS.ArrayBufferView {
    return new TextEncoder().encode(
      `${this.previousBlockHash}\n${this.timestamp}\n${this.username}\n${this.transactions
        .map(tr => transactionRepresentation(tr))
        .join("\n")}`
    );
  }

  public get hash(): Buffer {
    return createHash("sha256").update(this.packed).digest();
  }
}
