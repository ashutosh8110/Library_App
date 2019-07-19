var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
	username :String,
	password :String,
	firstname:String,
	lastname :String,
	image    :String,
	imageID  :String,
	Age      :{
		type:Number,
		min:18
	},
	isAdmin  :{
		type:Boolean,
		default:false
	},
	fine:{
		type:Number,
		default:0,
		min:0
	},
	books:[{
				type:mongoose.Schema.Types.ObjectId,
				ref:'bookinstance'
		}]
});
UserSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("user",UserSchema);