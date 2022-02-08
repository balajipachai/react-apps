import './App.css'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import { Button } from 'react-bootstrap'
import useMetaMask from './hooks/metamask';
import {
  ERC20_ABI,
  ERC721_ABI,
  NFTGIVEAWAY_ABI,
  ERC20_DEPLOYED_ADDRESS,
  ERC721_DEPLOYED_ADDRESS,
  NFTGIVEAWAY_ADDRESS,
  OWNER_ADDRESS,
} from "./constants"

function App() {
  const { connect, disconnect, isActive, account, shouldDisable, library } = useMetaMask()
  // eslint-disable-next-line no-unused-vars
  const [web3, setWeb3] = useState(null);
  const [erc20Contract, setErc20Contract] = useState(null);
  const [erc721Contract, setErc721Contract] = useState(null);
  const [giveawayContract, setGiveawayContract] = useState(null);
  const [receivers, setReceivers] = useState(null);

  // Init loading
  useEffect(() => {
    if (library && connect) {
      setWeb3(library)
      initializeContracts(library)
    }
  }, [library]) //eslint-disable-line react-hooks/exhaustive-deps

  const initializeContracts = async (web3) => {
    setErc20Contract(new web3.eth.Contract(ERC20_ABI, ERC20_DEPLOYED_ADDRESS))
    setErc721Contract(new web3.eth.Contract(ERC721_ABI, ERC721_DEPLOYED_ADDRESS))
    setGiveawayContract(new web3.eth.Contract(NFTGIVEAWAY_ABI, NFTGIVEAWAY_ADDRESS))
  }

  const onFileChange = async (e) => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = (e.target.result)
      const receivers = text.split(',')
      // console.log(receivers);
      setReceivers(receivers);
    };
    reader.readAsText(e.target.files[0])
  }

  const CHECK_BALANCE = 5000 // 5K
  const balanceOf = async (address) => (ethers.utils.formatUnits(await erc20Contract.methods.balanceOf(address).call(), 'wei') / 1e18);

  const onDistributeNFTs = async () => {
    try {
      let nftReceivers = [];
      let tokenIds = [];

      // Check balance of receivers to be above CHECK_BALANCE
      // If balance is >= CHECK_BALANCE
      // Add wallet address to nftReceivers array
      // If no, don't add it to nftReceivers array
      for (const recv of receivers) {
        // console.log("Receiver is: ", recv);
        let balance = await balanceOf(recv)
        // console.log("Balance of receiver is: ", balance);
        if (balance > CHECK_BALANCE) {
          nftReceivers.push(recv);
        }
      }

      // Get distributedNFTs from the contract
      const distributedNFTs = await giveawayContract.methods.getDistributedNFTs(ERC721_DEPLOYED_ADDRESS).call();
      // console.log("DistributedNFTs are: ", distributedNFTs);
      const totalNFTs = await erc721Contract.methods.totalCryptoTrophies().call();
      // console.log("Total NFTs are: ", totalNFTs);

      do {
        // Generate random number between 0 to ERC721 TotalSupply
        const randomInt = Math.floor(Math.random() * totalNFTs);
        // console.log("randomInt: ", randomInt);

        // Check whether generated random number exists in distributedNFTs
        // If yes, generate another random number
        // If No, add generated random number to the tokenIds array
        // Generate random number and add to tokenIds array till tokenIds.length == nftReceivers.length
        if ((distributedNFTs.findIndex((element) => ethers.BigNumber.from(element).eq(randomInt)) === -1)) {
          tokenIds.push(randomInt);
        }
      } while (nftReceivers.length !== tokenIds.length);

      // console.log("nftReceivers: ", nftReceivers, "tokenIds", tokenIds);

      await giveawayContract.methods.distributeNFTs(OWNER_ADDRESS, ERC721_DEPLOYED_ADDRESS, nftReceivers, tokenIds).send({ from: account });
      alert("Transaction confirmed");
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <Button variant="secondary" onClick={connect} disabled={shouldDisable}>
          <img src="images/metamask.svg" alt="MetaMask" width="50" height="50" /> Connect to MetaMask
        </Button>
        <div className="mb-3">
          <p className="fs-6">Upload .csv file to distribute NFTs</p>
          <input className="form-control" type="file" disabled={!isActive} onChange={(e) => onFileChange(e)} />
          <button type="button" className="btn btn-primary" disabled={!receivers} onClick={() => onDistributeNFTs()}>
            Distribute
          </button>
        </div>
        <p className="fs-6">{isActive ? `Connected Account: ${account}` : 'Please connect wallet'}</p>
        <Button variant="danger" onClick={disconnect}>
          Disconnect MetaMask<img src="images/noun_waving_3666509.svg" width="50" height="50" alt='' />
        </Button>
      </header>
    </div>
  );
}

export default App;
