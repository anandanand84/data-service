/**
 * Created by aaravin on 7/24/2015.
 */

/*

var Q,isNode,WebSocket;


if (typeof exports !== 'undefined' && this.exports !== exports) {
  WebSocket= require('ws');
  Q = require("q");
  dcodeIO.ProtoBuf = require("protobufjs");
  isNode = true;
}*/

var DataService = require('./DataService.js').DataService;
console.log(DataService);
var users = [];

for(var i=0;i<1;i++){
  users.push(DataService.getInstance());
}

var id;

users.forEach(function(user){
  user.id = setInterval(function(){
    var data = {};
    data.interval = 86400;
    data.requiredBars = 500;
    data.scrip = 'RELIANCE';
    data.registrationId = "";
    var startTime = new Date();
    user.getChartData(data).then(function (resp) {
      console.log("Total Time take is "+((new Date()).getTime() - startTime.getTime())/1000 );
    }, function (error) {
      console.error(error);
    });
  },500);
})
