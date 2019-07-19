var express	= require("express");
var router 	= express.Router();
var Book 	= require("../models/book.js");

//show all books when the route is requested
router.get("/books",function(req,res){
	var noMatch = null;
	if(req.query.search) 
	{
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Book.find({$or:[{name: regex},{author:regex}]},function(err, allbooks)
		{
			if(err){
				console.log(err);
				res.redirect("back");
			} else {
				if(allbooks.length < 1) {
				noMatch = "No book match that query, please try again.";
				}
				res.render("Books",{Books:allbooks, noMatch: noMatch});
			}
		});
	} 
	else 
	{
		Book.find({},function(err,books){
		if(err)
		{
			console.log(err);
			res.redirect("back");
		}
		else res.render("Books",{Books:books, noMatch: noMatch});
		});
	}
});

//give new book form to the library by admin only
router.get("/books/new",checkAdmin,function(req,res){
	res.render("newBook");
});

//add new book to the library
router.post("/books",checkAdmin,function(req,res){
	Book.create(req.body.Book,function(err,book){
		if(err)
		{
			console.log(err);
			return res.redirect("/books");
		}
		
		else res.redirect("/books");
	});
	
});

function checkAdmin(req,res,next){
	if(req.isAuthenticated())
	{
		if(req.user.isAdmin)
		return next();
	}
	res.redirect("back");
}


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports=router;
