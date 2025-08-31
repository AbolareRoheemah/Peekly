"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from '../wagmi';
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={lightTheme({
            accentColor: '#EC855C',
            accentColorForeground: 'white',
            borderRadius: 'small',
            fontStack: 'system',
          })}
        >
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
    </RainbowKitProvider>
    </QueryClientProvider>
    </WagmiProvider>
  );
}
