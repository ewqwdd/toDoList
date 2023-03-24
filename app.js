const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/static"))
app.set("view engine", "ejs");
mongoose.connect("mongodb://127.0.0.1:27017/todolist");

const taskScheme = new mongoose.Schema({
    text: {
    type: String,
    required: true
    }
})

const Task = new mongoose.model("Task", taskScheme);

let Current = Task;


app.get("/", async function(req, res){
    let tasks=[];
    let today = new Date();
    let options = {
        weekday:"long",
        day:"numeric",
        month:"long"
    };
    await Task.find().then(function(data){
        data.forEach((elem)=> {
            tasks.push(elem);
        })
    }).catch(function(err){
        console.log(err);
    })

    let day = today.toLocaleDateString("en-UK", options)

    res.render("index", {title: day, tasks: tasks, param:"/", delParam:"/delete"});
});

app.get("/:param", async function(req, res){

     const par = req.params.param;
    Current = new mongoose.model(_.kebabCase(par), taskScheme);
    let tasks=[];
    await Current.find().then(function(data){
        data.forEach((elem)=> {
            tasks.push(elem);
        })
    }).catch(function(err){
        console.log(err);
    })

    res.render("index", {title: _.capitalize(par), tasks: tasks, param:par, delParam:"/delete/"+par});

})

app.post("/", function(req,res){

    let tsk;
    tsk = new Task({text: req.body.addTask})
    tsk.save().catch(function(err){
        console.log(err);
    });
    res.redirect("/");

})
app.post("/delete", async function(req, res){
    await Task.deleteOne({_id:req.body.checkbox}).catch((err)=>{console.log(err)});
})

app.post("/:param", function(req,res){
    const par = req.params.param;
    if(_.lowerCase(par)=="delete"){
        res.redirec("/")
    }
    else {
        Current = new mongoose.model(_.kebabCase(par), taskScheme);
        let tsk;
        tsk = new Current({text: req.body.addTask})
        tsk.save().catch(function (err) {
            console.log(err);
        });
        res.redirect("/" + par);
    }
})



app.post("/delete/:param", async function(req, res){
    let par = req.params.param;

    await Current.deleteOne({_id:req.body.checkbox}).catch((err)=>{console.log(err)});
})

app.listen(3000);