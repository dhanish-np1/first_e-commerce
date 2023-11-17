const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    require:true
  },

  password: {
    type: String,
    required:true
  },
  
  email:{
    type:String,
    required:true
  },

  is_admin:{
    type:Number,
    default:0
  },
});

const Admin=mongoose.model("admin",adminSchema)

module.exports = Admin;