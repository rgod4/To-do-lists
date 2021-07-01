//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser:true,useUnifiedTopology:true});

let itemSchema = {
    name : String  
};

let listSchema = {
  name : String,
  items : [itemSchema]
}

let currList="myList";

const defaultarray=[];
const List =mongoose.model("AllList",listSchema);
const firstlist = new List({
  name : "myList",
  items : defaultarray
});
const Item = mongoose.model("Item", itemSchema);

app.get("/", function(req, res) {
  List.findOne({name : currList} , (err,reqlist)=>{
  let listName=reqlist.name;
  let listItems=reqlist.items;
  res.render("list", {listName: listName,listItems:listItems});
  });
});

app.post("/", function(req, res){
  let itemName=req.body.newItem;
  List.findOne({name : currList},(err,reqlist)=>{
    const newitem=new Item({
      name : itemName
    })
    newitem.save();
    reqlist.items.push(newitem);
    reqlist.save();
  })
  res.redirect("/");
}); 

app.get("/newlist",(req,res)=>{
  res.render("newlist",{show : false});
});

app.post("/newlist",(req,res)=>{
  const lname=req.body.newItem;
  List.findOne({name : lname},(err,reqlist)=>{
    if(err){
      console.log(err);
    }
    else{
      if(!reqlist){
        let newList=new List({
          name : lname,
          items : defaultarray
        })
        newList.save();
        currList=lname;
        res.redirect("/");
      }
      else{
        res.render("newlist",{show : true});
      }
    }
  })
})

app.post("/removeitem", (req,res)=>{
  let id=req.body.btn;
  Item.deleteOne({name : id},(err)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log("item deleted");
    }
  })
  List.findOne({name : id},(err,reqlist)=>{
    if(err){
      console.log(err);
    }
    else{
      reqlist.items.deleteOne({name : id},(err)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log("item deleted from both");
        }
      })
    }
  })
  res.redirect("/");
});

app.get("/yourlists",(req,res)=>{
  List.find({},(err,reqlist)=>{
    if(err){
      console.log(err);
    }
    else{
      res.render("Yourlist",{lists : reqlist});
    }
  })
});

app.post("/removelist",(req,res)=>{
  let id=req.body.btn;
  List.deleteOne({_id : id},(err)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log("Deleted a List");
    }
  })
  res.redirect("/yourlists");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:tag",(req,res)=>{
  currList=req.params.tag;
  res.redirect("/");
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
