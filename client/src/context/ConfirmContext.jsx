import { createContext, useCallback, useRef, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'

export const ConfirmContext = createContext(null)

// Hộp thoại xác nhận dùng chung thay cho window.confirm().
// Dùng: const confirm = useConfirm(); if (!(await confirm({ title, message, danger }))) return
export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null)
  const resolveRef = useRef(null)

  const confirm = useCallback((opts) => {
    const normalized = typeof opts === 'string' ? { message: opts } : opts
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setOptions(normalized)
    })
  }, [])

  function answer(result) {
    setOptions(null)
    resolveRef.current?.(result)
    resolveRef.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmDialog
          title={options.title || 'Xác nhận'}
          message={options.message}
          danger={options.danger}
          confirmLabel={options.confirmLabel || (options.danger ? 'Xóa' : 'Xác nhận')}
          onConfirm={() => answer(true)}
          onCancel={() => answer(false)}
        />
      )}
    </ConfirmContext.Provider>
  )
}
