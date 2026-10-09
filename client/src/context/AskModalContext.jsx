import { createContext, useState } from 'react'

export const AskModalContext = createContext(null)

// State toàn app cho modal "Đặt câu hỏi" - mở được từ bất kỳ đâu (Navbar, empty state...)
export function AskModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = {
    isOpen,
    openAskModal: () => setIsOpen(true),
    closeAskModal: () => setIsOpen(false),
  }

  return <AskModalContext.Provider value={value}>{children}</AskModalContext.Provider>
}
