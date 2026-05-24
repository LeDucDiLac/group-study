import mongoose from 'mongoose'
import { placeholder } from '../utils/placeholder.js'
import Topic from '../models/Topic.js'

export function listTopics(req, res) {
  res.json(placeholder({ items: [] }))
}

export function createTopic(req, res) {
  res.json(placeholder({ message: 'create topic placeholder' }))
}

export async function getTopic(req, res, next) {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid topic id' })
  }

  try {
    const topic = await Topic.findById(id)
      .select(
        'title description category tags status windowHours createdBy resources createdAt updatedAt'
      )
      .lean()

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    return res.json(topic)
  } catch (error) {
    return next(error)
  }
}

export function updateTopic(req, res) {
  res.json(placeholder({ message: 'update topic placeholder', id: req.params.id }))
}

export function approveTopic(req, res) {
  res.json(placeholder({ message: 'approve topic placeholder', id: req.params.id }))
}
