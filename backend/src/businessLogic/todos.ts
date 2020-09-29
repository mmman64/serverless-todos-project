import * as uuid from 'uuid';
import { iTodo } from '../types/iTodo';
import { TodoAccess } from '../dataLayer/todosAccess';
import { iCreateTodoRequest } from '../types/requestTypes/iCreateTodoRequest';
import { getUserId } from '../lambda/utils';
import { iUpdateTodoRequest } from '../types/requestTypes/iUpdateTodoRequest';

const todoAccess = new TodoAccess();

export async function getAllTodos(headers: any): Promise<iTodo[]> {
  const userId: string = getUserId(headers);
  return await todoAccess.getAllTodos(userId);
}

export async function createTodo(
  createTodoRequest: iCreateTodoRequest,
  headers: any
): Promise<iTodo> {
  const todoId: string = uuid.v4();
  const userId: string = getUserId(headers);

  return await todoAccess.createTodo({
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
  });
}

export async function updateTodo(
  headers: any,
  todoId: string,
  updatedTodo: iUpdateTodoRequest
): Promise<boolean> {
  const userId: string = getUserId(headers);
  return await todoAccess.updateTodo(todoId, userId, updatedTodo);
}

export async function deleteTodo(
  headers: any,
  todoId: string
): Promise<boolean> {
  const userId: string = getUserId(headers);
  return await todoAccess.deleteTodo(todoId, userId);
}

export async function checkIfTodoExists(
  headers: any,
  todoId: string
): Promise<boolean> {
  const userId: string = getUserId(headers);
  return await todoAccess.checkIfTodoExists(todoId, userId);
}

export async function generateUploadUrl(todoId: string): Promise<string> {
  return await todoAccess.generateUploadUrl(todoId);
}

export async function setAttachmentUrl(
  headers: any,
  todoId: string
): Promise<boolean> {
  const userId: string = getUserId(headers);
  return await todoAccess.setAttachmentUrl(todoId, userId);
}
