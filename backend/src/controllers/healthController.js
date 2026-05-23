import { placeholder } from '../utils/placeholder.js'

export function getHealth(req, res) {
  res.json(placeholder({ status: 'ok' }))
}
