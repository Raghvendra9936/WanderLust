const mongoose = require("mongoose")
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/wonderlust";
main()
  .then(()=>{
    console.log("connect to db");
  })
  .catch((err)=>{
    console.log(err);
  });
  
async function main(){
    await mongoose.connect(mongo_url);
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({ 
      ...obj,
      owner: "66d5ebb8879434e5f1db3c4a",
     }));
    await Listing.insertMany(initData.data);
    console.log("data was initialixed");
};

initDB();