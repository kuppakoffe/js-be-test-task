import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';

import { Session, MediaDetail, MediaContext, Media, SessionDetail } from './interfaces'


axios.defaults.adapter = httpAdapter;

const SESSION_UUID = '90d61876-b99a-443e-994c-ba882c8558b6';

const getResponse = (code, data) => {
  const random = Math.floor(Math.random() * 10) + 1;
  if (random > 8) {
    return [500, 'There is something wrong with the service'];
  }

  return [code, data];
}

const findMatch = (haystack, needle = SESSION_UUID) => {
  return haystack.indexOf(needle) !== -1;
}

/**
 * 
 * @param sessionId : String  - a uuid format session id.
 * @returns Session.
 */
export const getSessionDetails = async (sessionId: string) => {
  const url = `https://api.veriff.internal/sessions/${sessionId}`
  return await (await axios.get<Session>(url)).data
}


/**
 * 
 * @param sessionId : String - a uuid format session id.
 * @returns MediaDetails.
 */
export const getMediaDetails = async (sessionId: string) => {
  const url = `https://api.veriff.internal/sessions/${sessionId}/media`
  const response = await (await axios.get<MediaDetail[]>(url))
    .data
  return response
}


/**
 * 
 * @param sessionId : String - a uuid format session id.
 * @returns MediaContext
 */
export const getMediaContextDetails = async (sessionId: string) => {
  const url = `https://api.veriff.internal/media-context/${sessionId}`
  const response = await (await axios.get<MediaContext[]>(url))
    .data
    .filter(data => data.context !== "none")
  response.forEach(res=>{
    if (res.context==='back') {
      res.context = 'document-back'
    }
    if (res.context==='front') {
      res.context='document-front'
    }
  })
  return response
}


/**
 * 
 * @param sessionId : String - a uuid format session id.
 * Combines response of getMediaDetails method to get list of all relevent media with the response
 * of getMediaContextDetails tp build the final response object.
 * Since, things were not cleared in the question, an assumption has been made for probability value
 * to figure out if the media belongs to document-front or document-back.
 * @returns SessionDetails.
 */
export const getSessionWithMedia = async (sessionId: string) => {
  try {
    const sessionResponse = await getSessionDetails(sessionId);
    
    let { id, status } = sessionResponse;
    if (status === 'internal_manual_review') {
      status = 'submitted';
      const mediaDetailsResponse = await getMediaDetails(sessionId)
      const mediaContextResponse = await getMediaContextDetails(sessionId)
      let media: Media = { 'document-back': [], 'document-front': [] };
      let mediaContextMap: Object = {};

      mediaContextResponse.forEach(res => {
        mediaContextMap[res.mediaId] = { context: res.context, probability: res.probability }
      })

      mediaDetailsResponse.forEach(res => {
        if (res.id in mediaContextMap) {
          if (res.context === mediaContextMap[res.id].context) {
            media[res.context].push(res)
          } else {
            if (mediaContextMap[res.id].probability > 0.5) {
              res.context = mediaContextMap[res.id].context
              media[mediaContextMap[res.id].context].push(res)
            } else {

              media[res.context].push(res)
            }
          }
        }

      })

      // sorting based on probability
      media['document-front'].sort((docA, docB) => mediaContextMap[docA.id].probability > mediaContextMap[docB.id].probability ? -1 : 1)
      media['document-back'].sort((docA, docB) => mediaContextMap[docA.id].probability > mediaContextMap[docB.id].probability ? -1 : 1)
      let sessionResponse: SessionDetail = { id, status, media };

      return sessionResponse
    } 

  } catch (err: any) {
    throw err // throw error here , since we are handling it in the api response
    
  }

}

nock('https://api.veriff.internal')
  .persist()
  .get(/\/sessions\/[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  .reply((uri) => {
    if (!findMatch(uri)) {
      return getResponse(
        404,
        'Resource not found'
      );
    }

    return getResponse(
      200,
      {
        id: '90d61876-b99a-443e-994c-ba882c8558b6',
        status: 'internal_manual_review',
      }
    );
  });

nock('https://api.veriff.internal')
  .persist()
  .get(/\/sessions\/[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\/media/i)
  .delay(1000)
  .reply((uri) =>
    getResponse(
      200,
      findMatch(uri) ? [
        {
          id: '7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662',
          mimeType: 'image/png',
          context: 'document-front'
        },
        {
          id: '663ae1db-32b6-4a4e-a828-98e3e94ca11e',
          mimeType: 'image/png',
          context: 'document-back'
        },
        {
          id: '40f1e462-6db8-4313-ace3-83e4f5619c56',
          mimeType: 'image/png',
          context: 'document-back'
        },
        {
          id: 'a6c90b4f-ddfc-49eb-89ad-05b7f1274f96',
          mimeType: 'image/png',
          context: 'document-front'
        },
        {
          id: '40851916-3e86-45cd-b8ce-0e948a8a7751',
          mimeType: 'image/png',
          context: 'document-front'
        }
      ] : []
    )
  );

nock('https://api.veriff.internal')
  .persist()
  .get(/\/media-context\/[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
  .delay(1000)
  .reply((uri) =>
    getResponse(
      200,
      findMatch(uri) ? [
        {
          id: 'a4338068-d99b-416b-9b2d-ee8eae906eea',
          mediaId: 'a6c90b4f-ddfc-49eb-89ad-05b7f1274f96',
          context: 'back',
          probability: 0.9739324
        },
        {
          id: '93d1a76b-b133-41cc-ae85-aa8b80d93f57',
          mediaId: '40f1e462-6db8-4313-ace3-83e4f5619c56',
          context: 'front',
          probability: 0.2931033
        },
        {
          id: '2277b909-f74e-4dc0-b152-328713948ec5',
          mediaId: '663ae1db-32b6-4a4e-a828-98e3e94ca11e',
          context: 'none',
          probability: 0.9253487
        },
        {
          id: '2277b909-f74e-4dc0-b152-328713948ec5',
          mediaId: '7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662',
          context: 'front',
          probability: 0.8734357
        },
        {
          id: '2277b909-f74e-4dc0-b152-328713948ec5',
          mediaId: '40851916-3e86-45cd-b8ce-0e948a8a7751',
          context: 'front',
          probability: 0.9264236
        }
      ] : []
    )
  );


