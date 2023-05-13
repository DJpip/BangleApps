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

const maxLessons = lessonTimes.length;

//TimeInt is array of [start time as int, end time as int, mid time as int, 3/4 //time as int, 5 mins remaining as int]
let timeInt = [[],[]]; 

let Create2DArray = function(rows,columns) {
    timeInt = Array(rows);
    for (var i = 0; i < rows; i++) {
        timeInt[i] = Array(columns);
    }
};
  
let LTInt = function (arr){
   Create2DArray(maxLessons,5);
   for(var i = 0; i<arr.length; i++){
     timeInt[i][0] = arr[i][0]*60+arr[i][1]; //lesson start
     timeInt[i][1] = arr[i][0]*60+arr[i][1]+arr[i][2]; //lesson end
     timeInt[i][2] = arr[i][0]*60+arr[i][1]+(arr[i][2]/2); //lesson midpoint
     timeInt[i][3] = arr[i][0]*60+arr[i][1]+arr[i][2]-15; //lesson 15 mins warning
     timeInt[i][4] = arr[i][0]*60+arr[i][1]+arr[i][2]-5; //lesson 5 mins warning
   }
};

let onInit = function(){
    LTInt(lessonTimes); //converts lessonTimes to useable minute array

};



onInit();

(() => {
  var width = 24; // width of the widget

  function draw() {
    var date = new Date();
    g.reset(); // reset the graphics context to defaults (color/font/etc)
    g.setFontAlign(0,0); // center fonts    
    //g.drawRect(this.x, this.y, this.x+width-1, this.y+23); // check the bounds!
    // Draw icon
    g.drawImage(atob("DA0CDQBwv//+////////1VVX0AAH0AAH0AAH0AAH0AAH0AAH1VVXv//+"), this.x+6, this.y)
    // Draw a small day of the month    
    g.drawString(date.getDate(), this.x+width/2, this.y+9);
    // Use 'locale' module to get a shortened day of the week
    // in the correct language    
      var text = require("locale").month(date,1);
    g.setFont("6x8");
    g.drawString(text, this.x+width/2, this.y+19);
  }

  setInterval(function() {
    WIDGETS["widdate"].draw(WIDGETS["widdate"]);
  }, 10*60000); // update every 10 minutes

  // add your widget
  WIDGETS["widdate"]={
    area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right), be aware that not all apps support widgets at the bottom of the screen
    width: width, // how wide is the widget? You can change this and call Bangle.drawWidgets() to re-layout
    draw:draw // called to draw the widget
  };
})()

