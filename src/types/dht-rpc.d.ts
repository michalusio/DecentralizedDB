declare module "dht-rpc" {
  export = DHT;

  type IpAndPort = `${string}:${number}`;
  type HostAndPort = { id?: Buffer; host: string; port: number };

  interface DHTOptions {
    bootstrap?: IpAndPort[] | false;
    id?: Buffer;
    concurrency?: number;
    ephemeral?: boolean;
    adaptive?: boolean;
    nodes?: HostAndPort[];
    bind?: number;
    firewalled?: boolean;
  }

  type OK = 0;
  type ERROR_UNKNOWN_COMMAND = 1;
  type ERROR_INVALID_TOKEN = 2;

  interface DHTRequestCallback extends DHTRequest {
    from: HostAndPort;
    reply(value: Buffer | null | undefined): void;
    error(err: OK | ERROR_UNKNOWN_COMMAND | ERROR_INVALID_TOKEN): void;
  }

  interface DHTRequest {
    command: number;
    token: Buffer;
    target: Buffer;
    value: Buffer;
  }

  interface DHTReply {
    value: Buffer;
  }

  interface QueryResult {
    get closestNodes(): HostAndPort[];
    finished(): Promise<void>;
    readonly closestReplies: DHTRequestCallback[];
    readonly successes: number;
    readonly errors: number;
  }

  interface QueryOptions {
    target: Buffer;
    command: number;
    value?: Buffer;
  }

  class DHT {
    constructor(opts?: DHTOptions);
    static bootstrapper(bind: number, opts: DHTOptions): DHT;

    id: Buffer;
    ephemeral: boolean;
    host: string | null;
    port: number;
    firewalled: boolean;
    destroyed: boolean;

    on(event: "request", callback: (req: DHTRequestCallback) => void): void;
    on(event: "bootstrap" | "listening" | "persistent" | "wake-up", callback: () => void): void;
    ready(): Promise<void>;
    addNode(node: HostAndPort): void;
    refresh(): void;
    request(data: DHTRequest, to: HostAndPort, opts?: { retry: boolean }): Promise<DHTReply>;
    query(query: QueryOptions, options?: { commit: boolean }): QueryResult;
    ping(to: HostAndPort): Promise<DHTReply>;
    destroy(): void;
    toArray(): HostAndPort[];

    static OK: OK;
    static ERROR_UNKNOWN_COMMAND: ERROR_UNKNOWN_COMMAND;
    static ERROR_INVALID_TOKEN: ERROR_INVALID_TOKEN;
  }
}
