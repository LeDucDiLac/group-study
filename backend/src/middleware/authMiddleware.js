export function authMiddleware(req, res, next) {
  req.user = {
    id: '6a11ab4fbf3515a3b375c938',
    rank: 200,
  }
  next()
}
