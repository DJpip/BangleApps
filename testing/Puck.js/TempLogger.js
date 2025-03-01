// uses the storage module to log temperature to a file
var f = require("Storage").open("log","a");

var SensorInterval  = 600000; // 10 minutes

var Running = false;

function formatDate(timestamp) {
    let date = new Date(timestamp);
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    let hours = ("0" + date.getHours()).slice(-2);
    let minutes = ("0" + date.getMinutes()).slice(-2);
    let seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Write some data
setInterval(function() {
  if(Running){
    let formattedDate = formatDate(Date.now());
    f.write(formattedDate + "," + E.getTemperature() + "\n");
    //flash the blue LED every time we log a temperature
    digitalWrite(LED3,1);
    setTimeout(function(){digitalWrite(LED3,0);},100);
  }
}, SensorInterval);

setWatch(function() {
  if(Running){//switch off, flash the red light
    digitalWrite(LED1,1);
    setTimeout(function(){digitalWrite(LED1,0);},500);
    console.log("Logging stopped");
  }else{ //start logging, flash the green light
    let formattedDate = formatDate(Date.now());
    f.write(formattedDate + "," + E.getTemperature() + "\n");
    digitalWrite(LED2,1);
    setTimeout(function(){digitalWrite(LED2,0);},500);
    console.log("Logging started");
  }
  Running = !Running;
}, BTN, {repeat:true,debounce:50});

function getData(callback) {
    var f = require("Storage").open("log","r");
    var l = f.readLine();
    while (l !== undefined) {
        callback(l);
        l = f.readLine();
    }
}
// Get data with: getData(print);
function Pd(){
    getData(print);
}
//erase the log file
function erase() {
  require("Storage").open("log","w").write("");
}
// Erase data with: erase();

//long press button to erase the log file
setWatch(function(e) {
  if (e.time - e.lastTime > 1) {
    erase();
    console.log("Log erased");
  }
}, BTN, {repeat:true,debounce:50,edge:"falling"});