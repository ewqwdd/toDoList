const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/static"))
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://skmykolai:ktbyemQJMazLqZxL@todolist.akntuyw.mongodb.net/toDoListDb");

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('500');
    return next(err);
});


const taskScheme = new mongoose.Schema({
    text: {
    type: String,
    required: true
    }
})
const listScheme = new mongoose.Schema({
    name: String,
    elements: [taskScheme]
})


const Task = new mongoose.model("Task", taskScheme);

const List = new mongoose.model("List", listScheme);

const defalt = new Task({text:"Sample"});

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
    let tasks=[];
    const par = _.kebabCase(req.params.param);
    let foundList = await List.findOne({name:par}).catch(function(err){
        console.log(err);
    })

    if(!foundList){
            let elem = new List({name: par, elements:[defalt]});
            elem.save();
            res.redirect("/"+par);
    }
    else{
        foundList.elements.forEach(function(elem){
            tasks.push(elem);

        })
        res.render("index", {title: _.capitalize(par), tasks: tasks, param:par});
    }



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
    let name = req.body.listName;
    let itemToDelete = req.body.checkbox;
    if(name==="/") {
        await Task.deleteOne({_id: itemToDelete}).catch((err) => {
            console.log(err)
        });
    }
    else{

        List.findOneAndUpdate({name: _.kebabCase(name)}, {$pull: {elements: {_id: itemToDelete}}}).catch(function(err){console.log(err)});
    }
})

app.post("/:param", async function(req,res){
    const par = _.kebabCase(req.params.param);
    let text = req.body.addTask;
    if(_.lowerCase(par)==="delete"){
        res.redirect("/")
    }
    else {
        Current = await List.findOne({name:par}).catch(function(err){console.log(err)});
        let tsk;
        tsk = new Task({text: text});
        Current.elements.push(tsk)
        Current.save().catch(function (err) {
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