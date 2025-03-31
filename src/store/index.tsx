import { createContext, useContext, useState, useEffect } from 'react'
import { Board } from '../pages/types/Board'

import { DB } from '../db'
import { getColumnNames } from './helpers'

interface StoreState {
  boards: Board[];
  mode: string;
  showCreateBoardModal: boolean;
  showAddTaskModal: boolean;
  column_names: string[]
}

interface StoreContextData {
  state: StoreState;
  setState: React.Dispatch<React.SetStateAction<StoreState>>;
}

const StoreContext = createContext<StoreContextData | null>(null)

const initialState: StoreState = {
  boards: [],
  mode: 'dark',
  showCreateBoardModal: false,
  showAddTaskModal: false,
  column_names: getColumnNames()
}

export function StoreProvider({ children }: React.PropsWithChildren<{}>) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    DB.getAllBoards()
      .then(boards =>
        setState({
          ...state,
          boards: [...boards]
        })
      )
  }, []);

  return (
    <StoreContext.Provider value={{
      state,
      setState
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)