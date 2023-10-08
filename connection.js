const mongoose=require('mongoose');
require('dotenv').config();


const url=process.env.DATABASE;



const connection=mongoose.connect(url).then(()=>{
    console.log('successful');
}).catch((err)=>{
    console.log('error');
});

module.exports=connection;