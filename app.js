const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
    res.render("index");
});

app.get("/capture",function(req,res){
    res.render("capture");
});

app.get("/recordAttendance",function(req,res){
    res.render("recordAttendance");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("Server started at port: " +PORT)
})