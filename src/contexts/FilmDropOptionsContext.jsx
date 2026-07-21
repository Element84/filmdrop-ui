import { createContext, useContext } from 'react'

export const FilmDropOptionsContext = createContext({
  config: undefined,
  urlState: undefined,
  onUrlStateChange: undefined
})

export function useFilmDropOptions() {
  return useContext(FilmDropOptionsContext)
}
