import api from './api'

export function register(data) {
  return api.post('/auth/register', data).then((res) => res.data)
}

export function login(data) {
  return api.post('/auth/login', data).then((res) => res.data)
}

export function getMe() {
  return api.get('/auth/me').then((res) => res.data)
}
