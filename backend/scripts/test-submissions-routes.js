import dotenv from 'dotenv'
import mongoose from 'mongoose'
import readline from 'node:readline/promises'
import Topic from '../src/models/Topic.js'
import User from '../src/models/User.js'

dotenv.config()

const mongoUri = process.env.MONGODB_URI
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3001'

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Abort test.')
  process.exit(1)
}

async function requestJson(method, path, { headers, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  return { status: response.status, payload }
}

function buildHeaders(user) {
  return {
    'x-test-user-id': user._id.toString(),
    'x-test-user-rank': String(user.rank ?? 0),
  }
}

function logResult(label, result) {
  console.log(label, { status: result.status, payload: result.payload })
}

async function run() {
  await mongoose.connect(mongoUri)
  console.log('Connected to MongoDB')
  console.log(`Using API base URL: ${baseUrl}`)

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const waitForEnter = async (label) => {
    await rl.question(`\n[STEP] ${label} - nhấn Enter để chạy...`)
  }

  const testMarker = `[TEST] submission routes ${new Date().toISOString()}`

  const ownerUser = await User.create({
    email: `owner-${Date.now()}@example.com`,
    passwordHash: 'test',
    displayName: `Owner ${testMarker}`,
    role: 'learner',
    rank: 0,
  })

  const otherUser = await User.create({
    email: `other-${Date.now()}@example.com`,
    passwordHash: 'test',
    displayName: `Other ${testMarker}`,
    role: 'learner',
    rank: 0,
  })

  const peekUser = await User.create({
    email: `peek-${Date.now()}@example.com`,
    passwordHash: 'test',
    displayName: `Peek ${testMarker}`,
    role: 'learner',
    rank: 300,
  })

  const topic = await Topic.create({
    title: `Topic ${testMarker}`,
    status: 'Đang mở',
    windowHours: null,
    submissions: [],
    Participation: [],
  })

  const secondTopic = await Topic.create({
    title: `Topic 2 ${testMarker}`,
    status: 'Đang mở',
    windowHours: null,
    submissions: [],
    Participation: [],
  })

  let createdSubmissionId = null
  let secondSubmissionId = null

  try {
    await waitForEnter('createSubmission (owner on topic 1)')
    const createOwnerResult = await requestJson('POST', '/api/submissions', {
      headers: buildHeaders(ownerUser),
      body: {
        topicId: topic._id.toString(),
        understood: 'Test understood',
        notUnderstood: 'Test not understood',
        isAnonymous: false,
      },
    })
    logResult('createSubmission owner', createOwnerResult)
    createdSubmissionId = createOwnerResult.payload?._id

    await waitForEnter('createSubmission (other on topic 1)')
    const createOtherResult = await requestJson('POST', '/api/submissions', {
      headers: buildHeaders(otherUser),
      body: {
        topicId: topic._id.toString(),
        understood: 'Other understood',
        notUnderstood: 'Other not understood',
        isAnonymous: false,
      },
    })
    logResult('createSubmission other', createOtherResult)

    await waitForEnter('createSubmission (owner on topic 2)')
    const createOwnerSecondResult = await requestJson('POST', '/api/submissions', {
      headers: buildHeaders(ownerUser),
      body: {
        topicId: secondTopic._id.toString(),
        understood: 'Second topic understood',
        notUnderstood: 'Second topic not understood',
        isAnonymous: false,
      },
    })
    logResult('createSubmission owner topic 2', createOwnerSecondResult)
    secondSubmissionId = createOwnerSecondResult.payload?._id

    await waitForEnter('listTopicSubmissions (owner, has submitted)')
    const listOwnerResult = await requestJson(
      'GET',
      `/api/submissions/topic/${topic._id.toString()}`,
      { headers: buildHeaders(ownerUser) }
    )
    logResult('listTopicSubmissions owner', listOwnerResult)

    await waitForEnter('listTopicSubmissions (peek user - first time)')
    const peekFirstResult = await requestJson(
      'GET',
      `/api/submissions/topic/${topic._id.toString()}`,
      { headers: buildHeaders(peekUser) }
    )
    logResult('listTopicSubmissions peek first', peekFirstResult)

    await waitForEnter('listTopicSubmissions (peek user - same topic)')
    const peekSameResult = await requestJson(
      'GET',
      `/api/submissions/topic/${topic._id.toString()}`,
      { headers: buildHeaders(peekUser) }
    )
    logResult('listTopicSubmissions peek same topic', peekSameResult)

    await waitForEnter('listTopicSubmissions (peek user - different topic)')
    const peekDifferentResult = await requestJson(
      'GET',
      `/api/submissions/topic/${secondTopic._id.toString()}`,
      { headers: buildHeaders(peekUser) }
    )
    logResult('listTopicSubmissions peek different topic', peekDifferentResult)

    await waitForEnter('listMySubmissions (owner)')
    const listMineResult = await requestJson('GET', '/api/submissions/mine', {
      headers: buildHeaders(ownerUser),
    })
    logResult('listMySubmissions owner', listMineResult)

    if (createdSubmissionId) {
      await waitForEnter('getSubmission (peek user, topic 1)')
      const getFirstResult = await requestJson(
        'GET',
        `/api/submissions/${createdSubmissionId.toString()}`,
        { headers: buildHeaders(peekUser) }
      )
      logResult('getSubmission peek topic 1', getFirstResult)
    }

    if (secondSubmissionId) {
      await waitForEnter('getSubmission (peek user, topic 2)')
      const getSecondResult = await requestJson(
        'GET',
        `/api/submissions/${secondSubmissionId.toString()}`,
        { headers: buildHeaders(peekUser) }
      )
      logResult('getSubmission peek topic 2', getSecondResult)
    }
  } finally {
    await rl.question('\n[STEP] Nhấn Enter để cleanup...')
    rl.close()

    await Topic.deleteMany({ _id: { $in: [topic._id, secondTopic._id] } })
    await User.deleteMany({ _id: { $in: [ownerUser._id, otherUser._id, peekUser._id] } })

    await mongoose.disconnect()
    console.log('Cleanup complete. Disconnected from MongoDB.')
  }
}

run().catch(async (error) => {
  console.error('Submission routes test failed:', error)

  try {
    await mongoose.disconnect()
  } catch {}

  process.exit(1)
})
