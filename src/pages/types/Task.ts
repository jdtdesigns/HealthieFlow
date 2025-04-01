import { Character } from './Character';

export interface Task {
  id?: number;
  title: string;
  character: Character;
  status: number;
  order?: number;
  group_id?: number;
  createdOn?: string;
  task_index?: number;
  column_index?: number;
}