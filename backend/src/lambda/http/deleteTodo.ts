import 'source-map-support/register';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { deleteTodo } from '../../businessLogic/todos';
import { checkIfTodoExists } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';
import { handleInvalidTodoRequest } from '../utils';

const logger = createLogger('deleteTodo');

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`);

  const todoExists = await checkIfTodoExists(
    event.headers,
    event.pathParameters.todoId
  );

  if (!todoExists) {
    logger.error('Failed to delete non-existing todo item!');
    return handleInvalidTodoRequest();
  }

  await deleteTodo(event.headers, event.pathParameters.todoId);

  logger.info('Todo successfully deleted!');

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };
};
