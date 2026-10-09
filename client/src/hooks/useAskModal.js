import { useContext } from 'react'
import { AskModalContext } from '../context/AskModalContext'

export function useAskModal() {
  return useContext(AskModalContext)
}
