import { placeholder } from '../utils/placeholder.js'

export function listTopics(req, res) {
  res.json(placeholder({ items: [] }))
}

export function createTopic(req, res) {
  res.json(placeholder({ message: 'create topic placeholder' }))
}

export function getTopic(req, res) {
  res.json(placeholder({ id: req.params.id }))
}

export function updateTopic(req, res) {
  res.json(placeholder({ message: 'update topic placeholder', id: req.params.id }))
}

export function approveTopic(req, res) {
  res.json(placeholder({ message: 'approve topic placeholder', id: req.params.id }))
}
