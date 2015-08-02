/// <reference path="../app/src/q/Q.d.ts" />
/// <reference path="../app/src/protobufjs/protobufjs.d.ts" />
/// <reference path="../app/src/StockMessages.d.ts" />
declare class PubSub {
    private topics;
    private subUid;
    private static _instance;
    constructor();
    static getInstance(): PubSub;
    publish(topic: any, args: any): boolean;
    subscribe(topic: any, func: (topic: any, data: any) => any): string;
    unsubscribe(token: String): boolean;
}
declare var isNode: any;
declare var dcodeIO: any;
declare var StockMessages: any;
declare var Header: any;
declare var HeaderReader: any;
declare var BarDetails: any;
declare var ChartResponseData: any;
declare var ChartRequestData: any;
declare var ChartRequest: any;
declare var ChartResponse: any;
declare var AvailableScripsResponse: any;
declare var AvailableScripsRequest: any;
declare var AvailableScripsResponseData: any;
declare var AvailableScripsRequestData: any;
declare var QuoteSubscriptionRequest: any;
declare var QuoteSubscriptionRequestData: any;
declare var QuoteSubscriptionResponse: any;
declare var QuoteSubscriptionResponseData: any;
declare class Socket {
    private requestMap;
    private eventsMap;
    private wsUri1;
    private websocket1;
    private lastConnectTimeout;
    private pendingRequestArray;
    constructor(wsUri?: string);
    processRequest(request: any, immediateFail: boolean): Q.Promise<{}>;
    subscribeEvents(request: any, immediateFail: boolean): any;
    unSubscribeEvents(): void;
    close(reason?: string): void;
    private flushRequests;
    private sendMessage;
    private configureSocket;
}
declare class DataService {
    private subscriptionProgressCreated;
    private static _instance;
    private SOCKET_CALLBACK_ID;
    private socket;
    constructor();
    static getInstance(): DataService;
    private getNewCallbackId();
    private addHeader(messageType, handler);
    getChartData(chartRequestData: ChartRequestData): Q.Promise<ChartResponseData>;
    getAvailableScrips(scripsRequest: AvailableScripsRequestData): Q.Promise<AvailableScripsResponseData>;
    subscribeForScrips(subscriptionRequest: QuoteSubscriptionRequestData, callBack?: (topic: any, data: any) => any): string;
    unSubscribeForScrips(subscriptionRequest: QuoteSubscriptionRequestData, subscriptionId: string): boolean;
}
