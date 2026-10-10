import { useContext } from 'react'
import { ConfirmContext } from '../context/ConfirmContext'

// Trả về hàm confirm({ title, message, danger }) => Promise<boolean>
export function useConfirm() {
  return useContext(ConfirmContext)
}
