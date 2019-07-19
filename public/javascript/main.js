window.setTimeout(
function() 
{
	var divs=document.querySelectorAll(".circle");
	var bookhead=document.querySelectorAll(".Book-heading");
	
	for(var i=0;i<divs.length;i++){
		divs[i].style.background=random();
		bookhead[i].style.color=divs[i].style.background;
	 }
	
	function random()
	{
		var r=Math.floor(Math.random()*255);
		var g=Math.floor(Math.random()*255);
		var b=Math.floor(Math.random()*255);
		return "rgb("+ r +", "+ g +", "+ b +")";
	}
},
500);