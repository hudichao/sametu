var CronJob = require("cron").CronJob;
var theJob = require("./getData.js");
try {
  new CronJob("* * * * * *", () => {
    console.log('good cron');
  })
} catch(e) {
  console.log("bad cron");
}
var job = new CronJob("0 40 0-6,12-23 * * *", () => {
    theJob(1);
  }, () => {
  //executed when the job stops;  
  },
  true, //start now!
  'Asia/Chongqing');

var job2 = new CronJob("0 0 12 * * *", () => {
    theJob(30);
  }, () => {
  //executed when the job stops;  
  },
  true, //start now!
  'Asia/Chongqing');
job.start();
job2.start();

