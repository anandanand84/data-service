/**
 * Created by aaravin on 7/24/2015.
 */

var Q,dcodeIO,isNode;

if (typeof exports !== 'undefined' && this.exports !== exports) {
  var WebSocket= require('ws');
  Q = require("q");
  dcodeIO.ProtoBuf = require("protobufjs");
  isNode = true;
}
