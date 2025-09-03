// import '@rainbow-me/rainbowkit/styles.css';

// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// import {
//   liskSepolia
// } from 'wagmi/chains';
// import { http } from 'wagmi';

// export const config = getDefaultConfig({
//   appName: 'My RainbowKit App',
//   projectId: 'YOUR_PROJECT_ID',
//   chains: [liskSepolia],
//   ssr: true, // If your dApp uses server side rendering (SSR)
//   transports: {
//     [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com/'),
//   },
// });

import { http } from 'wagmi'
import {createConfig} from '@privy-io/wagmi';
import { liskSepolia } from 'viem/chains'

export const config = createConfig({
  chains: [liskSepolia],
  transports: {
    [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com/'),
  },
})