var FunkenJS = require('./FunkenJS.js');

var fnkDev01 = new FunkenJS();

FunkenJS.listPorts();

//WELL... THIS AHS TO BE ALTERED OBVIOUSLY
fnkDev01.connectToPort("/dev/tty.usbmodem143301", 57600);

fnkDev01.on("de.funken.serial.data", function(msg){
  console.log(msg);
});
fnkDev01.on("de.funken.serial.connectionError", function(msg){
  console.log("There has been an error establishing a connection on the COMPORT");
  console.log(msg);
});
fnkDev01.on("de.funken.serial.comportOpened", function(msg){
  console.log("COMPORT has been opened");
  console.log(msg);
});
fnkDev01.on("de.funken.serial.comportClosed", function(msg){
  console.log("COMPORT has been closed");
  console.log(msg);
});
