'use strict';

// node文档 https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
// node-mysql http://www.sitepoint.com/using-node-mysql-javascript-client/
// qiita http://qiita.com/toshirot/items/2463b0e4a026c0fd86e4
// 防止重复插mysql http://stackoverflow.com/questions/14028093/how-to-prevent-duplicate-records-from-my-table-insert-ignore-does-not-work-here
// 实际使用（如果没，insert，如果有update）
// http://stackoverflow.com/questions/15383852/sql-if-exists-update-else-insert-into
// http://stackoverflow.com/questions/4205181/insert-into-a-mysql-table-or-update-if-exists
// node mysql 的这种用法 搜索 DUPLICATE KEY UPDATE node mysql
// replace 和 duplicate key update 差别
// 还需要同时插入多行 
// 查找my.cnf位置 http://qiita.com/is0me/items/12629e3602ebb27c26a4
let http = require("http");
let fs = require("fs");
let os = require("os");
let mysql = require("mysql");

let FILENAME = "data.json";
let BASE = "http://v2.same.com";
let database = require("./config/database");


module.exports = function(dayInterval) {
  var start = "/channel/1033563/senses";

  var url = BASE + start;

  var result = [];
  var i = 0;

  // readFile(FILENAME);

  var getUrl = (url) => {
    http.get(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", (res) => {
        res = JSON.parse(body);
        if (res.code === 0) {
          // result = result.concat(res.data.results);
          //之后的url
          url = BASE + res.data.next;
          //只更新最近两个月的数据
          //console.log(res.data.results[0].created_at);
          //console.log(new Date().getTime() / 1000);
          var diffDay = ((new Date().getTime() / 1000) - res.data.results[0].created_at) / (3600 * 24);
          console.log(diffDay);
          if (diffDay > dayInterval) {
            endDB();
            return;
          }
          console.log(res.data.results[0].created_at * 1000);
          var theTime = new Date(res.data.results[0].created_at * 1000);
          console.log("走一次请求, 数据时间", theTime.getMonth() + 1 + "/" + theTime.getDate());
          updateItems(res.data.results);

          //saveFile(FILENAME, result);

          setTimeout(()=> {
            getUrl(url);
          },2000);

        }
      });
    }).on("error", (e) => {
      console.log(e.message);
    });
  }

  var saveFile = (fileName, body) => {
    try {
      fs.writeFileSync(fileName, JSON.stringify(body));
      console.log("create file");
    } catch (e) {
      console.log(e);
    }
  }

  var readFile = (fileName) => {
    var data = JSON.parse(fs.readFileSync(fileName));
    // console.log(data);
  }

  //首先create a connect to db
  var con = mysql.createConnection(database);

  function openDB() {
    con.connect((err) => {
      if (err) {
        console.log("连接到数据库失败");
        return;
      }
      console.log("成功连接到数据库");


    });
  }


  // con.query("SELECT * from topics", (err, rows) => {
  //   if (err) throw err;
  //   console.log("从数据库接受数据\n");
  //   console.log(rows);
  // });

  // 增加
  // var data = {s_id: "123"};
  // con.query("INSERT INTO topics SET ?", data, (err, res) => {
  //   if (err) throw err;
  //   console.log("插入数据:", res);
  // });

  // 更新
  // con.query("UPDATE topics SET s_likes = ? WHERE s_id = ?", ["5", "123"], (err, res) => {
  //   if (err) throw err;

  //   console.log("更改了" + res.changedRows + "行");
  // });

  // 删除
  // con.query("DELETE FROM topics WHERE s_id = ?", ["123"], (err, res) => {
  //   if (err) throw err;

  //   console.log("删除" + res.affectedRows + "行");
  // });

  // replace update
  function updateItem(item, cb) {
    con.query("REPLACE INTO topics SET ? ", item, (err, res) => {
      if (err) {
        console.log("插入数据失败！");
        // throw err;
      }
      // console.log("插入一条数据");
      // console.log(item);
      if (cb) {
        cb();
      }
    });
  }

  function updateItems(items) {
    // openDB();
    for (var i = 0 ; i < items.length; i++) {
      var item = {
        s_id: items[i].id,
        s_created_at: items[i].created_at,
        s_likes:  items[i].likes,
        s_txt: items[i].txt,
        s_user_id: items[i].user.id,
        s_user_avatar: items[i].user.avatar,
        s_views: items[i].views,
        s_channel_id: items[i].channel.id,
        s_user_username: items[i].user.username,
        s_photo: items[i].photo
      };
      // console.log(item);
      if ((i + 1)=== items.length) {
        // updateItem(item, endDB);
        updateItem(item);
      } else {
        updateItem(item);
      }
    }
  }

  function endDB() {
    con.end(function(err) {
      console.log("关闭数据库");
      // The connection is terminated gracefully
      // Ensures all previously enqueued queries are still
      // before sending a COM_QUIT packet to the MySQL server.
    });
  }



  openDB();
  getUrl(url);

}
