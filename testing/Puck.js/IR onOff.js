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

function send(command) {
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
    //1 bit + repeat code twice
    irSignal = irSignal.concat([0.56,39.9,9,2.3,0.56,96.2,9,2.3,0.5]);
   
    Puck.IR(irSignal);
   
    console.log(irSignal);
    console.log(`Sending address: ${address}, command: ${command}`);
}
//on is command 69, off is command 71
let isON = false;

//when the button is pressed, the command will be sent
setWatch(() => {
    isON = !isON;
    chosen = isON? 69 : 71;
    send(chosen);
    console.log(`Light is ${isON ? "on" : "off"}`);
}, BTN, { edge: "rising", debounce: 50, repeat: true });