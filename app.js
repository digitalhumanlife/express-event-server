const express = require('express');
const { ethers } = require('ethers');
const {MongoClient} = require('mongodb');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_URL = process.env.NODE_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require('./GCPropToken.json');

const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

const mongoURI = 'mongodb://localhost:27017'
const dbName = 'gcToken'
const collectionName = 'updateDiv_events'
const client = new MongoClient(mongoURI)
let db, collection 

async function connectToMongo(){
  await client.connect()
  db = client.db(dbName)
  collection = db.collection(collectionName)
  console.log(":: Connected to MongoDB!")
}

async function insertEvent(event){
  // console.log("::inside inerstOne", event)
  await collection.insertOne(event)
  console.log(":: Inserted event into MongoDB!", event)
  console.log(":: ---------------------- insertEvent() done! -----------------------")

}

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

async function startServer(){
  await connectToMongo()
  const filter = {
        address: CONTRACT_ADDRESS,
        topics:[ethers.utils.id("UpdatedDiv(address,uint256)")]
      }

  // provider.on(filter, (e)=>{
  //   console.log("Event detected(PROVIDER): "+ JSON.stringify(e, null, 2))
  // })

  contract.on("UpdatedDiv", async (holderAddress, value, event)=>{
    console.log("Event detected(CONTRACT): "+ holderAddress + " " + value)
    //console.log("event > ", event)
    //console.log(event)
    const eventData = {
      holderAddress: holderAddress,
      divdValue: value.toString(),
    }
    await insertEvent(eventData)
  }).on("error", (error)=>{
    console.log("Error: "+ error)
  })
  console.log(":: Server is listening for events...")

}
startServer()


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

