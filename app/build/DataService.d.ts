/// <reference path="../app/src/q/Q.d.ts" />
/// <reference path="../app/src/protobufjs/protobufjs.d.ts" />
/// <reference path="../app/src/StockMessages.d.ts" />
export declare class DataService {
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
