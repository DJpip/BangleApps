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

let lessonStartMins = function(L){
  //returns the start of the lesson in minutes
  return lessonTimes[L][0] * 60 + lessonTimes[L][1];
};

let maxLessons = lessonTimes.length;

//Work out if it is a weekday and update the variable
let isWeekday;
let checkWeekday = function(){
  let date = new Date();
  let day = date.getDay();
  if (day == 0 || day == 6) isWeekday = false;
  else isWeekday = true;
};

//work out the number of minutes this day so far (timeM)
let timeM;
let calctimeM = function(){
  timeM = new Date().getHours() * 60 + new Date().getMinutes();
};

//Work out which lesson it is
let isLesson;
let Lesson;
let LessonMid;
let Lesson15;
let Lesson5;
let previousLesson = 20;

let checkLesson = function(){
  Lesson = 20; // default if not in a lesson
  for(var i = 0; i < maxLessons; i++){
    if(lessonStartMins[i] <= timeM && (lessonStartMins[i]+lessonTimes[i][2]) > timeM ){
      Lesson = i;
      isLesson = true;
      if(Lesson != previousLesson){ //these will trigger as lesson changes, but also on first run
        previousLesson = Lesson;
        buzzControl(i);
        buzzRepeat(1,500,100);
      }
    }
  }
  if(Lesson == 20) isLesson = false;
};



let buzzControl = function(i){
  LessonMid = Math.round((lessonTimes[i][2]/2)); //minutes from start of lesson to middle of lesson, rounded
  Lesson15 = lessonTimes[i][2] - 15;
  Lesson5 = lessonTimes[i][2] - 5;
  //find out exactly how many seconds have passed since the start of the lesson, so that the buzz is exact and so that this can be called at any point in the lesson if the app is restarted
  let currentLessonProgress = (lessonStartMins(i)-timeM)*60+(new Date().getSeconds()); //seconds
  if(currentLessonProgress <= LessonMid*60){
    queueBuzz(buzzMidTimeout,(LessonMid*60)-currentLessonProgress,2,100,700);
  }
  if(currentLessonProgress <= Lesson15*60){
    queueBuzz(buzz15Timeout,(Lesson15*60)-currentLessonProgress,3,100,700);
  }
  if(currentLessonProgress <= Lesson5*60){
    queueBuzz(buzz5Timeout,(Lesson5*60)-currentLessonProgress,5,100,300);
  }

};

let queueBuzz = function(timeout,waitFor,x,y,z){ //stacks up a buzz for some point in the future
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(function() {
    timeout = undefined;
    buzzRepeat(x,y,z);
  }, WaitFor);
};

let buzzRepeat = function(x,y,z){ //buzz x number of times, for y long with z millis of interval. 
  n = 0;
  var b = setInterval(function(){
   Bangle.buzz(y);
   n++;
   if(n>x-1){clearInterval(b); n=0;}
  },z);
};

//let clock_info = require("clock_info");
let locale = require("locale");

//could play with this as an option, but not now.
let showWidgets = false; 

//layout values
let colorFg = g.theme.dark ? '#fff' : '#000';
let colorBg = g.theme.dark ? '#000' : '#fff';
let widgetOffset = showWidgets ? 24 : 0;
let h = g.getHeight() - widgetOffset;
let w = g.getWidth();



let draw = function () {
  g.reset();
  
  let date = new Date();
  let timeStr = require("locale").time(date,1);
  let dateStr = require("locale").date(date,0).toUpperCase();
  let dateNum = date.getDate(); // 0 ...31 day value
  let month = date.getMonth() + 1; 
  let dowStr = require("locale").dow(date,1).toUpperCase();  
  let s = date.getSeconds();
  

//Draw time
g.setColor(colorFg);
g.setFont("Vector",60);
g.drawString(timeStr,10,31);

//Draw Date
g.setColor("#00FFFF");
g.setFont("Vector",24);
g.drawString( date + "/" + month,5,85);

/*  let R = Bangle.appRect;
    g.reset().clearRect(R.x,R.y, R.x2, R.y2);
    
    g.setColor(colorFg);
    g.setFontAlign(0, -1);
    g.drawString(locale.time(new Date(), 1), w / 2, h / 2);
    now = Math.round(new Date().getTime() / 1000);

    g.setFontAlign(0, 0);
    g.drawString(locale.date(new Date()), w / 2, h / 4);
    g.drawString(locale.dow(new Date()), w / 2, h / 6);
*/

//Draw Day and Lesson Number if during a lesson
    g.setFont("Vector",30);
    g.setColor("#FFFF00");
    if(!isWeekday || Period == 20){g.drawString(dowStr,25,0);}
    else{g.drawString(dowStr + " L" + Lesson,25,0);}

//Draw seconds
  if(drawSeconds){
    g.setFont("Vector", 20);
    g.setColor(colorFg);
    g.drawString(("0" + s).substr(-2),138, 85);
  }

    
queuer(drawTimeout,1000,draw);
};

Bangle.on('accel', function(a){
  //draw seconds when facing up
  if(a.z <= -0.7) {drawSeconds = true;}
  else {drawSeconds = false;}
  draw();
});

// timeout(s) to keep track of drawing/func events. 
//Needs a new one for every separate func event you need to time.
let drawTimeout;
let minuteTimeout; // timeout variable for the minuteUpdater
let buzzMidTimeout; 
let buzz15Timeout;
let buzz5Timeout;

// general - schedule a call of 'func' for the next interval. Needs a timeout variable 
let queuer = function (timeout, interval, func) { //interval in millis
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(function() {
    timeout = undefined;
    func();
  }, interval - (Date.now() % interval));
};

Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app (allowing for 'fast load')
    if (minuteTimeout) clearTimeout(minuteTimeout);
    minuteTimeout = undefined;
    if (buzzMidTimeout) clearTimeout(buzzMidTimeout);
    buzzMidTimeout = undefined;
    if (buzz15Timeout) clearTimeout(buzz15Timeout);
    buzz15Timeout = undefined;
    if (buzz5Timeout) clearTimeout(buzz5Timeout);
    buzz5Timeout = undefined;
    
    //if (!showWidgets) require("widget_utils").show();
  }
});

//draw();

//Run once when the app starts
let init = function(){
  g.clear();
  minuteUpdater(); //keeps minute-time sensitive actions updated
  checkWeekday(); //checks if it is a weekday and updates the variable
  checkLesson();  //checks what lesson it is
};

//things to check or do every minute
let minuteUpdater = function(){
  calctimeM();
  checkLesson();
  
  queuer(minuteTimeout,60000,minuteUpdater); //must be the final call if want minuteUpdater to be called again
  };