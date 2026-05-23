import { placeholder } from '../utils/placeholder.js'

export function getRank(req, res) {
  res.json(placeholder({ rank: null, points: 0 }))
}
