/** A running TCP proxy (startTcpProxy). */
export type TcpProxy = Readonly<{
  /** The local port it listens on. */
  port: number;
  /** Closes the port and cuts every connection through it. */
  stop: () => Promise<void>;
  /** Listens on the same port again after `stop`, as when the server comes back. */
  resume: () => Promise<void>;
}>;
