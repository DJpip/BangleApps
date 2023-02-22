getTime();
setInterval(getTime,1E4);

Bangle.loadWidgets();
Bangle.drawWidgets();



const lessonTimes = {
  0:  [8,20,30]
  1:  [8,50,50]
  2:  [9,40,50]
  3:  [10,45,45]
  4:  [11,30,50]
  5:  [12,20,50]
  6:  [13,10,50]
  7:  [14,00,50]
  8:  [14,50,50]
  9:  [15,40,50]
};

//time variables. Declare and set on load.
  var Period = 0;
  
  var t = new.Date();
  var d = t.getDay();
  var h = t.getHours();
  var m = t.getMinutes();
  var isWeekend;
  var time;


function getTime(){
  
  t = new.Date();
  h = t.getHours();
  m = t.getMinutes();
  time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);
  if(h == 0){
    d = t.getDay();
    checkWeekend();
  }
  lessonStart();
}
  
function checkWeekend(){
  if(d > 5){
    isWeekend = true;
  }
  
function lessonStart(){
 lessonTimes.forEach(
} 
