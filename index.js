//  async function getAccount() {
//     // Or window.ethereum if you don't support EIP-6963.
//     const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
//         .catch((err) => {
//             if (err.code === 4001) {
//             // EIP-1193 userRejectedRequest error.
//             // If this happens, the user rejected the connection request.
//             console.log("Please connect to MetaMask.");
//             } else {
//             console.error(err);
//             }
//         });
//     const account = accounts[0];
//     showAccount.innerHTML = account;
// }

import { ethers } from "./ethers-6.7.min.js";
import { abi, contractAddress } from "./constants.js";

const buttonConnect = document.getElementById("buttonConnect");
const buttonFund = document.getElementById("buttonFund");
const buttonBalance = document.getElementById("buttonBalance");

buttonConnect.onclick = connect;
buttonFund.onclick = fund;

buttonBalance.onclick = getBalance;

async function connect() {
  if (typeof window.ethereum != "undefined") {
    const accounts = await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => {
        console.error(err);
      });
    const account = accounts[0];
    document.getElementById("buttonConnect").innerHTML = account;
  } else {
    document.getElementById("buttonConnect").innerHTML = "notconnect";
    console.log("not meta mask");
  }
}

async function getBalance() {
  if (window.ethereum != null) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.formatEther(balance.toString()));

    document.getElementById("buttonBalance").innerHTML = ethers.formatEther(
      balance.toString()
    );
  }
}

async function fund(ethamount) {
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    const provider = ethers.getDefaultProvider();
  } else {
    // Connect to the MetaMask EIP-1193 object. This is a standard
    // protocol that allows Ethers access to make all read-only
    // requests through MetaMask.
    console.log(ethers);
    const provider = new ethers.BrowserProvider(window.ethereum);

    // provider = new ethers.providers.Web3Provider(window.ethereum);
    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const fundResponse = await contract.fund({
        value: ethers.parseEther("0.2"),
      });

      await listenFromTransaction(fundResponse, provider);
      console.log("down");
      // const receipt = await fundResponse.wait();
    } catch (error) {
      console.log(error);
    }

    // console.log(receipt);
  }
}

function listenFromTransaction(transactionResponse, provider) {
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, () => {
      console.log(`manning ${transactionResponse.hash}`);
    });
  });
}
