const lessonTimes = [  //[start hour, start minute, length]
  [8,20,30], //L0
  [8,50,50], //L1
  [9,40,50], //L2
  [10,45,45],//L3
  [11,30,50],//L4
  [12,20,50],//L5
  [13,10,50],//L6
  [14,00,50],//L7
  [14,50,50],//L8
  [15,40,50],//L9
];


function Create2DArray(rows,columns) {
  timeInt = Array(rows);
  for (var i = 0; i < rows; i++) {
      timeInt[i] = Array(columns);
  }
}

function LTInt(arr){
 Create2DArray(maxLessons,5);
 for(var i = 0; i<arr.length; i++){
   timeInt[i][0] = arr[i][0]*60+arr[i][1]; //lesson start
   timeInt[i][1] = arr[i][0]*60+arr[i][1]+arr[i][2]; //lesson end
   timeInt[i][2] = arr[i][0]*60+arr[i][1]+(arr[i][2]/2); //lesson midpoint
   timeInt[i][3] = arr[i][0]*60+arr[i][1]+arr[i][2]-15; //lesson 15 mins warning
   timeInt[i][4] = arr[i][0]*60+arr[i][1]+arr[i][2]-5; //lesson 5 mins warning
 }
 //print(timeInt);
}

const days = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
];

//Variables. Declare and set on load.
  const f1 = 1E3;  //of getTime updates
  var t = new Date();
  var d = t.getDay();
  var day = days[d];
  var date = t.getDate(); //0..31 day value
  var month = t.getMonth()+1;
  var h = t.getHours();
  var m = t.getMinutes();
  var s = t.getSeconds();
  var lastM = t.getMinutes();
  var isWeekend;
  var time;
  var timeM;
  let timeInt = [[],[]]; //see below

  var waiting = false;
  var loadRun = true;

  var Period = 0;
  var lastPeriod = 0;
  var maxLessons = lessonTimes.length;
 
  var counter = 0;
  var faceUpVar = false;
  var tap1 = false;
//TimeInt is array of [start time as int, end time as int, mid time as int, 3/4 //time as int, 5 mins remaining as int]

//Load run here
function load(){
g.clear();
    timeM = h*60 + m;
    checkDate(); drawDate(5,85,25,70);//checks date and draws it. checks for weekends too.
    LTInt(lessonTimes); //converts lessonTimes to useable minute array
    lessonUpdate(); //checks if lesson has changed, and if it needs to buzz
    Bangle.drawWidgets(); drawPeriod(); //draws the period top left
    drawTime();
}

load();


function getTime(){ //every f1 seconds, gets the time and draws the seconds. runs the loadRun first time
  
  t = Date(); 
  h = t.getHours(); 
  m = t.getMinutes(); 
  s = t.getSeconds();
  time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);// + ":" + ("0" + s).substr(-2);
  drawSeconds(138,85,25,30);
  
}

function drawSeconds(x,y,h,w){
  if(!isWeekend){
  g.clearRect(x,y,x+w,y+h);
  g.setColor(-1);
  g.setFont("Vector",h);
  g.drawString(("0" + s).substr(-2),x,y);
  }
  if(m !== lastM){ //check every new minute and update the lesson number and buzz if required
    lastM = m;
    lessonUpdate();
  }
  if(s==0){drawTime();}
}


Bangle.on('midnight', function() { //updates the day on midnight
    checkDate();
    drawDate(5,85,25,70);
});

function checkDate(){
  d = t.getDay();
  day = days[d];
  date = t.getDate();
  month = t.getMonth() + 1;
  checkWeekend();
}

function checkWeekend(){
  if(d == 6 || d == 0){
    isWeekend = true;
  }
  else{ isWeekend = false;}
}

function lessonUpdate(){
  checkPeriod();
  checkbuzz();
}

function checkPeriod(){
  Period = 0; //It will default to this if not in a known period
  for(var i = 0; i<maxLessons; i++){
    if(timeInt[i][0]<= timeM){
      if(timeM <= timeInt[i][1]){
          Period = i;
        }
    }
  }
  if(lastPeriod != Period){ //buzz and update screen with period when changing period
            Bangle.buzz(600);
            drawPeriod();
            lastPeriod = Period;
          }
}

function buzzRepeat(x,y,z){ //buzz x number of times, for y long with z millis of interval. 
  n = 0;
  var b = setInterval(function(){
   Bangle.buzz(y);
   n++;
   if(n>x-1){clearInterval(b); n=0;}
  },z);
}

function checkbuzz(){
if(!waiting){ //don't buzz more than once in a minute
  

  if(timeInt[Period][2] == timeM){ //half way through lesson
   buzzRepeat(2,100,700);
       waiting = true;
    setTimeout(function(){
      waiting = false;
    },60001);
   }
  
  if(timeInt[Period][3] == timeM){ //15 mins remaining
    buzzRepeat(3,100,700);
      waiting = true;
    setTimeout(function(){
      waiting = false;
    },60001);
   }
  
  if(timeInt[Period][4] == timeM){ //5 mins remaining
   buzzRepeat(5,100,300);
      waiting = true;
    setTimeout(function(){
      waiting = false;
    },60001);
   }

} // end of waiting if
}

function drawPeriod(){
  Bangle.drawWidgets();
  g.clearRect(25,0,100,30);
  g.setFont("Vector",30);
  g.setColor("#FFFF00");
  if(isWeekend){g.drawString(day,25,0);}
  else if(Period == 0){g.drawString(day,25,0);}
  else{g.drawString(day + " P" + Period,25,0);}
}



function drawCounter(x,y,h,w){
  Bangle.buzz(100,0.5);
  g.clearRect(x,y,x+w,y+h);
  if(counter>0){
    g.setColor("#FF8F8F");//off red
    g.setFont("Vector",h);
    g.drawString(counter,x,y);
  }
}

/*Bangle.on('faceUp',function(Up){
  faceUpVar = Up;
});

Bangle.on('tap',function(data){
  if(faceUpVar){
    if(data.dir == "front"){
      counter ++;
      drawCounter(110,126,50,66);
        if(data.double == true){
          pen();
         }
    }
    else if(data.dir == "left"){
      checkHID();
    }
    else if(data.dir == "right"){
      altTab();
    }
    else if(data.dir == "top"){
      pressKey(26,0);
    }
    else if(data.dir == "bottom"){
     counter = 0;
      drawCounter(110,126,50,66);
    }
  }
});
*/
Bangle.setOptions({gestureInactiveCount:4}); //default 4 samples before looking again. poll interval is 80ms after waking up.
Bangle.setOptions({gestureMinLength:10}); //default 10 samples long

function drawTime(){
  g.clearRect(0,31,240,85);
  g.setColor(-1);
  g.setFont("Vector",60);
  g.drawString(time,10,31);
  
}

function drawDate(x,y,h,w){
  g.clearRect(x,y,x+w,y+h);
  g.setColor("#00FFFF");
  g.setFont("Vector",h);
  g.drawString( date + "/" + month,x,y);
}
const storage = require('Storage');
const settings = storage.readJSON('setting.json',1) || { HID: false };
//const kb = require("ble_hid_combo");

var int = require("ble_hid_combo");
  NRF.setServices(undefined, { hid : int.report });

function checkHID(){
  g.clear();
if (settings.HID === "com") {
  E.showPrompt("Disable HID?",{title:"HID enabled"}).then(function(disable) {
    if (disable) {
      settings.HID = false;
      HIDenabled = false;
      storage.write('setting.json', settings);
      setTimeout(load, 1000, "ClassComp.app.js");
    } else {
      setTimeout(load, 1000);
    }
  });
}
  //drawApp();
  //setInterval(update, 100); // 10 Hz
 else {
  E.showPrompt("Enable KB HID?",{title:"HID disabled"}).then(function(enable) {
    if (enable) {
      settings.HID = "com";
      HIDenabled = true;
      storage.write('setting.json', settings);
      setTimeout(load, 1000, "ClassComp.app.js");
    } else {
      setTimeout(load, 1000);
    }
  });
}
}

let HIDenabled = true;

//from tutorial
/*
int.tapKey(int.KEY.A);
int.tapKey(int.KEY.A, int.MODIFY.SHIFT);
int.clickButton(int.BUTTON.LEFT);
// Scroll vertically and horizontally:
  int.scroll(10, -20);
  
 exports.MODIFY = {
  CTRL        : 0x01,
  SHIFT       : 0x02,
  ALT         : 0x04,
  GUI         : 0x08,
  LEFT_CTRL   : 0x01,
  LEFT_SHIFT  : 0x02,
  LEFT_ALT    : 0x04,
  LEFT_GUI    : 0x08,
  RIGHT_CTRL  : 0x10,
  RIGHT_SHIFT : 0x20,
  RIGHT_ALT   : 0x40,
  RIGHT_GUI   : 0x80
};  //can be added CTRL + SHIFT
*/

/*function sendKey(keyVal){
  int.tapKey(int.KEY.keyVal, 0);
}*/

function altTab(){
 //int.tapKey(int.KEY.T,int.MODIFY.ALT);
  NRF.sendHIDReport([2,0x04,0,43,0,0,0,0], function() {
    NRF.sendHIDReport([2,0,0,0,0,0,0,0], function() {
      if (callback) callback();
    });
  });
}

function pen(){
int.tapKey(int.KEY.P,int.MODIFY.CTRL);
}

// from presenter app
function pressKey(keyCode, modifiers, callback) {
  if (!HIDenabled) return;
  if (!modifiers) modifiers = 0;
  NRF.sendHIDReport([2,modifiers,0,keyCode,0,0,0,0], function() {
    NRF.sendHIDReport([2,0,0,0,0,0,0,0], function() {
      if (callback) callback();
    });
  });
}
function clickMouse(b, callback) {
  if (!HIDenabled) return;
  NRF.sendHIDReport([1,b,0,0,0,0,0,0], function() {
      NRF.sendHIDReport([1,0,0,0,0,0,0,0], function() {
      if (callback) callback();
    });
  });
}
//NRF.setServices(undefined, { hid : kb.report });

/*function moveMouse(x,y,b,wheel,hwheel,callback) {
  if (!HIDenabled) return;
  if (!b) b = 0;
  if (!wheel) wheel = 0;
  if (!hwheel) hwheel = 0;
  NRF.sendHIDReport([1,b,x,y,wheel,hwheel,0,0], function() {
    if (callback) callback();
  });
}
function scroll(wheel,hwheel,callback) {
  moveMouse(0,0,0,wheel,hwheel,callback);
}
*/


Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets(); drawPeriod();
Bangle.on('lock', function(on) { drawPeriod();});

setInterval(getTime,f1);
getTime(); //timelyUpdates();