import { openDB } from 'idb'
import dayjs from 'dayjs'

import { Task } from '../pages/types/Task'
import { Board } from '../pages/types/Board'

export class DB {
  static async getDB() {
    const db = await openDB('fittask_db', 1, {
      async upgrade(db) {
        await db.createObjectStore('boards', { keyPath: 'id', autoIncrement: true })
        const task_store = await db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true })

        await task_store.createIndex('board_id', 'board_id')
        await task_store.createIndex('status', 'status')
        await task_store.createIndex('board_status', ['board_id', 'status'])

        console.log('Stores created!')
      }
    })

    return db
  }

  static async getAllBoards() {
    const db = await this.getDB()

    const boards = await db.getAll('boards')

    return boards
  }

  static async getBoardById(board_id: number) {
    const db = await this.getDB()

    const board = await db.get('boards', board_id)

    const tasks = await Promise.all([1, 2, 3].map(async (status) => {
      const task_data = await db.getAllFromIndex('tasks', 'board_status', [board_id, status])
      return task_data.sort((a, b) => a.order - b.order)
    }))


    return { board, tasks }
  }

  static async createBoard(data: Board) {
    const db = await this.getDB()

    const board_id = await db.add('boards', {
      ...data,
      taskCount: 0,
      column_names: ['Todo', 'Doing', 'Done']
    })

    return board_id
  }

  static async updateBoardColumnNames(updated_board: Board) {
    const db = await this.getDB()

    await db.put('boards', updated_board)
  }

  static async addTask(board_id: number, data: Task) {
    const db = await this.getDB()

    const board = await db.get('boards', board_id)
    board.taskCount = board.taskCount + 1
    await db.put('boards', board)

    const boardTasks = await db.getAllFromIndex('tasks', 'board_id', board_id)

    const task_id = await db.add('tasks', {
      ...data,
      board_id,
      status: data.status,
      order: boardTasks.length - 1,
      createdOn: dayjs().format('MM-DD-YYYY')
    })

    return await db.get('tasks', task_id)
  }

  // static async getTasksByBoardId() {

  // }

  static async getTaskById(id: number) {
    const db = await this.getDB()

    const task = await db.get('tasks', id);

    return task
  }


  static async updateTaskStatus(task_id: number, new_status: number) {
    const db = await this.getDB()

    const task = await this.getTaskById(task_id)
    task.status = new_status

    await db.put('tasks', task)
  }

  static async updateTaskOrder(task_id: number, new_order: number) {
    const db = await this.getDB()

    const task = await this.getTaskById(task_id)
    task.order = new_order

    await db.put('tasks', task)
  }

  static async deleteTask(taskId: number) {
    const db = await this.getDB()

    await db.delete('tasks', taskId)

    console.log('Task deleted!')
  }
}





// static async getAllTasks() {
//   const db = await this.getDB()

//   const tasks: Task[] = await db.getAll('tasks')

//   return tasks
// }

// static async getTasksByStatus(status: number) {
//   const db = await this.getDB()

//   const tasks = await db.getAllFromIndex('tasks', 'status', status)

//   return tasks
// }