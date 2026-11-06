import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import './Select.css'

// Ô chọn (combobox) tùy biến thay cho <select> mặc định của trình duyệt - danh sách xổ xuống
// của <select> không style được nên lệch hẳn giao diện. Dùng chung cho mọi form/bộ lọc.
//  - options: [{ value, label }]; value: chuỗi (khớp với option.value đã đổi sang chuỗi)
//  - onChange(value): nhận giá trị chuỗi mới (không phải event)
//  - Bàn phím: Enter/Space/↓ mở; ↑↓ di chuyển; Enter chọn; Esc đóng; gõ chữ cái nhảy tới mục khớp
//  - Danh sách vẽ qua portal (position: fixed) để không bị modal/card có overflow cắt mất
function Select({ id, value, onChange, options, placeholder = 'Chọn...', hasError = false, className = '', disabled = false, ariaLabel }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [position, setPosition] = useState(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const selectedIndex = options.findIndex((o) => String(o.value) === String(value))
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  function openList() {
    if (disabled) return
    const rect = buttonRef.current.getBoundingClientRect()
    const maxHeight = 340
    const spaceBelow = window.innerHeight - rect.bottom - 12
    const openUp = spaceBelow < Math.min(maxHeight, options.length * 38 + 12) && rect.top > spaceBelow
    setPosition({
      left: rect.left,
      width: rect.width,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 6, maxHeight: Math.min(maxHeight, rect.top - 12) }
        : { top: rect.bottom + 6, maxHeight: Math.min(maxHeight, spaceBelow) }),
    })
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  function closeList() {
    setOpen(false)
    buttonRef.current?.focus()
  }

  function choose(index) {
    const option = options[index]
    if (option) onChange(String(option.value))
    closeList()
  }

  // Đóng khi bấm ra ngoài / cuộn trang / đổi cỡ cửa sổ
  useEffect(() => {
    if (!open) return undefined
    function handlePointerDown(e) {
      if (buttonRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function handleDismiss(e) {
      if (listRef.current?.contains(e.target)) return // cuộn bên trong danh sách thì giữ nguyên
      setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('scroll', handleDismiss, true)
    window.addEventListener('resize', handleDismiss)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('scroll', handleDismiss, true)
      window.removeEventListener('resize', handleDismiss)
    }
  }, [open])

  // Cuộn mục đang active vào vùng nhìn thấy
  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function handleKeyDown(e) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      closeList()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(activeIndex)
    } else if (e.key === 'Tab') {
      setOpen(false)
    } else if (e.key.length === 1) {
      // Gõ chữ cái: nhảy tới mục đầu tiên bắt đầu bằng chữ đó
      const found = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (found >= 0) setActiveIndex(found)
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className={`select-trigger${open ? ' is-open' : ''}${hasError ? ' has-error' : ''}${className ? ` ${className}` : ''}`}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
      >
        <span className={`select-trigger-text${selected ? '' : ' is-placeholder'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="select-trigger-chevron" />
      </button>

      {open &&
        position &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className="select-list animate-scale-in"
            style={position}
          >
            {options.map((o, i) => {
              const isSelected = i === selectedIndex
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`select-option${i === activeIndex ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                >
                  <span>{o.label}</span>
                  {isSelected && <Check size={15} />}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </>
  )
}

export default Select
