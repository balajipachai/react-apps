import useMetaMask from '../../hooks/metamask';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import {
    ERC20_ABI,
    ERC721_ABI,
    NFTGIVEAWAY_ABI,
    ERC20_DEPLOYED_ADDRESS,
    ERC721_DEPLOYED_ADDRESS,
    NFTGIVEAWAY_ADDRESS,
    OWNER_ADDRESS,
    TOKEN_DECIMALS,
    BSC_MAINNET_URL,
    BSC_TESTNET_URL
} from "../../constants"

let ERC20_CONTRACT;
let ERC721_CONTRACT;
let NFTGIVEAWAY_CONTRACT;
let web3;

const CHECK_BALANCE = ethers.BigNumber.from('5000000000000000000000') // 5K
const balanceOf = async (address) => (ethers.utils.formatUnits(await ERC20_CONTRACT.balanceOf(address), 'wei') / 1e18);


export default function Distribute() {
    const { library, connect } = useMetaMask();

    const [web3, setWeb3] = useState(null);

    // Init loading
    useEffect(() => {
        if (library && connect) {
            web3 = library
            printBalance()
        }
    }, [])

    const printBalance = async () => {
        ERC20_CONTRACT = new web3.eth.Contract(ERC20_ABI, ERC20_DEPLOYED_ADDRESS)
        // console.log("Balance of address is: ", (await balanceOf("0x2372fe430fD67456946b7C664C5b02aE0C9Aae48")))
    }

    return (
        <div className="mb-3">
            <p className="fs-6">Upload .csv file to distribute NFTs</p>
            <input className="form-control" type="file" id="formFile" />
        </div>
    )
}