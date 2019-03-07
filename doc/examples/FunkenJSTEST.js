var fnk = require('./FunkenJS.js');


fnk.listPorts();

fnk.on("de.funken.serial.data", function(msg){
  console.log(msg);
});
fnk.on("de.funken.serial.connectionError", function(msg){
  console.log("There has been an error establishing a connection on the COMPORT");
  console.log(msg);
});
fnk.on("de.funken.serial.comportOpened", function(msg){
  console.log("COMPORT has been opened");
  console.log(msg);
});
fnk.on("de.funken.serial.comportClosed", function(msg){
  console.log("COMPORT has been closed");
  console.log(msg);
});
