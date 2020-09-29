// Fields in a request to update a single TODO item.
export interface iUpdateTodoRequest {
  name: string;
  dueDate: string;
  done: boolean;
}
