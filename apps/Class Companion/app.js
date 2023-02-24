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
  var Period = 0;
  var lastPeriod = 0;
  const f1 = 1E3;  //of getTime updates
  const f2 = 1E4;  //of timelUpdates
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
  var loadRun = true;
  var maxLessons = lessonTimes.length;
  var waiting = false;

//TimeInt is array of [start time as int, end time as int, mid time as int, 3/4 //time as int, 5 mins remaining as int]


function getTime(){ //every f1 seconds
  
  t = Date(); 
  h = t.getHours(); 
  m = t.getMinutes(); 
  s = t.getSeconds();
  time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);// + ":" + ("0" + s).substr(-2);
  drawSeconds(138,85,25,30);
  
if(loadRun ==true){ //run once
    loadRun = false;
    g.clear();
    timeM = h*60 + m;
    checkDate(); drawDate(5,85,25,70);//checks date and draws it. checks for weekends too.
    LTInt(lessonTimes); //converts lessonTimes to useable minute array
    lessonUpdate(); //checks if lesson has changed, and if it needs to buzz
    drawPeriod(); //draws the period top left
    drawTime();
  }
  
}

function timelyUpdates(){ //every f2 seconds
  timeM = h*60 + m;
  
if(m !== lastM){ //check every new minute
    lastM = m;
    lessonUpdate();
  }

}

Bangle.on('midnight', function() { //updates the day on midnight
    checkDate();
    drawDate(5,85,25,70);
});

function checkWeekend(){
  if(d > 5){
    isWeekend = true;
  }
}

function checkDate(){
  d = t.getDay();
  day = days[d];
  date = t.getDate();
  month = t.getMonth() + 1;
  checkWeekend();
}

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
            Bangle.buzz(100);
            drawPeriod();
            lastPeriod = Period;
          }
  print(Period);
}

function checkbuzz(){
if(!waiting){ //don't buzz more than once in a minute
  

  if(timeInt[Period][2] == timeM){ //half way through lesson
   Bangle.buzz(200).then(()=>{
  return new Promise(resolve=>setTimeout(resolve,300)); // wait 300ms
    }).then(()=>{
        return Bangle.buzz(800);
          });
    waiting = true;
    setTimeout(function(){
      waiting = false;
    },60001);
   }
  
  if(timeInt[Period][3] == timeM){ //15 mins remaining
   Bangle.buzz(200).then(()=>{
      return new Promise(resolve=>setTimeout(resolve,200)); // wait 300ms
    }).then(()=>{
        return Bangle.buzz(200);
          }).then(()=>{
              return new Promise(resolve=>setTimeout(resolve,200)); // wait 300ms
              }).then(()=>{
                return Bangle.buzz(500);
                });
    waiting = true;
    setTimeout(function(){
      waiting = false;
    },60001);
   }
  
  if(timeInt[Period][4] == timeM){ //5 mins remaining
   Bangle.buzz(100).then(()=>{
  return new Promise(resolve=>setTimeout(resolve,100)); // wait 300ms
    }).then(()=>{
        return Bangle.buzz(100);
          }).then(()=>{
      return new Promise(resolve=>setTimeout(resolve,100)); // wait 300ms
    }).then(()=>{
        return Bangle.buzz(100);
          }).then(()=>{
      return new Promise(resolve=>setTimeout(resolve,100)); // wait 300ms
    }).then(()=>{
        return Bangle.buzz(500);
          });
    waiting = true;
    setTimeout(function(){
      waiting = false;
    },60001);
   }

} // end of waiting if
}

function drawPeriod(){
  g.clearRect(5,0,100,40);
  g.setFont("Vector",30);
  g.setColor("#FFFF00");
  if(Period == 0){
    g.drawString("Break",5,2);
  }
  else {g.drawString(day + " P" + Period,5,2);}
}

function drawSeconds(x,y,h,w){
  g.clearRect(x,y,x+w,y+h);
  g.setColor(-1);
  g.setFont("Vector",h);
  g.drawString(("0" + s).substr(-2),x,y);
  if(s==0){drawTime();}
}

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

setInterval(getTime,f1);
setInterval(timelyUpdates,f2);
getTime(); timelyUpdates();
