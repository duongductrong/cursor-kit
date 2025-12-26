import type { TunnelProvider } from "../types/init";

export interface TunnelConnection {
  url: string;
  close: () => Promise<void>;
}

interface LocalTunnelInstance {
  url: string;
  close: () => void;
}

async function createLocaltunnel(port: number): Promise<TunnelConnection> {
  try {
    const localtunnel = (await import("localtunnel")).default;
    const tunnel = (await localtunnel({ port })) as LocalTunnelInstance;

    return {
      url: tunnel.url,
      close: async () => {
        tunnel.close();
      },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Cannot find module") ||
        error.message.includes("MODULE_NOT_FOUND"))
    ) {
      throw new Error(
        "localtunnel is not installed. Run: npm install localtunnel"
      );
    }
    throw error;
  }
}

async function createNgrokTunnel(port: number): Promise<TunnelConnection> {
  try {
    const ngrok = await import("ngrok");
    const url = await ngrok.connect(port);

    return {
      url,
      close: async () => {
        await ngrok.disconnect(url);
        await ngrok.kill();
      },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Cannot find module") ||
        error.message.includes("MODULE_NOT_FOUND"))
    ) {
      throw new Error(
        "ngrok is not installed. Run: npm install ngrok\n" +
          "Then configure your auth token: npx ngrok config add-authtoken <your-token>"
      );
    }
    if (
      error instanceof Error &&
      error.message.includes("authtoken")
    ) {
      throw new Error(
        "ngrok requires an auth token. Get one at https://dashboard.ngrok.com/get-started/your-authtoken\n" +
          "Then run: npx ngrok config add-authtoken <your-token>"
      );
    }
    throw error;
  }
}

export async function createTunnel(
  port: number,
  provider: TunnelProvider
): Promise<TunnelConnection> {
  switch (provider) {
    case "localtunnel":
      return createLocaltunnel(port);
    case "ngrok":
      return createNgrokTunnel(port);
    default:
      throw new Error(`Unknown tunnel provider: ${provider}`);
  }
}

export function getTunnelProviderLabel(provider: TunnelProvider): string {
  switch (provider) {
    case "localtunnel":
      return "localtunnel";
    case "ngrok":
      return "ngrok";
  }
}

