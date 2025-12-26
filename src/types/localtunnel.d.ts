declare module "localtunnel" {
  interface LocalTunnelOptions {
    port: number;
    subdomain?: string;
    host?: string;
    local_host?: string;
    local_https?: boolean;
    local_cert?: string;
    local_key?: string;
    local_ca?: string;
    allow_invalid_cert?: boolean;
  }

  interface Tunnel {
    url: string;
    close: () => void;
    on(event: "error", listener: (err: Error) => void): void;
    on(event: "close", listener: () => void): void;
  }

  function localtunnel(options: LocalTunnelOptions): Promise<Tunnel>;
  function localtunnel(port: number): Promise<Tunnel>;

  export default localtunnel;
}

