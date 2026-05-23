import { placeholder } from '../utils/placeholder.js'

export function register(req, res) {
  res.json(placeholder({ message: 'register placeholder' }))
}

export function login(req, res) {
  res.json(placeholder({ message: 'login placeholder' }))
}
