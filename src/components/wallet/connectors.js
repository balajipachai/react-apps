import { InjectedConnector } from '@web3-react/injected-connector'
/**
 * 4: Rinkeby
 * 56: BSC Mainnet
 * 97: BSC Testnet
 */
export const injected = new InjectedConnector({ supportedChainIds: [4, 56, 97] })