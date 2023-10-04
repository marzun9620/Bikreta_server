const mongoose=require('mongoose');
require('dotenv').config();


const url=`mongodb+srv://enamulMarzun:shamsun99@cluster0.aoy5j7e.mongodb.net/marzun?retryWrites=true&w=majority`;



const connection=mongoose.connect(url).then(()=>{
    console.log('successful');
}).catch((err)=>{
    console.log('error');
});

module.exports=connection;