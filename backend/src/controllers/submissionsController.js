import { placeholder } from '../utils/placeholder.js'

export function listSubmissions(req, res) {
  res.json(placeholder({ items: [] }))
}

export function createSubmission(req, res) {
  res.json(placeholder({ message: 'create submission placeholder' }))
}

export function getSubmission(req, res) {
  res.json(placeholder({ id: req.params.id }))
}
