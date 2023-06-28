const express = require('express')
const {Web3} = require('web3')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001
const NODE_URL = process.env.NODE_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require('./GCPropToken.json')
//console.log (CONTRACT_ABI)

const web3 = new Web3(NODE_URL);
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)

async function getTransferDetails(event){
    const {from, to, amount} = event.returnValues
    console.log(event.returnValues)
    // if (convertedAmount > 0) {
        console.log(`From:  ${from} - To: ${to} - Value ${amount} detected`)
    // }
}

async function getEvents(){
    const latestBlock = await web3.eth.getBlockNumber()
    let historicalBlock = latestBlock.toString() - 1000
    if (historicalBlock < 0) {
        historicalBlock = 0
    }
    console.log(`Getting events from block " ${historicalBlock} to ${latestBlock} "`)
    const events = await contract.getPastEvents('UpdatedDiv', { fromBlock: historicalBlock, toBlock: 'latest'})

    events.forEach(getTransferDetails);
}

getEvents()

async function subscribeToEvents() {
    contract.events.UpdatedDiv()
      .on('data', getTransferDetails)
      .on('error', (error) => {
        console.error('Error occurred:', error);
      });
  }
  
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    subscribeToEvents();
  });