import 'source-map-support/register';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { updateTodo } from '../../businessLogic/todos';
import { checkIfTodoExists } from '../../businessLogic/todos';
import { iUpdateTodoRequest } from '../../types/requestTypes/iUpdateTodoRequest';
import { createLogger } from '../../utils/logger';
import { handleInvalidTodoRequest } from '../utils';

const logger = createLogger('updateTodo');

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: ${event}`);

  const todoExists = await checkIfTodoExists(
    event.headers,
    event.pathParameters.todoId
  );

  if (!todoExists) {
    logger.error('Failed to update non-existing todo item!');
    return handleInvalidTodoRequest();
  }

  const updatedTodo: iUpdateTodoRequest = JSON.parse(event.body);
  const updatedItem = await updateTodo(
    event.headers,
    event.pathParameters.todoId,
    updatedTodo
  );

  logger.info(`Updated todo: ${updatedItem}`);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };
};
