export interface Task {
  id?: number;
  title: string;
  body: string;
  status: number;
  group_id?: number;
  createdOn?: string;
  task_index?: number;
  column_index?: number;
}