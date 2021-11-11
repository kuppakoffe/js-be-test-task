/**
 * Media interface for 
 */
export interface Media {
    'document-front': Array<MediaDetail>;
    'document-back': Array<MediaDetail>;

}


/**
 * Session interface to be used for api response of /sessions/:sessionId
 */
export interface Session {
    id: string;
    status: string;
}



/**
 * MediaDetail interface to be used for api response of sessions/:sessionId/media
 */
export interface MediaDetail {
    id: string;
    mimeType: string;
    context: string;
}



/**
 * MediaContent interface to be used for api response of /media-context/:sessionId
 */
export interface MediaContext {
    id: string;
    mediaId: string;
    context: string;
    probability: Number;
}


/**
 * SessionDetails extending Session interface for inherting all required field,
 * to be used for api response of /api/sessions/:sessionId
 */
export interface SessionDetail extends Session {
    media: Media;
}




