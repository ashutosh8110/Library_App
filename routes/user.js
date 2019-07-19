var express		 = require("express");
var router 		 = express.Router();
var multer    	 = require('multer');
var cloudinary 	 = require('cloudinary');
var User   	   	 = require("../models/user.js");
var Book         = require("../models/book.js");
var Bookinstance = require("../models/bookinstance.js");
var passport     = require("passport");
var moment       = require("moment");


//multer helps in handling req.file 
//1.setting storage as diskstto
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

//only image are accepted check the extension
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		console.log("uploading");
        return cb(new Error('Only image files are allowed!'), false);
    }
	cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

//config cloudinary
cloudinary.config({ 
  cloud_name: 'dmpqougba', 
  api_key: process.env.CLOUDINARYKEY, 
  api_secret:process.env.CLOUDINARYSECRET
});

//get register form
router.get("/register",checkAdmin,function(req,res){
	res.render("register");
});

//register the user using passport and cloudinary to upload image 
router.post("/register",checkAdmin,upload.single('image'),function(req,res){
cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
	if(err) {
		console.log(err);
		return res.redirect('back');
	}

	User.register(new User({
		username  :req.body.username,
		firstname :req.body.firstname,
		lastname  :req.body.lastname,
		Age       :Number(req.body.age),
		image     :result.secure_url,
		imageID   :result.public_id, 
		isAdmin   :(req.body.secret=="request$#%^&%#")}),req.body.password,function(err,user){
			if(err)
			{
				console.log(err);
				return res.render("register");		
			}

			passport.authenticate("local")(req,res,function(){
				res.redirect("/"); 
			});
		});
	});
});
//give login form
router.get("/login",function(req,res){
	res.render("login");
});

//login the user
router.post("/login",passport.authenticate("local",
	{
		failureRedirect:"/login",
		successRedirect:"/books",
	}),function(req,res){
});

//get userpage 
router.get("/user/:id",checkUser,function(req,res){
	//populate('books').populate('books.bookcopy').
	User.findById(req.params.id).populate({
    path: 'books',
    model: 'bookinstance',
    populate: {
      path: 'bookcopy',
      model: 'book'
    }
  }).exec(function(err,user){
		if(err){
			console.log(err);
			return res.redirect("/");
		}
		
		if(user.isAdmin) return res.render("AdminPage",{user:user});
		res.render("userProfile",{user:user});
	});
});
//logout the user
router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/books");
});

//give admin page
router.get("/admin/userpage",checkAdmin,function(req,res){
	User.findById(req.query.userid).populate({
    path: 'books',
    model: 'bookinstance',
    populate: {
      path: 'bookcopy',
      model: 'book'
    }
  }).exec(function(err,user){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		res.render("adminform",{user:user});
	});
});

//addbooks to a user account by admin only
router.post("/addbooks/:id",checkAdmin,function(req,res){
	User.findById(req.params.id,function(err,user){
		if(err)
		{
			console.log(err);
			return res.redirect("back");
		}
		if(req.body.BookId){
		Book.findById(req.body.BookId,function(err,book){
			if(err)console.log(err);
			else {
				Bookinstance.create({bookcopy:book},function(err,copy){
					if(err)
					{
						console.log(err);
						return res.redirect("back");
					}
					book.number=book.number-1;
					book.save();
					user.books.push(copy);
					user.save();
					res.redirect("back");
				});
			}
		});}
	});
});

//take book from user by admin only and fine to user account if >14 days 
router.post("/takebook/:userid/:bookid/:copyid",checkAdmin,function(req,res){
	User.findByIdAndUpdate(req.params.userid, {
		$pull: {comments: req.params.copyid}}, function(err,user) {
			if(err){ 
				console.log(err);
				res.redirect('/');
			} else {
				var x;
				Bookinstance.findById(req.params.copyid,function(err,copy){
					if(err){
						console.log(err);
						return res.redirect("back");
					}
					x=Math.floor(moment.duration(moment().diff(copy.issuedOn)).asDays()-14);
				});
				
				Bookinstance.findByIdAndRemove(req.params.copyid,function(err) {
				if(err) {
					console.log(err);
					return res.redirect('/');
				}
				if(x>0)user.fine+=x;
				user.save();
				Book.findById(req.params.bookid,function(err,book){
				book.number=book.number+1;
				book.save();
				res.redirect("back");
				});
			});
		}
	});
});
//minus the fine given to librarian
router.post("/fine/:id",checkAdmin,function(req,res){
	User.findById(req.params.id,function(err,user){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		
		user.fine-=req.body.fine;
		user.save();
		res.redirect("back");
	});
});

function checkUser(req,res,next){
	if(req.isAuthenticated())
	{
		if(req.user._id.equals(req.params.id))
		return next();
		
		return res.redirect("back");
	}
	else 
	res.redirect("/login");
}

function checkAdmin(req,res,next){
	if(req.isAuthenticated())
	{
		if(req.user.isAdmin)
		return next();
	}
	else res.redirect("/login");
}

module.exports=router;
