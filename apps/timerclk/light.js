//bluetooth
// Are we busy?
var busy = false;
var screenBusy = false;

var lightLevel = 0.0;

// The device, if we're connected
var connected = false;

// The 'tx' characteristic, if connected
var lightCharacteristic = false;
var txCharacteristic = false;
var buttonCharacteristic = false;
var connectionAttempts = 0;

// Function to connect to the Puck
function connectPuck() {
  if (!busy) {
    busy = true;
    if (!connected) {
      NRF.connect("dd:80:0a:f7:4b:9b random").then(function(d) {
        connected = d;
        print(d);
        return d.getPrimaryService(0xFFFF);
      }).then(function(s) {
        print(s);
        if (!s) throw new Error("Service not found");

        // Process the characteristics sequentially
        return s.getCharacteristic(0x1001).then(function(c) {
          print(c);
          lightCharacteristic = c;
          
          print("completed");
          return lightCharacteristic.startNotifications();
        }).then(function() {
          return s.getCharacteristic(0x1002);
        }).then(function(c) {
          print(c);
          txCharacteristic = c;
        }).then(function() {
          return s.getCharacteristic(0x1003);
        }).then(function(y) {
          print(y);
          buttonCharacteristic = y;
          buttonCharacteristic.on('characteristicvaluechanged', responseReceived);
          return buttonCharacteristic.startNotifications();
        });
      }).then(function() {
        lightCharacteristic.on('characteristicvaluechanged', updateLight);
        busy = false;
      }).catch(function(e) {
        print("Connection error: " + e);
        connected = false;
        busy = false;
      });
    }
  }
  if (!connected && connectionAttempts < 12) {
    setTimeout(connectPuck, 10000); // keep trying every 10 seconds for 2 minutes
    connectionAttempts++;
    if (connectionAttempts == 11) {
      E.showAlert("Could not connect to Puck1").then(drawAll());
    }
  }
}

connectPuck(); //tries to connect when the app is opened

function updateLight(){
    if (connected && lightCharacteristic && !screenBusy) {
        busy = true;
        lightCharacteristic.readValue().then(function(data) {
        lightLevel = parseFloat(((data.getUint16(0, true) / 65535).toFixed(4)));
        drawAll();
        });
        busy = false;
    }
}

function responseReceived(){
  E.showAlert("Response received").then(drawAll());
}

//graphics
var barH = 14;
var barSep = 2;
var barW = 14;
var barsMax = 8;

var h = g.getHeight() - 24;
var w = g.getWidth();

function drawBars(L){
  g.clear();
  g.setColor(255,255,0);

    //how many bars?
  var barsLeft = 0;
  var barsTop = 0;
  var barsRight = 0;

  if(L <= 0.33){
    barsLeft = Math.round((L/0.33)*barsMax);
  }
  else if(L <= 0.66){
    barsLeft = barsMax;
    barsTop = Math.round(((L-0.33)/0.33)*(barsMax+1)); // 9 bars horizontally
  }
  else{
    barsLeft = barsMax;
    barsTop = barsMax + 1;
    barsRight = Math.round(((L-0.66)/0.33)*barsMax);
  }

  for(i = 0; i < barsLeft; i++){
    g.fillRect(
      2, // 2 pixel gap, 3rd pixel
      176 - (24 + 2 + i*(barH + barSep)),
      2 + barW, // 17th pixel
      176 - (24 + 2 + i*(barH + barSep) + barH));
  }

  for(j = 0; j < barsTop; j++){
    g.fillRect(
      2 + barW + 2 + j*(barW + barSep), //x start 19th pixel + j*16
      24, //y start
      1 + barW + 2 + j*(barW + barSep) + barW, // x end
      24 + barH);
  }

  for(k = 0; k < barsRight; k++){
    g.fillRect(
      176 - 1 - barW,
      24 + k*(barH + barSep),
      176 - 1,
      24 + k*(barH + barSep) + barH);
  }

  //print(barsLeft);
  //print(barsTop);
  //print(barsRight);
  g.setColor(g.theme.fg);
  g.drawString(L,2,153);
}


function drawAll(){
g.clear();
  
drawBars(lightLevel);

g.setFont("Vector",12);

var arrowLength = 40;
var arrowDim = 10;
//draw an arrow pointing right
g.setColor(g.theme.fg);

g.drawLine(
  w/2 + 10,
  h/2 + 24,
  w/2 + arrowLength,
  h/2 + 24
);

g.fillPolyAA(
  [w/2 + arrowLength, h/2 + 24 - arrowDim/2,
  w/2 + arrowLength, h/2 + 24 + arrowDim/2,
  w/2 + arrowLength + arrowDim, h/2 + 24],
  1
  );
g.drawString(
  "+ 5 mins",
  w/2 + arrowLength/2, h/2 + 24 + 10
  );


//draw an arrow pointing left
g.drawLine(
  w/2 - 10,
  h/2 + 24,
  w/2 - arrowLength,
  h/2 + 24
);
g.fillPolyAA(
  [w/2 - arrowLength, h/2 + 24 - arrowDim/2,
  w/2 - arrowLength, h/2 + 24 + arrowDim/2,
  w/2 - arrowLength - arrowDim, h/2 + 24],
  1
  );
g.drawString(
  "OK?",
  w/2 - arrowLength/2 - g.stringMetrics("OK?").width, h/2 + 24 + 10
  );

//draw an arrow pointing up
g.drawLine(
  w/2,
  h/2 + 24 - 10,
  w/2,
  h/2 + 24 - 10 - arrowLength/2
);
g.fillPolyAA(
  [w/2 - arrowDim/2, h/2 + 24 - 10 - arrowLength/2,
  w/2 + arrowDim/2, h/2 + 24 - 10 -arrowLength/2,
  w/2, h/2 + 24 - 10 - arrowLength/2 - arrowDim],
  1
  );
g.drawString(
  "OFF",
  w/2 - g.stringMetrics("OFF").width/2, h/2 + 24 - 10 - arrowLength/2- arrowDim - 2 - g.stringMetrics("OFF").height
  );

//draw an arrow pointing down
g.drawLine(
  w/2,
  h/2 + 24 + 10,
  w/2,
  h/2 + 24 + 10 + arrowLength/2
);
g.fillPolyAA(
  [w/2 - arrowDim/2, h/2 + 24 + 10 + arrowLength/2,
  w/2 + arrowDim/2, h/2 + 24 + 10 + arrowLength/2,
  w/2, h/2 + 24 + 10 + arrowLength/2 + arrowDim],
  1
  );
g.drawString(
  "Come Down",
  w/2 - g.stringMetrics("Come Down").width/2, h/2 + 24 + 10 + arrowLength/2 + arrowDim + 2
  );
}

drawAll();

var absY, lastX=0, lastY=0;
Bangle.on('drag', e => {
    screenBusy = true;
  if (!e.b) {
    if (lastX > 40) { // right
      E.showAlert("5 minute \nwarning!").then(() => {
        screenBusy = false;
        return txCharacteristic.writeValue(new Uint8Array([2]));
      }).then(drawAll);
    } else if (lastX < -40) { // left
      E.showAlert("Are you \nOK?").then(() => {
        screenBusy = false;
        return txCharacteristic.writeValue(new Uint8Array([4]));
      }).then(drawAll);
    } else if (lastY > 40) { // down
      E.showAlert("Come Down").then(() => {
        screenBusy = false;
        return txCharacteristic.writeValue(new Uint8Array([3]));
      }).then(drawAll);
    } else if (lastY < -40) { // up
      E.showAlert("Turning \nOff").then(() => {
        screenBusy = false;
        return txCharacteristic.writeValue(new Uint8Array([1]));
      }).then(drawAll);
    }
    lastX = 0;
    lastY = 0;
  } else {
    lastX = lastX + e.dx;
    lastY = lastY + e.dy;
    absY = e.y;
  }
});