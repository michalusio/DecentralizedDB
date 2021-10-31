import { createHash, createPrivateKey, createPublicKey } from "crypto";
import { Block } from "./block";
import { prettyPrintChain } from "./visualizer";
import DHT from "dht-rpc";
import { readFile } from "fs/promises";
import { threadId } from "worker_threads";

const keys = (await readFile("dist/keys.json", { encoding: "utf8" }).then(JSON.parse)) as KeyStore;

interface KeyStore {
  privateKey: string[];
  publicKey: string[];
}

const publicKey = createPublicKey(keys.publicKey.join("\n"));
const privateKey = createPrivateKey(keys.privateKey.join("\n"));

const genesisBlock = new Block(
  Date.now(),
  "admin_user",
  [{ type: "insert", key: { parent: { tag: "users" }, tag: "admin_user" }, value: { read: true, write: true } }],
  privateKey
);

const secondBlock = new Block(
  Date.now(),
  "admin_user",
  [{ type: "insert", key: { tag: "apples" }, value: 3 }],
  privateKey,
  genesisBlock
);

const thirdBlock = new Block(
  Date.now(),
  "admin_user",
  [{ type: "delete", key: { tag: "apples" } }],
  privateKey,
  secondBlock
);

//console.log(prettyPrintChain([genesisBlock, secondBlock, thirdBlock]));

const bootstrapNode = DHT.bootstrapper(10001, {
  ephemeral: true,
  adaptive: false
});
await bootstrapNode.ready();

const nodes: DHT[] = [];
// Let's create 10 dht nodes for our example.
for (let i = 0; i < 10; i++) await createNode();

async function createNode() {
  const node = new DHT({
    bootstrap: ["localhost:10001"],
    ephemeral: false,
    adaptive: false
  });
  nodes.push(node);
  node.on("request", req => {
    if (req.command === VALUES) {
      if (req.token) {
        // if we are the closest node store the value (ie the node sent a valid roundtrip token)
        const key = hash(req.value).toString("hex");
        values.set(key, req.value);
        console.log("Storing", key, "-->", req.value.toString());
        return req.reply(null);
      }
      const value = values.get(req.target.toString("hex"));
      req.reply(value);
    }
  });

  const values = new Map<string, Buffer>();
  const VALUES = 0; // define a command enum

  await node.ready();
}

const node = new DHT({
  adaptive: false,
  ephemeral: true,
  bootstrap: ["localhost:10001"]
});

await node.ready();

const value = Buffer.alloc(25, "1");
const q = node.query(
  {
    target: hash(value),
    command: 0,
    value
  },
  {
    // commit true will make the query re-request the 20 closest
    // nodes with a valid round trip token to update the values
    commit: true
  }
);

await q.finished();

console.log(q.successes);

bootstrapNode.destroy();
node.destroy();
nodes.forEach(n => n.destroy());

function hash(value: Buffer) {
  return createHash("sha256").update(value).digest();
}
