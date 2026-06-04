import Topic from '../models/Topic.js'
import { addPointsForTopicLike, addPointsForSubmissionLike, addPointsForCommentLike, removePointsForCommentLikeCancellation, removePointsForSubmissionLikeCancellation, removePointsForTopicLikeCancellation } from '../services/rankService.js'
import { incLikesReceived, decLikesReceived, addLikedItem, removeLikedItem } from '../services/profileService.js'

export async function like(req, res) {
    const userId = String(req.user._id)
    const { id } = req.body || {}

    if (!id) return res.status(400).json({ error: 'Thiếu thông tin id' })

    const target = await Topic.findTargetById(id)
    if (!target) return res.status(404).json({ error: 'Không tìm thấy đối tượng' })
    const topic = await Topic.findById(target.topicId)
    if (target.submissionId != null) {
        const submission = topic.submissions.id(target.submissionId)
        if (target.commentId != null) {
            const comment = submission.comments.id(target.commentId)
            if (target.subCommentId != null) {
                const subComment = comment.subComments.id(target.subCommentId)
                if (subComment.reactions.like.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã thích bình luận này' })
                }
                subComment.reactions.like.push(userId)
                // Remove dislike if exists
                subComment.reactions.dislike = subComment.reactions.dislike.filter(id => String(id) !== userId)
                await addPointsForCommentLike({ commentOwnerId: subComment.userId, actorId: userId })
                incLikesReceived(subComment.userId)
                await addLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: comment._id, subCommentId: subComment._id })
            } else {
                if (comment.reactions.like.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã thích bình luận này' })
                }
                comment.reactions.like.push(userId)
                // Remove dislike if exists
                comment.reactions.dislike = comment.reactions.dislike.filter(id => String(id) !== userId)
                await addPointsForCommentLike({ commentOwnerId: comment.userId, actorId: userId })
                incLikesReceived(comment.userId)
                await addLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: comment._id, subCommentId: null })
            }
        } else {
            if (submission.reactions.like.includes(userId)) {
                return res.status(400).json({ error: 'Bạn đã thích bài nộp này' })
            }
            submission.reactions.like.push(userId)
            // Remove dislike if exists
            submission.reactions.dislike = submission.reactions.dislike.filter(id => String(id) !== userId)
            await addPointsForSubmissionLike({ submissionOwnerId: submission.userId, actorId: userId })
            incLikesReceived(submission.userId)
            await addLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: null, subCommentId: null })
        }
    } else {
        if (topic.reactions.like.includes(userId)) {
            return res.status(400).json({ error: 'Bạn đã thích chủ đề này' })
        }
        topic.reactions.like.push(userId)
        // Remove dislike if exists
        topic.reactions.dislike = topic.reactions.dislike.filter(id => String(id) !== userId)
        await addPointsForTopicLike({ topicOwnerId: topic.createdBy, actorId: userId })
        incLikesReceived(topic.userId)
        await addLikedItem(userId, { topicId: topic._id, submissionId: null, commentId: null, subCommentId: null })
    }

    await topic.save()
    res.json({ ok: true })
}

export async function dislike(req, res) {
    const userId = String(req.user._id)
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Thiếu thông tin id' })
    const target = await Topic.findTargetById(id)
    if (!target) return res.status(404).json({ error: 'Không tìm thấy đối tượng' })
    const topic = await Topic.findById(target.topicId)
    if (target.submissionId != null) {
        const submission = topic.submissions.id(target.submissionId)
        if (target.commentId != null) {
            const comment = submission.comments.id(target.commentId)
            if (target.subCommentId != null) {
                const subComment = comment.subComments.id(target.subCommentId)
                if (subComment.reactions.dislike.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã không thích bình luận này' })
                }
                subComment.reactions.dislike.push(userId)
                // Remove like if exists
                if (subComment.reactions.like.includes(userId)) {
                    subComment.reactions.like = subComment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: subComment.userId, actorId: userId })
                    await decLikesReceived(subComment.userId)
                    await removeLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: comment._id, subCommentId: subComment._id })
                }
            } else {
                if (comment.reactions.dislike.includes(userId)) {
                    return res.status(400).json({ error: 'Bạn đã không thích bình luận này' })
                }
                comment.reactions.dislike.push(userId)
                // Remove like if exists
                if (comment.reactions.like.includes(userId)) {
                    comment.reactions.like = comment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: comment.userId, actorId: userId })
                    await decLikesReceived(comment.userId)
                    await removeLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: comment._id, subCommentId: null })
                }
            }
        } else {
            if (submission.reactions.dislike.includes(userId)) {
                return res.status(400).json({ error: 'Bạn đã không thích bài nộp này' })
            }
            submission.reactions.dislike.push(userId)
            // Remove like if exists
            if (submission.reactions.like.includes(userId)) {
                submission.reactions.like = submission.reactions.like.filter(id => String(id) !== userId)
                await removePointsForSubmissionLikeCancellation({ submissionOwnerId: submission.userId, actorId: userId })
                await decLikesReceived(submission.userId)
                await removeLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: null, subCommentId: null })
            }
        }
    } else {
        if (topic.reactions.dislike.includes(userId)) {
            return res.status(400).json({ error: 'Bạn đã không thích chủ đề này' })
        }
        topic.reactions.dislike.push(userId)
        // Remove like if exists
        if (topic.reactions.like.includes(userId)) {
            topic.reactions.like = topic.reactions.like.filter(id => String(id) !== userId)
            await removePointsForTopicLikeCancellation({ topicOwnerId: topic.createdBy, actorId: userId })
            await decLikesReceived(topic.userId)
            await removeLikedItem(userId, { topicId: topic._id, submissionId: null, commentId: null, subCommentId: null })
        }
    }

    await topic.save()
    res.json({ ok: true })
}

export async function cancelReaction(req, res) {
    const userId = String(req.user._id)
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Thiếu thông tin id' })
    const target = await Topic.findTargetById(id)
    if (!target) return res.status(404).json({ error: 'Không tìm thấy đối tượng' })
    const topic = await Topic.findById(target.topicId)
    if (target.submissionId != null) {
        const submission = topic.submissions.id(target.submissionId)
        if (target.commentId != null) {
            const comment = submission.comments.id(target.commentId)
            if (target.subCommentId != null) {
                const subComment = comment.subComments.id(target.subCommentId)
                if (subComment.reactions.like.includes(userId)) {
                    subComment.reactions.like = subComment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: subComment.userId, actorId: userId })
                    await decLikesReceived(subComment.userId)
                    await removeLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: comment._id, subCommentId: subComment._id })
                } else if (subComment.reactions.dislike.includes(userId)) {
                    subComment.reactions.dislike = subComment.reactions.dislike.filter(id => String(id) !== userId)
                } else {
                    return res.status(400).json({ error: 'Bạn chưa phản ứng với bình luận này' })
                }
            } else {
                if (comment.reactions.like.includes(userId)) {
                    comment.reactions.like = comment.reactions.like.filter(id => String(id) !== userId)
                    await removePointsForCommentLikeCancellation({ commentOwnerId: comment.userId, actorId: userId })
                    await decLikesReceived(comment.userId)
                    await removeLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: comment._id, subCommentId: null })
                } else if (comment.reactions.dislike.includes(userId)) {
                    comment.reactions.dislike = comment.reactions.dislike.filter(id => String(id) !== userId)
                } else {
                    return res.status(400).json({ error: 'Bạn chưa phản ứng với bình luận này' })
                }
            }
        } else {
            if (submission.reactions.like.includes(userId)) {
                submission.reactions.like = submission.reactions.like.filter(id => String(id) !== userId)
                await removePointsForSubmissionLikeCancellation({ submissionOwnerId: submission.userId, actorId: userId })
                await decLikesReceived(submission.userId)
                await removeLikedItem(userId, { topicId: topic._id, submissionId: submission._id, commentId: null, subCommentId: null })
            } else if (submission.reactions.dislike.includes(userId)) {
                submission.reactions.dislike = submission.reactions.dislike.filter(id => String(id) !== userId)
            } else {
                return res.status(400).json({ error: 'Bạn chưa phản ứng với bài nộp này' })
            }
        }
    } else {
        if (topic.reactions.like.includes(userId)) {
            topic.reactions.like = topic.reactions.like.filter(id => String(id) !== userId)
            await removePointsForTopicLikeCancellation({ topicOwnerId: topic.createdBy, actorId: userId })
            await decLikesReceived(topic.userId)
            await removeLikedItem(userId, { topicId: topic._id, submissionId: null, commentId: null, subCommentId: null })
        } else if (topic.reactions.dislike.includes(userId)) {
            topic.reactions.dislike = topic.reactions.dislike.filter(id => String(id) !== userId)
        } else {
            return res.status(400).json({ error: 'Bạn chưa phản ứng với chủ đề này' })
        }
    }

    await topic.save()
    res.json({ ok: true })
}

