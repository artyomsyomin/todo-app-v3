//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-artyom:UZ5xiSQKDZ7RQmOP@cluster0.wb0l1.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const toDoElementSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", toDoElementSchema);

const item1 = new Item({
  name: "Welcome to to-do List"
});

const item2 = new Item({
  name: "Click + to add new items"
});

const item3 = new Item({
  name: "<-- click here to delete an item"
});

const itemsArray = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  item: [toDoElementSchema]
});

const ListItem = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, result) {
    if (result.length === 0) {
      Item.insertMany(itemsArray, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today",newListItems: result });
    }
  });

});

app.get("/:customListName", function(req, res) {
  const listName = _.capitalize(req.params.customListName);

  ListItem.findOne({name: listName}, function(err, result){
    if (!err) {
      if (!result) {
        // console.log ("doesn't exists");

        const list = new ListItem({
          name: listName,
          item: itemsArray
          });

        list.save();
        res.redirect("/" + listName);

      } else {
        // console.log("exists!");
        res.render("list", {listTitle: result.name, newListItems: result.item});
      }
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listTitle === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    ListItem.findOne({name: listTitle}, function(err, result) {
      result.item.push(newItem);
      result.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete",function(req, res) {
  const itemId = req.body.checkbox;
  const listTitle = req.body.listName ;

  console.log(listTitle);

if (listTitle === "Today") {
  Item.findByIdAndDelete(itemId, function(err){
    if (!err) {
      console.log("Checked item is deleted");
      res.redirect("/");
    }
  });
} else {
  ListItem.findOneAndUpdate({name: listTitle}, {$pull: {item: {_id: itemId}}}, function(err, result){
    if (!err) {
      res.redirect("/" + listTitle);
    }
  })
}
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
