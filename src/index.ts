import express from 'express';
import middleWare from 'express-prometheus-middleware';
import  {getSessionDetails, getMediaDetails, getMediaContextDetails, getSessionWithMedia} from './externalService';

const app: express.Application = express();
const port: Number = 3000;



app.use(middleWare({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}))

app.get('/api/sessions/:sessionId', async (req: express.Request, res: express.Response) => {
  try {
    const {sessionId} = req.params
    const sessionDetails = await getSessionWithMedia(sessionId)
    return res.status(200).json(sessionDetails);
  } catch (error: any) {
    // console.error('Error happened', error);
    return res.status(error.response.status).json({ message: error.response.data });
  }
});





app.listen(port, () => {
  console.info(`Service is listening at http://localhost:${port}`);
});
