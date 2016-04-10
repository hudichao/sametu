// var http = require("http");

// var messages = "test";

// http.createServer((req, res) => {
//   res.setHeader("Content-type", "text/html");
//   res.writeHead(200);

//   res.write(messages);
//   res.end();
// }).listen(8080);
var mysql = require("mysql");
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var app = express();
var database = require("./config/database");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride());

var getData = (cb) => {
  var con = mysql.createConnection(database);
  con.connect((err) => {
    if (err) {
      console.log("连接到数据库失败");
      return;
    }
    console.log("成功连接到数据库");
  });

  con.query("SELECT * from topics WHERE s_likes > 3 and s_photo is not NULL  order by s_created_at desc LIMIT 200 ", (err, rows) => {
    if (err) throw err;
    console.log("从数据库接受数据\n");
    cb(err, rows);
  });
}
//如果是angular的话可用app.get("*")
app.get("/", (req, res) => {
  res.sendFile("./public/index.html");
})
app.get("/api/topics", (req, res) => {
  getData((err,result)=> {
    if (err) res.send(err);
    res.json(result);
  })
})
app.listen(1234);
