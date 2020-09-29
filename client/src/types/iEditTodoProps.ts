import Auth from '../auth/Auth';

export interface iEditTodoProps {
  match: {
    params: {
      todoId: string;
    };
  };
  auth: Auth;
}
