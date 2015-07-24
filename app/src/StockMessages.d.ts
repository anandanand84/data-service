// Generated with protoc-gen-ts.  DO NOT EDIT!

interface Header {
    messageType: string;
    callBackId: string;
    handler: string;
}

interface HeaderReader {
    header: Header;
}

interface ChartResponseData {
    registrationId: string;
    scrip: string;
    /** TYPE_INT32 */
    interval?: number;
    /** TYPE_UINT32 */
    timestamp: Array<number>;
    /** TYPE_DOUBLE */
    open: Array<number>;
    /** TYPE_DOUBLE */
    high: Array<number>;
    /** TYPE_DOUBLE */
    low: Array<number>;
    /** TYPE_DOUBLE */
    close: Array<number>;
    /** TYPE_UINT32 */
    volume: Array<number>;
}

interface ChartRequestData {
    registrationId: string;
    scrip: string;
    /** TYPE_INT32 */
    interval: number;
    /** TYPE_INT32 */
    requiredBars: number;
    /** TYPE_UINT32 */
    startTime?: number;
}

interface ChartRequest {
    header: Header;
    chReqData?: ChartRequestData;
}

interface ChartResponse {
    header: Header;
    chResData?: ChartResponseData;
}

interface AvailableScripsRequestData {
    scrip?: string;
    /** TYPE_INT32 */
    from?: number;
    /** TYPE_INT32 */
    limitResultsTo?: number;
}

interface AvailableScripsResponseData {
    scrip: string;
    type: string;
    /** TYPE_DOUBLE */
    ltp?: number;
    company: string;
    /** TYPE_UINT32 */
    volume?: number;
    exchange?: string;
}

interface AvailableScripsRequest {
    header: Header;
    reqData?: AvailableScripsRequestData;
}

interface AvailableScripsResponse {
    header: Header;
    resData: Array<AvailableScripsResponseData>;
}

interface QuoteSubscriptionRequestData {
    scrip: string;
    exchange: string;
    subscribe: boolean;
}

interface QuoteSubscriptionResponseData {
    scrip: string;
    exchange: string;
    /** TYPE_DOUBLE */
    ltp: number;
    /** TYPE_UINT32 */
    ltt: number;
    /** TYPE_UINT32 */
    volume: number;
    /** TYPE_DOUBLE */
    percentChange?: number;
    /** TYPE_DOUBLE */
    change?: number;
}

interface QuoteSubscriptionRequest {
    header: Header;
    reqData: QuoteSubscriptionRequestData;
}

interface QuoteSubscriptionResponse {
    header: Header;
    resData: QuoteSubscriptionResponseData;
}
