/// <reference path="./q/Q.d.ts" />
/// <reference path="./protobufjs/protobufjs.d.ts" />
/// <reference path="./StockMessages.d.ts" />
var PubSub = (function () {
    function PubSub() {
        this.topics = {};
        this.subUid = -1;
        if (PubSub._instance) {
            throw new Error("Error: Instantiation failed: Use PubSub.getInstance() instead of new.");
        }
    }
    PubSub.getInstance = function () {
        if (PubSub._instance === null) {
            PubSub._instance = new PubSub();
        }
        return PubSub._instance;
    };
    PubSub.prototype.publish = function (topic, args) {
        if (!this.topics[topic]) {
            return false;
        }
        var subscribers = this.topics[topic], len = subscribers ? subscribers.length : 0;
        while (len--) {
            subscribers[len].func(topic, args);
        }
        return true;
    };
    PubSub.prototype.subscribe = function (topic, func) {
        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }
        var token = (++this.subUid).toString();
        this.topics[topic].push({
            token: token,
            func: func
        });
        return token;
    };
    PubSub.prototype.unsubscribe = function (token) {
        for (var m in this.topics) {
            if (this.topics[m]) {
                for (var i = 0, j = this.topics[m].length; i < j; i++) {
                    if (this.topics[m][i].token === token) {
                        this.topics[m].splice(i, 1);
                        return true;
                    }
                }
                if (this.topics[m].length == 0) {
                    delete this.topics[m];
                }
            }
        }
        return false;
    };
    PubSub._instance = null;
    return PubSub;
})();
var isNode;
var dcodeIO = dcodeIO || {};
if (typeof exports !== 'undefined' && this.exports !== exports) {
    WebSocket = require('ws');
    dcodeIO.ProtoBuf = require("protobufjs");
    isNode = true;
}
if (!isNode) {
    if (typeof dcodeIO === 'undefined' || !dcodeIO.ProtoBuf) {
        throw (new Error("ProtoBuf.js is not present. Please see www/index.html for manual setup instructions."));
    }
}
var StockMessages = dcodeIO.ProtoBuf.loadProtoFile("StockMessages.proto");
var Header = StockMessages.build("Header");
var HeaderReader = StockMessages.build("HeaderReader");
var BarDetails = StockMessages.build("BarDetails");
var ChartResponseData = StockMessages.build("ChartResponseData");
var ChartRequestData = StockMessages.build("ChartRequestData");
var ChartRequest = StockMessages.build("ChartRequest");
var ChartResponse = StockMessages.build("ChartResponse");
var AvailableScripsResponse = StockMessages.build("AvailableScripsResponse");
var AvailableScripsRequest = StockMessages.build("AvailableScripsRequest");
var AvailableScripsResponseData = StockMessages.build("AvailableScripsResponseData");
var AvailableScripsRequestData = StockMessages.build("AvailableScripsRequestData");
var QuoteSubscriptionRequest = StockMessages.build("QuoteSubscriptionRequest");
var QuoteSubscriptionRequestData = StockMessages.build("QuoteSubscriptionRequestData");
var QuoteSubscriptionResponse = StockMessages.build("QuoteSubscriptionResponse");
var QuoteSubscriptionResponseData = StockMessages.build("QuoteSubscriptionResponseData");
var Socket = (function () {
    function Socket(wsUri) {
        this.requestMap = {};
        this.eventsMap = {};
        this.wsUri1 = "ws://traderslab.in/websocket";
        //private wsUri1 = "ws://traderslab.in:9010/websocket";
        //private wsUri1 = "ws://localhost:9091/iciciAutomation/websocket";
        this.websocket1 = new WebSocket(this.wsUri1);
        this.lastConnectTimeout = 5000;
        this.pendingRequestArray = [];
        this.flushRequests = function () {
            if (this.websocket1.readyState == WebSocket.OPEN) {
                var request;
                try {
                    while (this.pendingRequestArray.length != 0) {
                        request = this.pendingRequestArray.shift();
                        this.sendMessage(request);
                    }
                }
                catch (ex) {
                    this.pendingRequestArray.push(request);
                    this.lastConnectTimeout = this.lastConnectTimeout * 2;
                    console.log("Connection lost retrying..." + this.lastConnectTimeout);
                    setTimeout(this.flushRequests.bind(this), this.lastConnectTimeout);
                }
            }
            else if (this.websocket1.readyState == WebSocket.CONNECTING) {
                console.log("Waiting for connection to be established...");
                setTimeout(this.flushRequests.bind(this), 2000);
            }
            else if (this.websocket1.readyState == WebSocket.CLOSED) {
                this.websocket1.close();
                this.websocket1 = new WebSocket(this.wsUri1);
                this.configureSocket();
                this.lastConnectTimeout = this.lastConnectTimeout * 2;
                console.log("Retrying connection in " + this.lastConnectTimeout);
                setTimeout(this.flushRequests.bind(this), this.lastConnectTimeout);
            }
        };
        this.sendMessage = function (data) {
            console.log(new Date().getTime() + " Message sent : " + data);
            if (isNode) {
                this.websocket1.send(new Buffer(new Uint8Array(data)), { binary: true, mask: true });
            }
            else {
                this.websocket1.send(data);
            }
        };
        this.configureSocket = function () {
            var _this = this;
            this.websocket1.binaryType = "arraybuffer";
            this.websocket1.onmessage = function (evt) {
                try {
                    var callback = HeaderReader.decode(evt.data)['header']['callBackId'];
                    if (callback) {
                        if (_this.eventsMap[callback]) {
                            _this.eventsMap[callback]['notify'](evt.data);
                        }
                        else {
                            _this.requestMap[callback].resolve(evt.data);
                            delete _this.requestMap[callback];
                        }
                    }
                    else {
                    }
                }
                catch (message) {
                    console.log(message);
                }
            };
            this.websocket1.onopen = function (evt) {
                _this.lastConnectTimeout = 5000;
                _this.flushRequests();
                /* this.websocket1.onclose = (evt:CloseEvent) =>{
                 this.flushRequests();
                 }*/
            };
            this.websocket1.onclose = function (evt) {
                console.log('Websocket connection closed', evt);
            };
            this.websocket1.onerror = function (evt) {
                console.log('Error occured on websocket connection', evt);
            };
        };
        //this.wsUri1 = wsUri;
        this.configureSocket();
    }
    Socket.prototype.processRequest = function (request, immediateFail) {
        var deferred = Q.defer();
        var callback = request['header']['callBackId'];
        ;
        this.requestMap[callback] = deferred;
        if (immediateFail) {
            this.sendMessage(request.toArrayBuffer());
        }
        else {
            this.pendingRequestArray.push(request.toArrayBuffer());
            this.flushRequests();
        }
        //sendMessage(request.toArrayBuffer());
        return deferred['promise'];
    };
    Socket.prototype.subscribeEvents = function (request, immediateFail) {
        var deferred;
        var callback = request.header.callBackId;
        if (!this.eventsMap[callback]) {
            deferred = Q.defer();
            this.eventsMap[callback] = deferred;
        }
        else {
            deferred = this.eventsMap[callback];
        }
        if (immediateFail) {
            this.sendMessage(request.toArrayBuffer());
        }
        else {
            this.pendingRequestArray.push(request.toArrayBuffer());
            this.flushRequests();
        }
        //sendMessage(request.toArrayBuffer());
        return deferred['promise'];
    };
    Socket.prototype.unSubscribeEvents = function () {
    };
    Socket.prototype.close = function (reason) {
        reason = reason || "Client Closed the Browser";
        this.websocket1.close(1000, reason);
    };
    return Socket;
})();
;
var DataService = (function () {
    function DataService() {
        var _this = this;
        this.subscriptionProgressCreated = false;
        this.SOCKET_CALLBACK_ID = 1;
        if (DataService._instance) {
            throw new Error("Error: Instantiation failed: Use DataService.getInstance() instead of new.");
        }
        this.socket = new Socket();
        DataService._instance = this;
        if (!isNode) {
            window.addEventListener("beforeunload", function () {
                console.log('Before unload closing the socket');
                _this.socket.close();
                return;
            });
        }
    }
    DataService.getInstance = function () {
        if (DataService._instance === null) {
            DataService._instance = new DataService();
        }
        return DataService._instance;
    };
    DataService.prototype.getNewCallbackId = function () {
        return "D" + (this.SOCKET_CALLBACK_ID++).toString();
    };
    DataService.prototype.addHeader = function (messageType, handler) {
        var messageHeader = new Header();
        messageHeader['messageType'] = messageType;
        messageHeader['handler'] = handler;
        messageHeader['callBackId'] = this.getNewCallbackId();
        return messageHeader;
    };
    DataService.prototype.getChartData = function (chartRequestData) {
        var deferred = Q.defer();
        var chartRequest = new ChartRequest();
        chartRequest['header'] = this.addHeader('ChartRequest', "/chart/data");
        ;
        chartRequest['chReqData'] = chartRequestData;
        this.socket.processRequest(chartRequest, false).then(function (data) {
            var responseHeader = HeaderReader.decode(data);
            var res = ChartResponse.decode(data);
            var response = JSON.parse(JSON.stringify(res))['chResData'];
            deferred.resolve(response);
            ;
        });
        return deferred['promise'];
    };
    DataService.prototype.getAvailableScrips = function (scripsRequest) {
        var deferred = Q.defer();
        var availableScripsRequest = new AvailableScripsRequest();
        availableScripsRequest['header'] = this.addHeader("AvailableScripsRequest", "/availableScrips");
        availableScripsRequest['reqData'] = scripsRequest;
        this.socket.processRequest(availableScripsRequest, false).then(function (data) {
            var res = AvailableScripsResponse.decode(data);
            deferred.resolve(res['resData']);
            ;
        });
        return deferred['promise'];
    };
    DataService.prototype.subscribeForScrips = function (subscriptionRequest, callBack) {
        var topic = subscriptionRequest.exchange + "_" + subscriptionRequest.scrip;
        var topicSubScriptionId = PubSub.getInstance().subscribe(topic, callBack);
        var availableScripsRequest = new QuoteSubscriptionRequest();
        var header = this.addHeader("QuoteSubscriptionRequest", "/marketWatch/subscribe");
        header.callBackId = "quoteSubscription";
        availableScripsRequest['header'] = header;
        availableScripsRequest['reqData'] = subscriptionRequest;
        var promise = this.socket.subscribeEvents(availableScripsRequest, false);
        if (!this.subscriptionProgressCreated) {
            promise.progress(function (data) {
                var res = QuoteSubscriptionResponse.decode(data).resData.toRaw();
                var topic = res.exchange + "_" + res.scrip;
                ;
                PubSub.getInstance().publish(topic, res);
            });
        }
        return topicSubScriptionId;
    };
    DataService.prototype.unSubscribeForScrips = function (subscriptionRequest, subscriptionId) {
        var topic = subscriptionRequest.exchange + "_" + subscriptionRequest.scrip;
        var status = PubSub.getInstance().unsubscribe(subscriptionId);
        var availableScripsRequest = new QuoteSubscriptionRequest();
        var header = this.addHeader("QuoteSubscriptionRequest", "/marketWatch/subscribe");
        header.callBackId = "quoteSubscription";
        availableScripsRequest['header'] = header;
        availableScripsRequest['reqData'] = subscriptionRequest;
        var promise = this.socket.subscribeEvents(availableScripsRequest, false);
        return status;
    };
    DataService._instance = null;
    return DataService;
})();
exports.DataService = DataService;
//# sourceMappingURL=DataService.js.map