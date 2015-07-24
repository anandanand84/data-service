(function e$$0(n,h,m){function k(f,l){if(!h[f]){if(!n[f]){var g="function"==typeof require&&require;if(!l&&g)return g(f,!0);if(p)return p(f,!0);g=Error("Cannot find module '"+f+"'");throw g.code="MODULE_NOT_FOUND",g;}g=h[f]={exports:{}};n[f][0].call(g.exports,function(g){var h=n[f][1][g];return k(h?h:g)},g,g.exports,e$$0,n,h,m)}return h[f].exports}for(var p="function"==typeof require&&require,l=0;l<m.length;l++)k(m[l]);return k})({1:[function(c,n,h){n=c("protobufjs");var m=c("q"),k=c("ws"),p=function(){function a(){this.topics=
{};this.subUid=-1;if(a._instance)throw Error("Error: Instantiation failed: Use PubSub.getInstance() instead of new.");}a.getInstance=function(){null===a._instance&&(a._instance=new a);return a._instance};a.prototype.publish=function(a,d){if(!this.topics[a])return!1;for(var b=this.topics[a],e=b?b.length:0;e--;)b[e].func(a,d);return!0};a.prototype.subscribe=function(a,d){this.topics[a]||(this.topics[a]=[]);var b=(++this.subUid).toString();this.topics[a].push({token:b,func:d});return b};a.prototype.unsubscribe=
function(a){for(var d in this.topics)if(this.topics[d]){for(var b=0,e=this.topics[d].length;b<e;b++)if(this.topics[d][b].token===a)return this.topics[d].splice(b,1),!0;0==this.topics[d].length&&delete this.topics[d]}return!1};a._instance=null;return a}(),l=!1;if("undefined"!==typeof h&&this.exports!==h)l=!0;else{var f=f||{};if("undefined"===typeof f||!f.ProtoBuf)throw Error("ProtoBuf.js is not present. Please see www/index.html for manual setup instructions.");}c=n.loadProtoFile("StockMessages.proto");
var r=c.build("Header"),g=c.build("HeaderReader");c.build("BarDetails");c.build("ChartResponseData");c.build("ChartRequestData");var t=c.build("ChartRequest"),u=c.build("ChartResponse"),w=c.build("AvailableScripsResponse"),x=c.build("AvailableScripsRequest");c.build("AvailableScripsResponseData");c.build("AvailableScripsRequestData");var q=c.build("QuoteSubscriptionRequest");c.build("QuoteSubscriptionRequestData");var y=c.build("QuoteSubscriptionResponse");c.build("QuoteSubscriptionResponseData");
var z=function(){function a(a){this.requestMap={};this.eventsMap={};this.wsUri1="ws://traderslab.in:8484/iciciAutomation/websocket";this.websocket1=new k(this.wsUri1);this.lastConnectTimeout=5E3;this.pendingRequestArray=[];this.flushRequests=function(){if(this.websocket1.readyState==k.OPEN){var a;try{for(;0!=this.pendingRequestArray.length;)a=this.pendingRequestArray.shift(),this.sendMessage(a)}catch(b){this.pendingRequestArray.push(a),this.lastConnectTimeout*=2,console.log("Connection lost retrying..."+
this.lastConnectTimeout),setTimeout(this.flushRequests.bind(this),this.lastConnectTimeout)}}else this.websocket1.readyState==k.CONNECTING?(console.log("Waiting for connection to be established..."),setTimeout(this.flushRequests.bind(this),2E3)):this.websocket1.readyState==k.CLOSED&&(this.websocket1.close(),this.websocket1=new k(this.wsUri1),this.configureSocket(),this.lastConnectTimeout*=2,console.log("Retrying connection in "+this.lastConnectTimeout),setTimeout(this.flushRequests.bind(this),this.lastConnectTimeout))};
this.sendMessage=function(a){console.log((new Date).getTime()+" Message sent : "+a);l||this.websocket1.send(a)};this.configureSocket=function(){var a=this;this.websocket1.binaryType="arraybuffer";this.websocket1.onmessage=function(b){try{var e=g.decode(b.data).header.callBackId;e&&(a.eventsMap[e]?a.eventsMap[e].notify(b.data):(a.requestMap[e].resolve(b.data),delete a.requestMap[e]))}catch(v){console.log(v)}};this.websocket1.onopen=function(b){a.lastConnectTimeout=5E3;a.flushRequests()};this.websocket1.onclose=
function(a){console.log("Websocket connection closed",a)};this.websocket1.onerror=function(a){console.log("Error occured on websocket connection",a)}};this.configureSocket()}a.prototype.processRequest=function(a,d){var b=m.defer();this.requestMap[a.header.callBackId]=b;d?this.sendMessage(a.toArrayBuffer()):(this.pendingRequestArray.push(a.toArrayBuffer()),this.flushRequests());return b.promise};a.prototype.subscribeEvents=function(a,d){var b,e=a.header.callBackId;this.eventsMap[e]?b=this.eventsMap[e]:
(b=m.defer(),this.eventsMap[e]=b);d?this.sendMessage(a.toArrayBuffer()):(this.pendingRequestArray.push(a.toArrayBuffer()),this.flushRequests());return b.promise};a.prototype.unSubscribeEvents=function(){};a.prototype.close=function(a){this.websocket1.close(1E3,a||"Client Closed the Browser")};return a}();c=function(){function a(){var c=this;this.subscriptionProgressCreated=!1;this.SOCKET_CALLBACK_ID=1;if(a._instance)throw Error("Error: Instantiation failed: Use DataService.getInstance() instead of new.");
this.socket=new z;a._instance=this;l||window.addEventListener("beforeunload",function(){console.log("Before unload closing the socket");c.socket.close()})}a.getInstance=function(){null===a._instance&&(a._instance=new a);return a._instance};a.prototype.getNewCallbackId=function(){return"D"+(this.SOCKET_CALLBACK_ID++).toString()};a.prototype.addHeader=function(a,d){var b=new r;b.messageType=a;b.handler=d;b.callBackId=this.getNewCallbackId();return b};a.prototype.getChartData=function(a){var d=m.defer(),
b=new t;b.header=this.addHeader("ChartRequest","/chart/data");b.chReqData=a;this.socket.processRequest(b,!1).then(function(a){g.decode(a);a=u.decode(a);a=JSON.parse(JSON.stringify(a)).chResData;d.resolve(a)});return d.promise};a.prototype.getAvailableScrips=function(a){var d=m.defer(),b=new x;b.header=this.addHeader("AvailableScripsRequest","/availableScrips");b.reqData=a;this.socket.processRequest(b,!1).then(function(a){a=w.decode(a);d.resolve(a.resData)});return d.promise};a.prototype.subscribeForScrips=
function(a,d){var b=a.exchange+"_"+a.scrip,b=p.getInstance().subscribe(b,d),e=new q,c=this.addHeader("QuoteSubscriptionRequest","/marketWatch/subscribe");c.callBackId="quoteSubscription";e.header=c;e.reqData=a;e=this.socket.subscribeEvents(e,!1);this.subscriptionProgressCreated||e.progress(function(a){a=y.decode(a).resData.toRaw();var b=a.exchange+"_"+a.scrip;p.getInstance().publish(b,a)});return b};a.prototype.unSubscribeForScrips=function(a,d){var b=p.getInstance().unsubscribe(d),c=new q,f=this.addHeader("QuoteSubscriptionRequest",
"/marketWatch/subscribe");f.callBackId="quoteSubscription";c.header=f;c.reqData=a;this.socket.subscribeEvents(c,!1);return b};a._instance=null;return a}();h=[];for(f=0;1>f;f++)h.push(new c);h.forEach(function(a){a.id=setInterval(function(){var c=new Date;a.getChartData({interval:86400,requiredBars:500,scrip:"RELIANCE",registrationId:""}).then(function(a){console.log("Total Time take is "+((new Date).getTime()-c.getTime())/1E3)},function(a){console.error(a)})},500)})},{protobufjs:void 0,q:void 0,ws:void 0}]},
{},[1]);
