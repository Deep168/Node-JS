const express = require("express");
const cors = require("cors");
const moment = require("moment")
var createError = require('http-errors');
var path = require('path');
var bodyParser = require('body-parser');

var Json2csvParser = require('json2csv').Parser;

 


const app = express();
var fs = require('fs');
const fileupload = require("express-fileupload");
app.use(fileupload());


app.use(express.json());
app.use(cors());







const mysql = require('mysql');
const con = mysql.createConnection({
    host: '192.168.2.8',
    user: 'trainee',
    password: 'trainee@123',
    database: 'trainee',
    timezone: 'utc'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Database Connected!");
});


app.get('/export-csv',function(req,res){
    con.query("SELECT * FROM deep_user", function (err, users, fields) {
      if (err) throw err;
      console.log("users:");
       
      const jsonUsers = JSON.parse(JSON.stringify(users));
      console.log(jsonUsers);
   
      // -> Convert JSON to CSV data
      const csvFields = ['recid','code', 'firstname','lastname', 'email','gender','hobbies','photo','country','status','dateadded','dateupdated','endeffedate'];
      const json2csvParser = new Json2csvParser({ csvFields });
      const csv = json2csvParser.parse(jsonUsers);
   
      console.log(csv);
   
       res.setHeader("Content-Type", "text/csv");
       res.setHeader("Content-Disposition", "attachment; filename=users.csv");
   
       res.status(200).end(csv);
      // -> Check 'customer.csv' file in root project folder
    });
  });

app.post('/addimage', (req, res) => {
    console.log(req.body);
    const file = req.files.file;
    file.mv(`./public/images/${req.body.fileName}`, (err) => {
        if (err) throw err;
        res.status(200).send({
            message: `./src/images/${req.body.fileName}`,
            code: 200
        });
    });
})

app.post('/adduser', (req, res) => {
    // console.log(req.body);

    var date = new Date();
    const date1 = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    console.log(date1);

    let query = `Insert into deep_user (code,firstname,lastname,email,gender,hobbies,photo,country,status,dateadded) values("${req.body.code}","${req.body.firstname}","${req.body.lastname}","${req.body.email}","${req.body.gender}","${req.body.hobbies}","${req.body.photo}","${req.body.country}","Active","${date1}")`;
    con.query(query, (err, results) => {
        if (err) throw err;
        res.send({ data: results });
    })
});

app.get('/getdata', (req, res) => {
    let query = `select * from deep_user ;`;
    con.query(query, (err, results) => {
        if (err) throw err;
        res.send(results);
    })
});

app.get("/getImage/:Id", async (req, res) => {
    res.set('Content-Type', 'image/jpg');
    const data = fs.readFileSync(`./public/images/${req.params.Id}`);
    res.send(data);
})

app.get('/deleteuser', (req, res) => {
    let code = req.query.code;
    const date1 = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    // console.log(req.body)
    con.query(`UPDATE deep_user SET status="N",endeffedate="${date1}" where code="${code}"`, function (err, results) {
        res.send(results);
    })
})

app.get('/status', (req, res) => {
    const date1 = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    let status = req.query.status;
    let code = req.query.code;
    if(status==='Y'){
        con.query(`UPDATE deep_user SET status="N",dateupdated="${date1}" where code="${code}"`, function (err, results) {
            res.send(results);
        }) 
    }else{
        con.query(`UPDATE deep_user SET status="Y",dateupdated="${date1}" where code="${code}"`, function (err, results) {
            res.send(results);
        }) 
    }

    })


    



app.post('/viewuser', (req, res) => {
    console.log(req.body);
    let query = `select * from deep_user where code = "${req.body.id}"`;
    con.query(query, (err, results) => {
        if (err) throw err;
        res.send(results);
    })
});


app.post('/edit', (req, res) => {
    let id = req.body.id;
    console.log(id)
    con.query(`select * from deep_user where code="${id}"`, (err, results) => {
        if (err) throw err;
        console.log(results);
        res.send(results);
      
    })
})

app.post('/updateuser', (req, res) => {
    console.log(req.body);
   
     const date1 = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    // console.log(date1);
  
    con.query(`UPDATE deep_user SET  firstname="${req.body.firstname}",lastname="${req.body.lastname}",email="${req.body.email}",gender="${req.body.gender}",hobbies="${req.body.hobbies}",photo="${req.body.photo}" ,country="${req.body.country}",dateupdated="${date1}" where code="${req.body.code}"`, function (err, results) {
        if (err) throw err;
        res.send(results);
    })
});


app.get('/sortnamea',(req,res)=>{
    con.query(`select * from deep_user order by firstname  ASC`,function(err,results){
        res.send(results)
    })
    
})

app.get('/sortnamed',(req,res)=>{
    con.query(`select * from deep_user order by firstname  DESC`,function(err,results){
        res.send(results)
    })
})
app.get('/sortdatea',(req,res)=>{
    con.query(`select * from deep_user order by dateadded  ASC`,function(err,results){
        res.send(results)
    })
})
app.get('/sortdated',(req,res)=>{
    con.query(`select * from deep_user order by dateadded  DESC`,function(err,results){
        res.send(results)
    })
})

app.listen(6060, () => {
    console.log(`Server is running on port 6060.`);
});