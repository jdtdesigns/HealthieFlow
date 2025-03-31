import { Task } from './Task';

export interface Column {
  column_title: string;
  tasks: Task[]
}