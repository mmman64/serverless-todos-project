import { iTodo } from './iTodo';

export interface iTodosState {
  todos: iTodo[];
  newTodoName: string;
  loadingTodos: boolean;
}
