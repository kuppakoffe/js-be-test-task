export interface Media {
    'document-front': Array<MediaDetail>;
    'document-back': Array<MediaDetail>;

}

export interface Session {
    id: string;
    status: string;
}

export interface MediaDetail {
    id: string;
    mimeType: string;
    context: string;
}


export interface MediaContext {
    id: string;
    mediaId: string;
    context: string;
    probability: Number;
}



export interface SessionDetail extends Session {
    media: Media;
}




