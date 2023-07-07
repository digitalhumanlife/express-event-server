const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_URL = process.env.NODE_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require('./GCPropToken.json');

const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

async function getTransferDetails(event) {
  const { account: from, to, amount } = event.args;
  console.log("Inside getTransDetail: "+event.args);
  console.log(`From: ${from} - To: ${to} - Value: ${amount} detected`);
}

async function getEvents() {
  const blockNumber = await provider.getBlockNumber();
  const historicalBlock = blockNumber - 1000 < 0 ? 0 : blockNumber - 1000;
  console.log(`Getting events from block ${historicalBlock} to ${blockNumber}`);
  
  const filter = contract.filters.UpdatedDiv();
  const events = await contract.queryFilter(filter, historicalBlock);

  events.forEach(getTransferDetails);
}

getEvents();
console.log(':: ---------------------- getEvents() done! -----------------------');
const filter = {
      address: CONTRACT_ADDRESS,
      topics:[ethers.utils.id("UpdatedDiv(address,uint256)")]
    }
provider.on(filter, (e)=>{
  console.log("Event detected(PROVIDER): "+ JSON.stringify(e, null, 2))
})
contract.on("UpdatedDiv", (holderAddress, value, event)=>{
  console.log("Event detected(CONTRACT): "+ holderAddress + " " + value)
  console.log("evevnt > ", event)
  //console.log(event)
})

// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
//   const filter = {
//     address: CONTRACT_ADDRESS,
//     topics:[ethers.utils.id("UpdatedDiv(address,uint256)")]
//   }
//   provider.on(filter, (e)=>{
//     console.log("Event detected: "+ e.account)
//   })
//   contract.on("UpdatedDiv", (holderAddress, value, event)=>{
//     console.log("Event detected: "+ holderAddress + " " + value)
//     console.log(event)
//   })
// });


// const express = require('express')
// const {Web3} = require('web3')
// require('dotenv').config()

// const app = express()
// const PORT = process.env.PORT || 3001
// const NODE_URL = process.env.NODE_URL;
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
// const CONTRACT_ABI = require('./GCPropToken.json')
// //console.log (CONTRACT_ABI)
// //const web3ws = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const web3 = new Web3(NODE_URL);
// const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)

// async function getTransferDetails(event){
//     const {from, to, amount} = event.returnValues
//     console.log(event.returnValues)
//     // if (convertedAmount > 0) {
//         console.log(`From:  ${from} - To: ${to} - Value ${amount} detected`)
//     // }
// }

// async function getEvents(){
//     const latestBlock = await web3.eth.getBlockNumber()
//     let historicalBlock = latestBlock.toString() - 1000
//     if (historicalBlock < 0) {
//         historicalBlock = 0
//     }
//     console.log(`Getting events from block " ${historicalBlock} to ${latestBlock} "`)
//     const events = await contract.getPastEvents('UpdatedDiv', { fromBlock: historicalBlock, toBlock: 'latest'})

//     events.forEach(getTransferDetails);
// }

// getEvents()
// console.log(":: getEvents() done!")

// // async function subscribeToEvents() {
// //   console.log('Subscribing to events...');
// //   contract.events
// //     .UpdatedDiv()
// //     .on('data', function (event) {
// //       console.log('Event:', event);
// //     })
// //     .on('error', function (error, receipt) {
// //       console.log('Error:', error);
// //     });

// //   console.log(':: contract.events.UpdatedDiv() done!');
// // }


// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}`);
//   //subscribeToEvents();
// });