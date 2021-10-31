import { Json } from "./json";

export type Transactions = ReadonlyArray<TransactionEntry>;

export type TransactionEntry = DeleteTransactionEntry | InsertTransactionEntry;

export type TransactionEntryKey = Readonly<{
  parent?: TransactionEntryKey;
  tag: string;
}>;

export type DeleteTransactionEntry = Readonly<{
  type: "delete";
  key: TransactionEntryKey;
}>;

export type InsertTransactionEntry = Readonly<{
  type: "insert";
  key: TransactionEntryKey;
  value: Json;
}>;

export function transactionRepresentation(transaction: TransactionEntry): string {
  switch (transaction.type) {
    case "delete":
      return `-${transactionKeyRepresentation(transaction.key)}`;
    case "insert":
      return `${transactionKeyRepresentation(transaction.key)}=${JSON.stringify(transaction.value)}`;
  }
}

export function transactionKeyRepresentation(key: TransactionEntryKey): string {
  return `${key.parent ? `${transactionKeyRepresentation(key.parent)}.` : ""}${key.tag}`;
}
