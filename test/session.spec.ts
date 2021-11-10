import axios from 'axios';

describe('GET http://localhost:3000/api/sessions/:sessionId', () => {


  it('should return session with media', async () => {
    const response = await axios.get('http://localhost:3000/api/sessions/90d61876-b99a-443e-994c-ba882c8558b6');
    expect(response.status).toEqual(200);
    expect(response.data).toMatchObject({
      id: '90d61876-b99a-443e-994c-ba882c8558b6',
      status: 'submitted',
      media: {
        'document-front': [
          {
            id: '40851916-3e86-45cd-b8ce-0e948a8a7751',
            mimeType: 'image/png',
            context: 'document-front'
          },
          {
            id: '7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662',
            mimeType: 'image/png',
            context: 'document-front'
          }
        ],
        'document-back': [
          {
            id: 'a6c90b4f-ddfc-49eb-89ad-05b7f1274f96',
            mimeType: 'image/png',
            context: 'document-back'
          },
          {
            id: '40f1e462-6db8-4313-ace3-83e4f5619c56',
            mimeType: 'image/png',
            context: 'document-back'
          }
        ]
      },
    });
  });





  
});
