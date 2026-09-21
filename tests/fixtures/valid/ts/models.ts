export interface User {
  age: number;
  id: string;
  name: string;
}

export interface ApiResult<T> {
  data: T;
  success: boolean;
}
