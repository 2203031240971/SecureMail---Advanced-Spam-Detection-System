import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'OAuth test function working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasAppleClientId: !!process.env.APPLE_CLIENT_ID,
        nodeEnv: process.env.NODE_ENV,
      }
    })
  };
};

export { handler };
