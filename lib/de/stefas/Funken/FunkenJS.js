/*
 * FUNKENJS
 *
 * Copyright (C) 2019 Alexander Stefas
 * FunkenJS: Serialwrapper for Funken - serial protocol toolkit (GPL) initiated by Alexander Stefas
 *
 * Copyright (c) 2019, Alexander Stefas <alexander.stefas@stefas.de>
 * FunkenJS is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published
 * by the Free Software Foundation; either version 3 of the License,
 * or (at your option) any later version.
 *
 * FunkenJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wasp; If not, see <http://www.gnu.org/licenses/>.
 *
 * @license GPL-3.0 <https://www.gnu.org/licenses/gpl.html>
 */

var events = require('events').EventEmitter;
var sp = require('serialport');

class FunkenJS extends events {
  constructor() {
    super();

    this.baudrate;

    this.classPath = "de.stefas.funken";

    this.serialport = require('serialport');
    this.Readline = this.serialport.parsers.Readline;

    this.port;
    this.cursorNewLine = '\r\n';

    this.messages = new Array();

    this.intervalID;
    this.timeOut = 1;
  }

  writeToPort(msg){
    if(this.port != undefined) this.port.write(msg + this.cursorNewLine);
  }

  connectToPort(comName, baudrate) {
    this.baudrate = baudrate;

    (function(that){
      var error = function(msg){
        that.emit(that.classPath + ".serial.connectionError", msg);
        //console.log("An error during connection occured. See the following Errormessage:");
        //console.log(msg);
      };

      var opened = function(msg){
        that.emit(that.classPath + ".serial.comportOpened", msg);
      //  console.log();
      //	console.log('Successfully opened COMPORT...');
      };

      var closed = function(msg){
        that.emit(that.classPath + ".serial.comportClosed", msg);
        //console.log();
        //console.log('COMPORT has been closed...');
      };

      var data = function(msg){
        that.addToMessageQueque(msg);
      }

      var sepo = that.serialport;

      that.port = new sepo(comName, {baudRate: that.baudrate, autoOpen: true});
      that.port.on('error', error);
      that.port.on('open', opened);
      that.port.on('close', closed);

      var readline = that.Readline;
      var lineparser = new readline();
      that.port.pipe(lineparser);

      lineparser.on('data', data);

    })(this);
  }

  stopTimer(){
    if(this.intervalID != undefined){
      clearInterval(this.intervalID);
      this.intervalID = undefined;
    }
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

      this.emit(this.classPath + ".serial.data", JSON.stringify(obj));
    }
  }

  addToMessageQueque(msg){
    this.messages.push(msg.split('\r')[0].split('\n')[0]+"|"+Date.now());

    if(this.messages.length > 0) this.startTimer();
    else this.stopTimer();
  }

  static listPorts() {
    var c = 0;
    (function(counter){
      sp.list(function (err, ports) {

        ports.forEach(function(port){
          console.log('');
          console.log('Serialport');
          console.log('index :' + counter + '');

          for(var t in port){
            console.log(t + ' : ' + port[t] + '');
          }

          counter++;
        });
      });
    })(c);
  }
}

module.exports = FunkenJS;
