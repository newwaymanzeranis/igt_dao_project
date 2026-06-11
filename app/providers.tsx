import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig, darkTheme, lightTheme  } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "wagmi/chains";
/* import { zkSyncSepolia } from "./chains"; */
import {useState, useEffect} from "react";
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { ApolloProvider } from '@apollo/client/react'; // Direct path for React components


const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.studio.thegraph.com/query/1744365/dao-project/v0.0.12',
    fetch: (...args) => fetch(...args),
  }),
  cache: new InMemoryCache(),
});

const config = getDefaultConfig({
  appName: "wagmi app",
  projectId: "YOUR_PROJECT_ID",
  chains: [sepolia],
  ssr: false,
});
/* export const config = getDefaultConfig({
  appName: "ETH Sender",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [sepolia, zkSyncSepolia],
  ssr: false,
});
 */

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      {mounted && (
          <RainbowKitProvider theme={darkTheme()}>
            <ApolloProvider client={client}>
            {children}
            </ApolloProvider>
          </RainbowKitProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
