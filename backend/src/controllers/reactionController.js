import { placeholder } from '../utils/placeholder.js'
import Topic from '../models/Topic.js'
import { addPointsForTopicLike, addPointsForSubmissionLike, addPointsForCommentLike, removePointsForCommentLikeCancellation, removePointsForSubmissionLikeCancellation, removePointsForTopicLikeCancellation } from '../services/rankService.js'
import { incLikesReceived, decLikesReceived, addLikedItem, removeLikedItem } from '../services/profileService.js'

export async function like(req, res) {
    const userId = String(req.user._id)
    const { topicId, submissionId, commentId, subCommentId } = req.body || {}

    if (!topicId) 
        return res.status(400).json({ error: 'Thiếu thông tin chủ đề' })

    const topic = await Topic.findById(topicId)
    if (!topic) return res.status(404).json({ error: 'Chủ đề không tồn tại' })
    if (submissionId) {
        const submission = topic.submissions.id(submissionId)
        if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })
        if (commentId) {
            const comment = submission.comments.id(commentId)
            if (!comment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
            if (subCommentId) {
                const subComment = comment.subComments.id(subCommentId)
                if (!subComment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
                if (subComment.reactions.like.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã thích bình luận này' })
                }
                subComment.reactions.like.push(userId)
                // Remove dislike if exists
                subComment.reactions.dislike = subComment.reactions.dislike.filter(id => String(id) !== userId)
                await addPointsForCommentLike({ commentOwnerId: subComment.ownerId, actorId: userId })
                incLikesReceived(subComment.ownerId)
                await addLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
            } else {
                if (comment.reactions.like.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã thích bình luận này' })
                }
                comment.reactions.like.push(userId)
                // Remove dislike if exists
                comment.reactions.dislike = comment.reactions.dislike.filter(id => String(id) !== userId)
                await addPointsForCommentLike({ commentOwnerId: comment.ownerId, actorId: userId })
                incLikesReceived(comment.ownerId)
                await addLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
            }
        } else {
            if (submission.reactions.like.includes(userId)) {
                return res.status(400).json({ error: 'Bạn đã thích bài nộp này' })
            }
            submission.reactions.like.push(userId)
            // Remove dislike if exists
            submission.reactions.dislike = submission.reactions.dislike.filter(id => String(id) !== userId)
            await addPointsForSubmissionLike({ submissionOwnerId: submission.ownerId, actorId: userId })
            incLikesReceived(submission.ownerId)
            await addLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
        }
    } else {
        if (topic.reactions.like.includes(userId)) {
            return res.status(400).json({ error: 'Bạn đã thích chủ đề này' })
        }
        topic.reactions.like.push(userId)
        // Remove dislike if exists
        topic.reactions.dislike = topic.reactions.dislike.filter(id => String(id) !== userId)
        await addPointsForTopicLike({ topicOwnerId: topic.ownerId, actorId: userId })
        incLikesReceived(topic.ownerId)
        await addLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
    }

    await topic.save()
    res.json({ ok: true })
}

export async function dislike(req, res) {
    const userId = String(req.user._id)
    const { topicId, submissionId, commentId, subCommentId } = req.body || {}

    if (!topicId)
        return res.status(400).json({ error: 'Thiếu thông tin chủ đề' })

    const topic = await Topic.findById(topicId)
    if (!topic) return res.status(404).json({ error: 'Chủ đề không tồn tại' })
    if (submissionId) {
        const submission = topic.submissions.id(submissionId)
        if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })
        if (commentId) {
            const comment = submission.comments.id(commentId)
            if (!comment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
            if (subCommentId) {
                const subComment = comment.subComments.id(subCommentId)
                if (!subComment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
                if (subComment.reactions.dislike.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã không thích bình luận này' })
                }
                subComment.reactions.dislike.push(userId)
                // Remove like if exists
                if (subComment.reactions.like.includes(userId)) {
                    subComment.reactions.like = subComment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: subComment.ownerId, actorId: userId })
                    await decLikesReceived(subComment.ownerId)
                    await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
                }
            } else {
                if (comment.reactions.dislike.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã không thích bình luận này' })
                }
                comment.reactions.dislike.push(userId)
                // Remove like if exists
                if (comment.reactions.like.includes(userId)) {
                    comment.reactions.like = comment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: comment.ownerId, actorId: userId })
                    await decLikesReceived(comment.ownerId)
                    await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
                }
            }
        } else {
            if (submission.reactions.dislike.includes(userId)) {
                return res.status(400).json({ error: 'Bạn đã không thích bài nộp này' })
            }
            submission.reactions.dislike.push(userId)
            // Remove like if exists
            submission.reactions.like = submission.reactions.like.filter(id => String(id) !== userId)
            await removePointsForSubmissionLikeCancellation({ submissionOwnerId: submission.ownerId, actorId: userId })
            await decLikesReceived(submission.ownerId)
            await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
        }
    } else {
        if (topic.reactions.dislike.includes(userId)) {
            return res.status(400).json({ error: 'Bạn đã không thích chủ đề này' })
        }
        topic.reactions.dislike.push(userId)
        // Remove like if exists
        if (topic.reactions.like.includes(userId)) {
            topic.reactions.like = topic.reactions.like.filter(id => String(id) !== userId)
            await removePointsForTopicLikeCancellation({ topicOwnerId: topic.ownerId, actorId: userId })
            await decLikesReceived(topic.ownerId)
            await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
        }
    }

    await topic.save()
    res.json({ ok: true })
}

export async function cancelReaction(req, res) {
    const userId = String(req.user._id)
    const { topicId, submissionId, commentId, subCommentId } = req.body || {}

    if (!topicId)
        return res.status(400).json({ error: 'Thiếu thông tin chủ đề' })

    const topic = await Topic.findById(topicId)
    if (!topic) return res.status(404).json({ error: 'Chủ đề không tồn tại' })
    if (submissionId) {
        const submission = topic.submissions.id(submissionId)
        if (!submission) return res.status(404).json({ error: 'Bài nộp không tồn tại' })
        if (commentId) {
            const comment = submission.comments.id(commentId)
            if (!comment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
            if (subCommentId) {
                const subComment = comment.subComments.id(subCommentId)
                if (!subComment) return res.status(404).json({ error: 'Bình luận không tồn tại' })
                if (subComment.reactions.like.includes(userId)) {
                    subComment.reactions.like = subComment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: subComment.ownerId, actorId: userId })
                    await decLikesReceived(subComment.ownerId)
                    await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
                } else if (subComment.reactions.dislike.includes(userId)) {
                    subComment.reactions.dislike = subComment.reactions.dislike.filter(id => String(id) !== userId)
                } else {
                    return res.status(400).json({ error: 'Bạn chưa phản ứng với bình luận này' })
                }
            } else {
                if (comment.reactions.like.includes(userId)) {
                    comment.reactions.like = comment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: comment.ownerId, actorId: userId })
                    await decLikesReceived(comment.ownerId)
                    await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
                } else if (comment.reactions.dislike.includes(userId)) {
                    comment.reactions.dislike = comment.reactions.dislike.filter(id => String(id) !== userId)
                } else {
                    return res.status(400).json({ error: 'Bạn chưa phản ứng với bình luận này' })
                }
            }
        } else {
            if (submission.reactions.like.includes(userId)) {
                submission.reactions.like = submission.reactions.like.filter(id => String(id) !== userId)
                await removePointsForSubmissionLikeCancellation({ submissionOwnerId: submission.ownerId, actorId: userId })
                await decLikesReceived(submission.ownerId)
                await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
            } else if (submission.reactions.dislike.includes(userId)) {
                submission.reactions.dislike = submission.reactions.dislike.filter(id => String(id) !== userId)
            } else {
                return res.status(400).json({ error: 'Bạn chưa phản ứng với bài nộp này' })
            }   
        }
    } else {
        if (topic.reactions.like.includes(userId)) {
            topic.reactions.like = topic.reactions.like.filter(id => String(id) !== userId)
            await removePointsForTopicLikeCancellation({ topicOwnerId: topic.ownerId, actorId: userId })
            await decLikesReceived(topic.ownerId)
            await removeLikedItem(userId, { topicId, submissionId, commentId, subCommentId })
        } else if (topic.reactions.dislike.includes(userId)) {
            topic.reactions.dislike = topic.reactions.dislike.filter(id => String(id) !== userId)
        } else {
            return res.status(400).json({ error: 'Bạn chưa phản ứng với chủ đề này' })
        }
    }

    await topic.save()
    res.json({ ok: true })
}

