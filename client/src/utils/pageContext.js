// Tên trang + breadcrumb hiển thị ở khu vực bên trái của header (desktop).
// Trả về { crumbs: [{ label, to }], title }:
//  - crumbs: các cấp cha (có link), rỗng nếu là trang cấp 1
//  - title: tên trang hiện tại
export function getPageContext(pathname) {
  if (pathname === '/') return { crumbs: [], title: 'Khám phá cộng đồng' }
  if (pathname === '/questions') return { crumbs: [], title: 'Câu hỏi' }
  if (pathname === '/ask') return { crumbs: [{ label: 'Câu hỏi', to: '/questions' }], title: 'Đặt câu hỏi' }
  if (pathname === '/categories') return { crumbs: [], title: 'Danh mục' }
  if (pathname === '/leaderboard') return { crumbs: [], title: 'Bảng xếp hạng' }
  if (pathname === '/search') return { crumbs: [], title: 'Tìm kiếm' }
  if (pathname === '/notifications') return { crumbs: [], title: 'Thông báo' }
  if (pathname === '/security') return { crumbs: [], title: 'Bảo mật tài khoản' }
  if (pathname.startsWith('/admin')) return { crumbs: [], title: 'Quản trị' }

  // /questions/:id và /questions/:id/edit
  const questionMatch = pathname.match(/^\/questions\/(\d+)(\/edit)?$/)
  if (questionMatch) {
    const [, id, isEdit] = questionMatch
    if (isEdit) {
      return {
        crumbs: [
          { label: 'Câu hỏi', to: '/questions' },
          { label: `#${id}`, to: `/questions/${id}` },
        ],
        title: 'Chỉnh sửa',
      }
    }
    return { crumbs: [{ label: 'Câu hỏi', to: '/questions' }], title: `Câu hỏi #${id}` }
  }

  // /users/:id và /users/:id/edit
  const userMatch = pathname.match(/^\/users\/(\d+)(\/edit)?$/)
  if (userMatch) {
    const [, id, isEdit] = userMatch
    if (isEdit) {
      return { crumbs: [{ label: 'Hồ sơ', to: `/users/${id}` }], title: 'Chỉnh sửa hồ sơ' }
    }
    return { crumbs: [], title: 'Hồ sơ thành viên' }
  }

  return { crumbs: [], title: 'AskHub' }
}
