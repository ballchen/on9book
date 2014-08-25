var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors');
var mongoose = require('mongoose');
var _ = require('underscore');
var request = require("request");

var mongo = {
	host: "127.0.0.1",
	db: "on9book"
};
var port = 9000;
var fs = require('fs');


mongoose.connect('mongodb://'+mongo.host+'/'+mongo.db);

var Bookinfo = mongoose.model('Bookinfo', { name: String, createAt: {type: Date, default: Date.now}, author: String});
var Image = mongoose.model("Image", { bookid: {type:String, required:true}, link: {type:String, required:true}, deletehash: String, id:{type:String, required:true}});

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/",function(req,res){
	res.send("hello on9!");
})


app.get('/book',function(req, res){
	Bookinfo.find().exec(function(err , results){
		if(err) return res.json({success: false, msg: err});
		res.json({success: true, data: results});
	});
})
app.get('/book/:id',function(req, res){
	Bookinfo.findOne({ _id: req.params.id }).exec(function(err, result){
		if(err) return res.json({success: false, msg: err});
		if(!result) return res.json({success: false, msg: "no book."});
		res.json({success: true, data: result});
	})
})
app.post("/book",function(req, res){
	var newbook = new Bookinfo({
		name: req.body.name,
		author: req.body.author
	})
	newbook.save(function(err, book){
		if(err) return res.json({success: false, msg: err});
		res.json({success: true, data: book});
	})
})
app.put("/book/:id", function(req, res){
	var updatebook = _.pick(req.body, "name","author");
	Bookinfo.update({ _id: req.params.id}, {$set:updatebook}, function(err, result){
		if(err) return res.json({success: false, msg: err});
		res.json({success: true, data: result});
	})
})
app.delete('/book/:id',function(req, res){
	if(!req.params.id) return res.json({success: false, msg:"no param"});

	Bookinfo.remove({ _id: req.params.id}).exec(function(err){
		if(err) return res.json({success:false, msg: err});
		return res.json({success: true});
	})
})

app.post('/image/:bookid/:num',function(req, res){
	if(!req.params.bookid || !req.params.num) return res.json({success:false, msg: "missing params."})

	
	var imgurdata = req.body;
	if(imgurdata.data.error) return res.json({success: false, msg: imgurdata.data.error});
	var newimage = _.extend(_.pick(imgurdata.data,"link","deletehash","id"),{bookid: req.params.bookid, num: req.params.num});

	var newimagedb = new Image(newimage);
	newimagedb.save(function(err, result){
		if(err) return res.json({success:false, msg:err});
		res.json({success:true, data: result});
	})

})

app.get("/image/:bookid",function(req, res){
	Image.find({bookid: req.params.bookid}).exec(function(err, results){
		if(err) return res.json({success:false, msg:err});
		res.json({success:true, data: results});
	})
})

app.delete("/image/:id",function(req, res){
	if(!req.params.id) return res.json({success: false, msg:"missing params."})
	Image.remove({ id: req.params.id}).exec(function(err){
		if(err) return res.json({success:false, msg: err});
		res.json({success: true});
	})
})

app.get("/convert", function(req, res){
	var dir = __dirname + "/img/"
	for (var i = 1; i <= 16; i++) {
		var file = dir + i + '.png';
		fs.readFile(file, function (err, data) {
		  if (err) throw err;
	        	  var img = new Buffer(data, 'binary').toString('base64');
		  request.post('http://127.0.0.1:9000/image/53f95f18508d243956283438/'+i).form({image:img})
		});
	};
})

console.log("Start On9 at "+port);
app.listen(port);


