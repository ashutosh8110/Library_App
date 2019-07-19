var mongoose=require("mongoose");

var BookSchema=new mongoose.Schema({
	name:String,
	author:String,
	category:String,
	number:Number
});

module.exports=mongoose.model("book",BookSchema);
