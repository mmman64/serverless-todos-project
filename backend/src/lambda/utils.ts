import { parseUserId } from '../auth/utils';

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(headers: any): string {
  const jwtToken = headers.Authorization.split(' ')[1];
  return parseUserId(jwtToken);
}

export function handleInvalidTodoRequest() {
  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: 'Todo does not exist',
    }),
  };
}
