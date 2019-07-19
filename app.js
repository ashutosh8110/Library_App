var express               = require("express");
var app                   = express();
var bodyparser            = require("body-parser");
var mongoose              = require("mongoose");
var passport              = require("passport");
var LocalStratergy        = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User                  = require("./models/user.js");
var moment                = require("moment");
var querystring           = require("querystring");
var BookRoute             = require("./routes/books.js");
var UserRoute             = require("./routes/user.js");

mongoose.connect(process.env.DATABASEURL,{useNewUrlParser:true});
//app.use("/public", express.static(__dirname + '/public'));
app.use(express.static(__dirname + "/public"));
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");

app.locals.moment=moment;
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 app.use(function(req,res,next){
 	res.locals.curUser=req.user;
	 next();
 });

app.get("/",function(req,res){
	res.render("landing");
});

app.use("/",BookRoute);
app.use("/",UserRoute);

app.listen(3000, function(){
   console.log(process.env,"The Server Has Started!");
});