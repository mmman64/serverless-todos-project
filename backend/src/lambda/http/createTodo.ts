import 'source-map-support/register';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { iCreateTodoRequest } from '../../types/requestTypes/iCreateTodoRequest';
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`);

  const newTodo: iCreateTodoRequest = JSON.parse(event.body);
  logger.info(`New todo: ${newTodo}`);

  const newItem = await createTodo(newTodo, event.headers);
  logger.info(`Created todo: ${newItem}`);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      newItem,
    }),
  };
};
