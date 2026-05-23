import { placeholder } from '../utils/placeholder.js'

export function listComments(req, res) {
  res.json(placeholder({ items: [] }))
}

export function createComment(req, res) {
  res.json(placeholder({ message: 'create comment placeholder' }))
}
