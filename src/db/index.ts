import { openDB } from 'idb'
import dayjs from 'dayjs'

import { Task } from '../pages/types/Task'
import { Board } from '../pages/types/Board'

/* 
* A Tool class that provides easy to use methods to store and update the board/task data
*/
export class DB {
  static async getDB() {
    const db = await openDB('fittask_db', 1, {
      async upgrade(db) {
        await db.createObjectStore('boards', { keyPath: 'id', autoIncrement: true })
        const task_store = await db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true })

        // Create indexes for the board fields that are used for sorting and pulling
        await task_store.createIndex('board_id', 'board_id')
        await task_store.createIndex('status', 'status')
        await task_store.createIndex('board_status', ['board_id', 'status'])

        console.log('Stores created!')
      }
    })

    return db
  }

  /**
   * Retreives all the boards
   */
  static async getAllBoards() {
    const db = await this.getDB()

    const boards = await db.getAll('boards')

    return boards
  }

  /**
   * Gets a board by it's ID and also attaches the board's tasks
   */
  static async getBoardById(board_id: number) {
    const db = await this.getDB()

    const board = await db.get('boards', board_id)

    // Loop over board status types and sort tasks by their status and finally order them
    const tasks = await Promise.all([1, 2, 3].map(async (status) => {
      const task_data = await db.getAllFromIndex('tasks', 'board_status', [board_id, status])
      return task_data.sort((a, b) => a.order - b.order)
    }))


    return { board, tasks }
  }

  /**
   * Creates a board and sets the default column names
   */
  static async createBoard(data: Board) {
    const db = await this.getDB()

    const board_id = await db.add('boards', {
      ...data,
      taskCount: 0,
      column_names: ['Todo', 'Doing', 'Done']
    })

    return board_id
  }

  /**
   * Handles updating a board's column names
   * This is used by the sidebar menu in the UI
   */
  static async updateBoardColumnNames(updated_board: Board) {
    const db = await this.getDB()

    await db.put('boards', updated_board)
  }

  /**
   * Adds a task and sets the task's order by checking the amount of tasks stored to a baord
   */
  static async addTask(board_id: number, data: Task) {
    const db = await this.getDB()

    const board = await db.get('boards', board_id)
    board.taskCount = board.taskCount + 1
    await db.put('boards', board)

    // Get all tasks by their board id to determine the task order
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


  /**
   * Retreives a task by it's ID
   */
  static async getTaskById(id: number) {
    const db = await this.getDB()

    const task = await db.get('tasks', id);

    return task
  }

  /**
   * Updates a task's status - The status represents the column that the task will be placed in
   */
  static async updateTaskStatus(task_id: number, new_status: number) {
    const db = await this.getDB()

    const task = await this.getTaskById(task_id)
    task.status = new_status

    await db.put('tasks', task)
  }

  /**
   * Handles updating a task's order in the column
   */
  static async updateTaskOrder(task_id: number, new_order: number) {
    const db = await this.getDB()

    const task = await this.getTaskById(task_id)
    task.order = new_order

    await db.put('tasks', task)
  }
}