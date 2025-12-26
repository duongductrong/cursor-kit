declare module "ngrok" {
  interface NgrokOptions {
    addr?: string | number;
    authtoken?: string;
    subdomain?: string;
    region?: string;
    proto?: "http" | "tcp" | "tls";
    inspect?: boolean;
    host_header?: string;
    bind_tls?: boolean | "both";
    hostname?: string;
    crt?: string;
    key?: string;
    onStatusChange?: (status: string) => void;
    onLogEvent?: (data: string) => void;
  }

  export function connect(opts?: NgrokOptions | number | string): Promise<string>;
  export function disconnect(url?: string): Promise<void>;
  export function kill(): Promise<void>;
  export function getUrl(): string | null;
  export function getApi(): object | null;
}

