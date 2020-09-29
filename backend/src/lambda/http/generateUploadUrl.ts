import 'source-map-support/register';
import { createLogger } from '../../utils/logger';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { generateUploadUrl, setAttachmentUrl } from '../../businessLogic/todos';

const logger = createLogger('generateUploadURL');

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`);

  const signedUrl: string = await generateUploadUrl(
    event.pathParameters.todoId
  );

  await setAttachmentUrl(event.headers, event.pathParameters.todoId);

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      uploadUrl: signedUrl,
    }),
  };
};
