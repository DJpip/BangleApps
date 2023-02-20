/*Coffee verion of the imprecise word clock, with side swipes to the timers from timerclk*/

/* Imprecise Word Clock - A. Blanton
A remix of word clock
by Gordon Williams https://github.com/gfwilliams
- Changes the representation of time to be more general
- Toggles showing of accurate digital time when screen touched.

require("Storage").write("coffee.info",{
  "id":"coffee",
  "name":"Coffee Clock",
  "type":"clock",
  "src":"coffee.app.js",
  "icon":"coffee.img"
});




*/
/* jshint esversion: 6 */

const allWords = [
  "NEEDNFQD",
  "ZKTEATIR",
  "OFRCPSNE",
  "RNEARLYA",
  "COFFEELM",
  "BYOTHERS",
  "TUXEDPYN",
  "INGRTIME"
];

//var dragBorder = g.getHeight()/2;


const timeOfDay = {
  0: ["", 0, 0],
  1: ["SLEEPING", 52, 53, 54, 55, 56, 07, 17, 27],
  2: ["COFFEETIME", 04, 14, 24, 34, 44, 54, 47, 57, 67, 77],
  3: ["EATING", 31, 41, 51, 07, 17, 27],
  4: ["NEARLYCOFFEETIME", 13, 23, 33, 43, 53, 63, 04 , 14, 24, 34, 44, 54, 47, 57, 67, 77],
  5: ["OTHER", 25, 35, 45, 55, 65],
  6: ["AFTERCOFEE", 33, 34, 35, 36, 37, 04, 14, 24, 44, 54],
  7: ["TEATIME", 21, 31, 41, 47, 57, 67, 77],
  8: ["COFFEEDREAMS", 04,14,24,34,44,54,   70,71,72,73,74,75],
  9: ["DECAFCOFEE", 30, 31,32,33,34,  04,14,24,44,54],
  10: ["NEEDCOFFEE", 00,10,20,30,04,14,24,34,44,54],
  11: ["COFFEE", 04,14,24,34,44,54 ],
  12: ["NAPTIME", 40,41,42, 47,57,67,77],
};


var big = g.getWidth()>200;
// offsets and increments
const xs = big ? 35 : 20;
const ys = big ? 31 : 28;
const dx = big ? 25 : 20;
const dy = big ? 22 : 16;


// font size and color
const fontSize = big ? 3 : 2;  // "6x8"
const passivColor = 0x3186 /*grey*/ ;
const activeColorNight = 0xF800 /*red*/ ;
const activeColorDay = g.theme.fg;

var hidxPrev;
var showDigitalTime = false;

function drawWordClock() {
  // get time
  var t = new Date();
  var h = t.getHours();
  var m = t.getMinutes();
  var time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);
  var day = t.getDay();

  var hidx;

  var activeColor = activeColorDay;
  if(h < 7 || h > 19) {activeColor = activeColorNight;}

  g.setFont("6x8",fontSize);
  g.setColor(passivColor);
  g.setFontAlign(0, -1, 0);


  // Switch case isn't good for this in Js apparently so...
  if(h < 5){
    // sleeping
    hidx = 1;
  }
  else if (h < 6){
    // need coffee
    hidx = 10;
  }
  else if (h < 7){
    // eating
    hidx = 3;
  }
  else if (h < 8){
    // coffee
    hidx = 11;
  }
  else if (h < 9){
    // other
    hidx = 5;
  }
  else if (h < 10){
    // NEARLYCOFFEETIME
    hidx = 4;
  }
  else if (h < 11){
    // coffee time
    hidx = 2;
  }
  else if (h < 12){
    // AFTERCOFFEE
    hidx = 6;
  }
  else if (h < 13){
    // Eating
    hidx = 3;
  }
  else if (h < 14){
    // nap time
    hidx = 12;
  }
  else if (h < 15){
    // NEEDCOFFEE
    hidx = 10;
  }
  else if (h < 16){
    // COFFEETIME
    hidx = 2;
  }
  else if (h < 17){
    // teaTIME
    hidx = 7;
  }
else if (h < 19){
    // Eating
    hidx = 3;
  }
else if (h < 20){
    // other
    hidx = 5;
  }
else if (h < 21){
    // DECAFCOFFEE
    hidx = 9;
}
else if (h < 22){
    // other
    hidx = 5;
  }
  
else if (h < 23){
    // DREAMINGOFCOFFEE
    hidx = 8;
  }
  
else if (h < 24){
    // sleeping
    hidx = 1;
  }




  // check whether we need to redraw the watchface
  if (hidx !== hidxPrev) {
    // Turn off showDigitalTime
    //showDigitalTime = false;
    // draw allWords
    var c;
    var y = ys;
    var x = xs;
    allWords.forEach((line) => {
      x = xs;
      for (c in line) {
        g.drawString(line[c], x, y);
        x += dx;
      }
      y += dy;
    });

    // write hour in active color
    g.setColor(activeColor);
    timeOfDay[hidx][0].split('').forEach((c, pos) => {
      x = xs + (timeOfDay[hidx][pos + 1] / 10 | 0) * dx;
      y = ys + (timeOfDay[hidx][pos + 1] % 10) * dy;
      g.drawString(c, x, y);
    });
    hidxPrev = hidx;
  }

  // Display digital time when button is pressed or screen touched
  g.clearRect(0, big ? 215 : 160, big ? 240 : 176, big ? 240 : 176);
  if (showDigitalTime){
    g.setColor(activeColor);
    g.drawString(time, big ? 120 : 90, big ? 215 : 160);
  }
}

Bangle.on('lcdPower', function(on) {
  if (on) drawWordClock();
});

// Show launcher when button pressed
Bangle.setUI("clock");

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(drawWordClock, 1E4);
drawWordClock();

// load timers from timerclk on swipe

var timerclk = require("timerclk.lib.js");
/*var settings = require('Storage').readJSON("timerclk.json", true) || {};
settings = Object.assign({
  "timeFont":"Anton",
  "timeFontSize":0,
  "dateFont":"6x8",
  "dateFontSize":2,
  "dowFont":"6x8",
  "dowFontSize":2,
  "srssFont":"6x8",
  "srssFontSize":2,
  "specialFont":"6x8",
  "specialFontSize":2,
  "shortDate":true,
  "showStopwatches":true,
  "showTimers":true,
  "showSrss":false,
}, settings.clock||{});
*/

var absY, lastX, lastY;
  Bangle.on('drag', e=>{
    if (!e.b) {
      if (lastX > 50) { // right
        if (absY < 150) { // drag over time
          load("timerclk.timer.js");
        }else { // drag over date/dow
          load("timerclk.alarm.js");
        }
      } else if (lastX < -50) { // left
        if (absY < 150) { // drag over time
          load("timerclk.stopwatch.js");
        }else { // drag over date/dow
          load("timerclk.alarm.js");
        }
      } else if (lastY > 50) { // down
      
    showDigitalTime = false;
    drawWordClock();
      } else if (lastY < -50) { // up
    showDigitalTime = true;
    drawWordClock();
      }
      lastX = 0;
      lastY = 0;
    } else {
      lastX = lastX + e.dx;
      lastY = lastY + e.dy;
      absY = e.y;
    }
  });


// If LCD pressed, toggle drawing digital time
/*Bangle.on('touch',e=>{
  if (showDigitalTime){
    showDigitalTime = false;
    drawWordClock();
  } else {
    showDigitalTime = true;
    drawWordClock();
  }
}
)*/;
