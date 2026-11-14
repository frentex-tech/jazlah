import { createConnection, createServer } from 'node:net';
import type { AddressInfo, Socket } from 'node:net';
import type { TcpProxy } from './tcp-proxy.type';

/**
 * A TCP proxy on a free local port in front of `host:port`. `stop()` closes the port and
 * cuts every connection through it, which is what a client sees when the server behind
 * it stops: the connection drops and every reconnect is refused. `resume()` listens on
 * the same port again, as when the server comes back.
 */
export async function startTcpProxy(
  host: string,
  port: number,
): Promise<TcpProxy> {
  const sockets = new Set<Socket>();
  const track = (socket: Socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => socket.destroy());
  };
  const server = createServer((client) => {
    const upstream = createConnection({ host, port });
    track(client);
    track(upstream);
    client.pipe(upstream);
    upstream.pipe(client);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port: proxyPort } = server.address() as AddressInfo;
  return {
    port: proxyPort,
    stop: async () => {
      const closed = new Promise<void>((resolve) =>
        server.close(() => resolve()),
      );
      for (const socket of sockets) {
        socket.destroy();
      }
      await closed;
    },
    resume: () =>
      new Promise<void>((resolve) =>
        server.listen(proxyPort, '127.0.0.1', resolve),
      ),
  };
}
