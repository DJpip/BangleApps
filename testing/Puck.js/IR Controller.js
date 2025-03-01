//bit choose function
function sendBit(bit) {
    return bit ? [0.55, 1.65] : [0.55, 0.55];
}

//convert bit array into IR signal
function sendByte(byte) {
    let bitArray = [];
    for (let i = 0; i < 8; i++) {
        bitArray = bitArray.concat(sendBit((byte >> i) & 1));
    }
    return bitArray;
}

function send(command) { //on is command 69, off is command 71
    let irSignal = [];

    var address = 0;
   
    //start bit
    //9ms high, 4.5ms low
    irSignal = irSignal.concat([9, 4.5]);

    //address byte
    irSignal = irSignal.concat(sendByte(address));

    //invert the address byte
    irSignal = irSignal.concat(sendByte(address ^ 0xFF));

    //command byte
    irSignal = irSignal.concat(sendByte(command));

    //send the command byte inverted
    irSignal = irSignal.concat(sendByte(command ^ 0xFF));

    //end bit
    //1 bit
    irSignal = irSignal.concat([0.56]);
   
    //uncomment for a repeat code added
    //irSignal = irSignal.concat([39.9,9,2.3,0.56]);

    Puck.IR(irSignal);
   
    //console.log(irSignal);
    //console.log(`Sending address: ${address}, command: ${command}`);
}


//Code to flash the LED
function flashLED(onTime){
    digitalWrite(LED1,1);
    setTimeout(() => {
        digitalWrite(LED1,0);
    }, onTime);
}

var timeoutRR;

function requestResponse(){
    if(timeoutRR){clearInterval(timeoutRR);}
    timeoutRR =  setInterval(() => {
        flashLED(200);
    },
    1800);
}


//Code to flash the light on and off
function pulseLight(pulselength){
    send(69); //turn on immediately
    setTimeout(() => {
        send(71); //turn off after pulselength
    }, 
    pulselength);
}

var pulseTimeout;
function repeatPulse(pulses, pulseLength){
   if(pulseTimeout){clearInterval(pulseTimeout);}
    pulseTimeout = setInterval(() => {
        pulseLight(pulseLength);
        pulses--;
        if(pulses == 0){
            clearInterval(pulseTimeout);
        }
    }, 
    pulseLength * 2);
}

function fiveMins(){
    send(71); //start with off
    setTimeout(() => {
        repeatPulse(5, 1500);
    }
    ,1000);
}

function off(){
    send(71);
}

function comeDown(){
    repeatPulse(100, 2000);
}

function OK(){
    repeatPulse(1, 300);
}

NRF.setAdvertising({}, { 
    name: "Puck1", 
    connectable: true, 
    discoverable: true,
    showName: true,       
    scannable : true,  
    whenConnected : false, // keep advertising when connected (nRF52 only)
                             // switches to advertising as non-connectable when it is connected
    interval: 500,              // Advertising interval in msec, between 20 and 10000 (default is 375ms)
    
});

NRF.setServices({
    0xFFFF: {
        0x1001: { //advertise the light level
            value : [0],
            maxLen: 6,
            readable: true,
            notify: true
        },
        0x1002: { //Call the relevant IR function when written to
            value : [0],
            writable: true,
            onWrite: function(evt) {
                switch(evt.data[0]){
                    case 1:
                        off();
                        break;
                    case 2:
                        fiveMins();
                        break;
                    case 3:
                        comeDown();
                        break;
                    case 4:
                        OK();
                        break;
                    default:
                        break;
                }
            }
        },
        0x1003: { //advertise button presses
            value : [0],
            readable: true,
            notify: true
        }
    }
});

var intervalId = 0;
//update light value every second while connected
NRF.on('connect', () => {
    setTimeout(function(){
        intervalId = setInterval(() => {
        let lightValue = Puck.light(); 
        let buffer = new ArrayBuffer(2);
        let view = new DataView(buffer);
        view.setUint16(0, Math.round(lightValue * 100)); // Scale and round the value
        NRF.updateServices({
            0xFFFF: {
            0x1001: {
                value: new Uint8Array(buffer),
                notify: true
            }
            }
        });
    }, 
    1000);
}, 5000);//gives the bluetooth stack time to set up before reporting the light level
}
);

NRF.on('disconnect', () => {
        clearInterval(intervalId);
    });



//button responses
setWatch(function() {
    //cancel the request response
    clearInterval(pulseTimeout);
    clearInterval(timeoutRR);
    send(69);
    flashLED(500);
    NRF.updateServices({
        0xFFFF: {
            0x1003: {
                value: [1]
            }
        }
    });
    setTimeout(() => {
        NRF.updateServices({
            0xFFFF: {
                0x1003: {
                    value: [0]
                }
            }
        });
    }, 5000);
},
BTN, { repeat: true, edge: 'rising', debounce: 50 });
