var mongoose=require("mongoose");

var BookSchema=new mongoose.Schema({
	bookcopy:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'book'
	},
	
	issuedOn:{
		type:Date,
		default:Date.now()
	}
});

module.exports=mongoose.model("bookinstance",BookSchema);