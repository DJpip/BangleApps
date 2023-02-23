const lessonTimes = [
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

//time variables. Declare and set on load.
  var Period = 0;
  
  var t = Date();
  var d = t.getDay();
  var h = t.getHours();
  var m = t.getMinutes();
  var lastM = t.getMinutes();
  var isWeekend;
  var time;
  var timeM;
  let timeInt = [[],[]];
  var loadRun = true;
  var maxLessons = lessonTimes.length;
  

//TimeInt is array of [start time as int, end time as int, mid time as int, 3/4 //time as int, 5 mins remaining as int]


function getTime(){ //every 1 second
  
  t = Date(); 
  h = t.getHours(); 
  m = t.getMinutes(); 
  time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);
  timeM = h*60 + m;
  
  if(h == 0){
    d = t.getDay();
    checkWeekend();
  }
  if(m !== lastM){
    lastM = m;
    lessonUpdate();
  }
  if(loadRun ==true){ //run once
    loadRun = false;
    LTInt(lessonTimes);
    checkPeriod();
  }
}

function checkWeekend(){
  if(d > 5){
    isWeekend = true;
  }
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

function checkPeriod(){
  for(var i = 0; i<maxLessons; i++){
    if(timeInt[i][0]<= timeM){
      if(timeM <= timeInt[i][1]){
          Period = i;
      }
    }
  }
  print(Period);
}

function lessonUpdate(){
  for(var i = 0; i<maxLessons; i++){
    if(lessonTimes[i][0] == h){
      if(lessonTimes[i][1] == m){
        Period = i;
      }
    }
  }
}

setInterval(getTime,1E4);
getTime();
