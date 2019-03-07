var events = require('events').EventEmitter;

class FunkenJS extends events {
  constructor(baudrate, comPortAsIndex) {
    super();
    this.serialBaudRate = baudrate;
    this.selectedPort = comPortAsIndex;

    this.events = require('events').EventEmitter;
    this.emitter = new this.events.EventEmitter();
    this.sp = require('serialport');

    this.Readline = this.sp.parsers.Readline;
    this.availablePorts = 0;

    this.port;

    this.messages = new Array();
    this.intervalID;
    this.timeOut = 1;
  }

  startTimer(){
    (function(that){
      var shiftOut = function(){
        if(that.messages.length > 0) {
          //WELL... kind of a paradigm. do the json thingie now or at the controller
          var messageToDeliver = that.messages.shift();
          that.messageToJSON(messageToDeliver);
        }
      }

      if(that.intervalID == undefined) that.intervalID = setInterval(shiftOut, that.timeOut);
    })(this);
  }

  stopTimer(){
    if(this.intervalID != undefined){
      clearInterval(this.intervalID);
      this.intervalID = undefined;
    }
  }

  shiftOutMessages(){
    (function(that){
      if(that.messages.length > 0) {
        //WELL... kind of a paradigm. do the json thingie now or at the controller
        var messageToDeliver = that.messages.shift();
        that.messageToJSON(messageToDeliver);
      }
    })(this);
  }

  messageToJSON(messageToDeliver){
    if(messageToDeliver.indexOf("<") != -1 && messageToDeliver.indexOf(">") != -1){
      var obj = new Object();

      obj['sender'] = messageToDeliver.split("<")[1].split(":")[0];

      if(messageToDeliver.indexOf(":") != -1){
        obj['id'] = messageToDeliver.split(":")[1];
        obj['token'] = messageToDeliver.split(":")[2];
        obj['message'] = messageToDeliver.split(":")[3].split(">")[0];
        obj['uts'] = messageToDeliver.split("|")[1];
      }

      this.emit("de.funken.serial.data", JSON.stringify(obj));
    }
  }

  checkArgs(ports){
    if(process.argv.length < 3){
        console.log("Please start this script with the index of the desired serialport as a first argument.");
        console.log("Something like 'node core.js 2'");
    } else {
      this.connectToPort(ports, Number(process.argv[2]));
    }
  }

  addToMessageQueque(msg){
    this.messages.push(msg.split('\r')[0].split('\n')[0]+"|"+Date.now());

    if(this.messages.length > 0) this.startTimer();
    else this.stopTimer();
  }

  connectToPort(ports, index){
    (function(that, p, i){
      var error = function(msg){
        that.emit("de.funken.serial.connectionError", msg);
        //console.log("An error during connection occured. See the following Errormessage:");
        //console.log(msg);
      };

      var opened = function(msg){
        that.emit("de.funken.serial.comportOpened", msg);
      //  console.log();
      //	console.log('Successfully opened COMPORT...');
      };

      var closed = function(msg){
        that.emit("de.funken.serial.comportClosed", msg);
        //console.log();
        //console.log('COMPORT has been closed...');
      };

      var data = function(msg){
        that.addToMessageQueque(msg);
      }

      var sp = that.sp;

      that.port = new sp(p[i].comName.toString(), {baudRate: that.serialBaudRate, autoOpen: true});
      that.port.on('error', error);
      that.port.on('open', opened);
      that.port.on('close', closed);

      var readline = that.Readline;
      var lineparser = new readline();
    	that.port.pipe(lineparser);

    	lineparser.on('data', data);

    })(this, ports, index);
  }

  listPorts() {
    var c = 0;
    (function(that, counter){

      that.sp.list(function (err, ports) {
        that.availablePorts = ports;

        ports.forEach(function(port){
          console.log('');
          console.log('Serialport :');
          console.log('index :' + counter + '');

          for(var t in port){
            console.log(t + ' : ' + port[t] + '');
          }

          counter++;
        });

        that.checkArgs(that.availablePorts);
      });
    })(this, c);
  }
}

module.exports = FunkenJS;
