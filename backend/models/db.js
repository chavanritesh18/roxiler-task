const mongoose = require('mongoose')

const transactionSchema  =  new mongoose.Schema({
    title:{
        type: String,
        required :true,
    },
    description : {
        type:String
    },
    price:{
        type: Number,
        required :true,
    },
    category:{
        type:String,
        required:true
    },
    dateOfSale:{
        type:Date,
        required: true
    }
})

const Transaction  = new mongoose.model('Transaction' , transactionSchema);

module.exports =  Transaction