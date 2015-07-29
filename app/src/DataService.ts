/// <reference path="./q/Q.d.ts" />
/// <reference path="./protobufjs/protobufjs.d.ts" />
/// <reference path="./StockMessages.d.ts" />


class PubSub{

  private topics:any = {}

  private subUid:number = -1;

  private static _instance:PubSub = null;


  constructor(){
    if(PubSub._instance){
      throw new Error("Error: Instantiation failed: Use PubSub.getInstance() instead of new.");
    }
  }

  public static getInstance():PubSub
  {
    if(PubSub._instance === null) {
      PubSub._instance = new PubSub();
    }
    return PubSub._instance;
  }

  publish(topic:any,args:any):boolean{
    if (!this.topics[topic]) {
      return false;
    }
    var subscribers = this.topics[topic], len = subscribers ? subscribers.length : 0;
    while (len--) {
      subscribers[len].func(topic, args);
    }
    return true;
  }

  subscribe(topic:any, func:(topic:any,data:any)=>any):string{
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }
    var token = (++this.subUid).toString();
    this.topics[topic].push({
      token: token,
      func: func
    });
    return token;
  }

  unsubscribe(token:String):boolean{
    for (var m in this.topics) {
      if (this.topics[m]) {
        for (var i = 0, j = this.topics[m].length; i < j; i++) {
          if (this.topics[m][i].token === token) {
            this.topics[m].splice(i, 1);
            return true;
          }
        }
        if(this.topics[m].length == 0){
          delete this.topics[m];
        }
      }
    }
    return false;
  }
}

var isNode;
var dcodeIO:any = dcodeIO || {};
if (typeof exports !== 'undefined' && this.exports !== exports) {
  WebSocket = require('ws');
  dcodeIO.ProtoBuf = require("protobufjs");
  isNode = true;
}

if(!isNode){
  if (typeof dcodeIO === 'undefined' || !dcodeIO.ProtoBuf) {
    throw(new Error("ProtoBuf.js is not present. Please see www/index.html for manual setup instructions."));
  }
}


var StockMessages= dcodeIO.ProtoBuf.loadProtoFile("StockMessages.proto");

var Header:any =StockMessages.build("Header");
var HeaderReader:any =StockMessages.build("HeaderReader");
var BarDetails:any=StockMessages.build("BarDetails");
var ChartResponseData:any=StockMessages.build("ChartResponseData");
var ChartRequestData:any=StockMessages.build("ChartRequestData");
var ChartRequest:any=StockMessages.build("ChartRequest");
var ChartResponse:any=StockMessages.build("ChartResponse");
var AvailableScripsResponse:any = StockMessages.build("AvailableScripsResponse");
var AvailableScripsRequest:any = StockMessages.build("AvailableScripsRequest");
var AvailableScripsResponseData:any = StockMessages.build("AvailableScripsResponseData");
var AvailableScripsRequestData:any = StockMessages.build("AvailableScripsRequestData");

var QuoteSubscriptionRequest:any = StockMessages.build("QuoteSubscriptionRequest");
var QuoteSubscriptionRequestData:any = StockMessages.build("QuoteSubscriptionRequestData");
var QuoteSubscriptionResponse:any = StockMessages.build("QuoteSubscriptionResponse");
var QuoteSubscriptionResponseData:any = StockMessages.build("QuoteSubscriptionResponseData");


class Socket{
  private requestMap:any = {};
  private eventsMap:any = {};
  private wsUri1 = "ws://traderslab.in/websocket";
  //private wsUri1 = "ws://traderslab.in:9010/websocket";
  //private wsUri1 = "ws://localhost:9091/iciciAutomation/websocket";
  private websocket1 = new WebSocket(this.wsUri1);

  private lastConnectTimeout = 5000;
  private pendingRequestArray:any = [];

  constructor(wsUri?:string){
    //this.wsUri1 = wsUri;
    this.configureSocket();
  }


  processRequest(request:any,immediateFail:boolean){
    var deferred = Q.defer();
    var callback = request['header']['callBackId'];;
    this.requestMap[callback] = deferred;

    if(immediateFail){
      this.sendMessage(request.toArrayBuffer());
    }
    else{
      this.pendingRequestArray.push(request.toArrayBuffer());
      this.flushRequests();
    }
    //sendMessage(request.toArrayBuffer());
    return deferred['promise'];
  }

  subscribeEvents(request:any,immediateFail:boolean){
    var deferred;

    var callback = request.header.callBackId;

    if(!this.eventsMap[callback]){
      deferred = Q.defer();
      this.eventsMap[callback] = deferred;
    }else{
      deferred = this.eventsMap[callback];
    }

    if(immediateFail){
      this.sendMessage(request.toArrayBuffer());
    }
    else{
      this.pendingRequestArray.push(request.toArrayBuffer());
      this.flushRequests();
    }
    //sendMessage(request.toArrayBuffer());
    return deferred['promise'];
  }

  unSubscribeEvents(){

  }

  close(reason?:string){
    reason = reason || "Client Closed the Browser";
    this.websocket1.close(1000,reason);
  }

  private flushRequests = function(){
    if(this.websocket1.readyState == WebSocket.OPEN){
      var request:any;
      try{
        while(this.pendingRequestArray.length != 0){
          request = this.pendingRequestArray.shift();
          this.sendMessage(request);
        }
      }
      catch(ex){
        this.pendingRequestArray.push(request);
        this.lastConnectTimeout = this.lastConnectTimeout * 2;
        console.log("Connection lost retrying..." + this.lastConnectTimeout);
        setTimeout(this.flushRequests.bind(this), this.lastConnectTimeout);
      }
    }else if(this.websocket1.readyState == WebSocket.CONNECTING){
      console.log("Waiting for connection to be established...");
      setTimeout(this.flushRequests.bind(this), 2000);
    }else if(this.websocket1.readyState == WebSocket.CLOSED){
      this.websocket1.close();
      this.websocket1 = new WebSocket(this.wsUri1);
      this.configureSocket();
      this.lastConnectTimeout = this.lastConnectTimeout * 2;
      console.log("Retrying connection in " + this.lastConnectTimeout);
      setTimeout(this.flushRequests.bind(this), this.lastConnectTimeout);
    }
  }

  private sendMessage = function(data:any){
    console.log(new Date().getTime()+" Message sent : "+data);
    if(isNode){
      this.websocket1.send(new Buffer(new Uint8Array(data)),{ binary: true,mask:true});
    }else{
      this.websocket1.send(data);
    }


  }

  private configureSocket = function (){

    this.websocket1.binaryType = "arraybuffer";
    this.websocket1.onmessage = (evt:MessageEvent) =>{
      try{
        var callback = HeaderReader.decode(evt.data)['header']['callBackId'];
        if(callback){
          if(this.eventsMap[callback]){
            this.eventsMap[callback]['notify'](evt.data);
          }
          else{
            this.requestMap[callback].resolve(evt.data);
            delete this.requestMap[callback];
          }
        }
        else{
          //This is a server push emit the data with responseType as event
        }

      }
      catch(message){
        console.log(message);
      }
    };

    this.websocket1.onopen = (evt:MessageEvent) => {
      this.lastConnectTimeout = 5000;
      this.flushRequests();
      /* this.websocket1.onclose = (evt:CloseEvent) =>{
       this.flushRequests();
       }*/
    };

    this.websocket1.onclose = (evt:MessageEvent) => {
      console.log('Websocket connection closed',evt);
    };

    this.websocket1.onerror = (evt:MessageEvent) => {
      console.log('Error occured on websocket connection',evt);
    };
  };
};


export class DataService{

  private subscriptionProgressCreated:boolean = false;

  private static _instance:DataService = null;

  private SOCKET_CALLBACK_ID:number  = 1;

  private socket:Socket;



  constructor(){
    if(DataService._instance){
      throw new Error("Error: Instantiation failed: Use DataService.getInstance() instead of new.");
    }

    this.socket = new Socket();

    DataService._instance = this;

    if(!isNode){
      window.addEventListener("beforeunload",()=>{
        console.log('Before unload closing the socket');
        this.socket.close();
        return;
      });
    }
  }

  public static getInstance():DataService
  {
    if(DataService._instance === null) {
      DataService._instance = new DataService();
    }
    return DataService._instance;
  }


  private getNewCallbackId():string{
    return "D"+(this.SOCKET_CALLBACK_ID++).toString();
  }

  private addHeader(messageType:string,handler:string){
    var messageHeader = new Header();
    messageHeader['messageType'] = messageType;
    messageHeader['handler'] = handler;
    messageHeader['callBackId'] = this.getNewCallbackId();
    return messageHeader;
  }
  getChartData(chartRequestData:ChartRequestData):Q.Promise<ChartResponseData>{
    var deferred = Q.defer<ChartResponseData>();



    var chartRequest  = new ChartRequest();
    chartRequest['header'] = this.addHeader('ChartRequest', "/chart/data");;
    chartRequest['chReqData'] = chartRequestData;

    this.socket.processRequest(chartRequest,false).then(function(data:any){
      var responseHeader = HeaderReader.decode(data);
      var res = ChartResponse.decode(data);
      var response = JSON.parse(JSON.stringify(res))['chResData'];
      deferred.resolve(response);;
    });

    return deferred['promise'];
  }

  getAvailableScrips(scripsRequest:AvailableScripsRequestData):Q.Promise<AvailableScripsResponseData>{
    var deferred = Q.defer<AvailableScripsResponseData>();

    var availableScripsRequest  = new AvailableScripsRequest();
    availableScripsRequest['header'] = this.addHeader("AvailableScripsRequest","/availableScrips");
    availableScripsRequest['reqData'] = scripsRequest;

    this.socket.processRequest(availableScripsRequest,false).then(function(data:any){
      var res = AvailableScripsResponse.decode(data);
      deferred.resolve(res['resData']);;
    });

    return deferred['promise'];
  }

  subscribeForScrips(subscriptionRequest:QuoteSubscriptionRequestData,callBack?:(topic:any,data:any)=>any):string{

    var topic = subscriptionRequest.exchange+"_"+subscriptionRequest.scrip;

    var topicSubScriptionId = PubSub.getInstance().subscribe(topic,callBack);

    var availableScripsRequest  = new QuoteSubscriptionRequest();

    var header = this.addHeader("QuoteSubscriptionRequest", "/marketWatch/subscribe");
    header.callBackId = "quoteSubscription";
    availableScripsRequest['header'] = header;
    availableScripsRequest['reqData'] = subscriptionRequest;

    var promise = this.socket.subscribeEvents(availableScripsRequest,false);

    if(!this.subscriptionProgressCreated){
      promise.progress(function(data:QuoteSubscriptionResponse){
        var res:any = QuoteSubscriptionResponse.decode(data).resData.toRaw();
        var topic = res.exchange+"_"+res.scrip;;
        PubSub.getInstance().publish(topic,res);
      });
    }
    return topicSubScriptionId;
  }

  unSubscribeForScrips(subscriptionRequest:QuoteSubscriptionRequestData,subscriptionId:string):boolean{

    var topic = subscriptionRequest.exchange+"_"+subscriptionRequest.scrip;

    var status = PubSub.getInstance().unsubscribe(subscriptionId);

    var availableScripsRequest  = new QuoteSubscriptionRequest();

    var header = this.addHeader("QuoteSubscriptionRequest", "/marketWatch/subscribe");
    header.callBackId = "quoteSubscription";
    availableScripsRequest['header'] = header;
    availableScripsRequest['reqData'] = subscriptionRequest;

    var promise = this.socket.subscribeEvents(availableScripsRequest,false);

    return status;
  }
}

