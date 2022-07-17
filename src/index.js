var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const { response } = require("express");

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended:true
}));

var email,password,name,group;

//to start the app on index.html
app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
});
console.log("Listening on PORT 3000");


//database connection
mongoose.connect('mongodb://localhost:27017/Chatverse',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"));

//login
app.post("/log_in",async(req,res)=>{
    try{
        email = req.body.email;
        password = req.body.password;
        const user=await db.collection("Users").findOne({email:email});
        if(user.password==password)
        {
            res.sendFile(path.join(__dirname,"../public/Chat/index.html"));
        }
        else 
        {
            res.status(400).send("Invalid Credentials.");
        }
    }
    catch(error)
    {
        res.status(400).send("Invalid Credentials.");
    }
});

//register
app.post("/sign_up",async(req,res)=>{
    var fname = req.body.fname;
    var lname = req.body.lname;
    email = req.body.email;
    password = req.body.password;
    try
    {
        const user=await db.collection("Users").findOne({email:email});
        if(user!=null)
        {
            res.status(400).send("User Already Exist.");
        }
        else
        {
            var data = {
                "first_name": fname,
                "last_name": lname,
                "email" : email,
                "password" : password
            }
            db.collection('Users').insertOne(data,(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("Record Inserted Successfully");
            });
            return res.redirect('login.html');
        }
    }
    catch(error)
    {
        console.log(error);
    }
});

const path = require("path");
const { fstat } = require("fs");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname,"../public/Chat/")));

server.listen(3000);
//new
io.on("connection",function(socket){
    console.log("Connection");
    socket.on("join",function(room,room_pass){
        group=room+room_pass;
        socket.join(group);
    });
    socket.on("newuser",function(username,room,room_pass){
        group=room+room_pass;
        socket.to(group).emit("update",username+" joined the conversation");
    });
    socket.on("exituser",function(username,room,room_pass){
        group=room+room_pass;
        socket.to(group).emit("update",username+" left the conversation");
        socket.leave(group);
    });
    socket.on("chat",function(message,room,room_pass){
        group=room+room_pass;
        socket.to(group).emit("chat",message);
    });
});