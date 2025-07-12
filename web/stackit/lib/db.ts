import mongoose, { Schema, model, models, type Document, type Connection, type Model } from "mongoose"
import type { Answer, Notification, Question, User } from "./types"

// Define Mongoose document interfaces that extend your base types
interface UserDocument extends Omit<User, "id" | "createdAt" | "updatedAt">, Document {}
interface QuestionDocument extends Omit<Question, "id" | "authorId" | "acceptedAnswerId">, Document {
  authorId: mongoose.Types.ObjectId
  acceptedAnswerId?: mongoose.Types.ObjectId
}
interface AnswerDocument extends Omit<Answer, "id" | "questionId" | "authorId" | "upvotes" | "downvotes">, Document {
  questionId: mongoose.Types.ObjectId
  authorId: mongoose.Types.ObjectId
  upvotes: mongoose.Types.ObjectId[]
  downvotes: mongoose.Types.ObjectId[]
}
interface NotificationDocument extends Omit<Notification, "id" | "userId">, Document {
  userId: mongoose.Types.ObjectId
}

// Declare global for mongoose cache to avoid 'Element implicitly has an 'any' type' error
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: Connection | null
        promise: Promise<Connection> | null
      }
    | undefined
}

// --- Mongoose Connection ---
const MONGODB_URI = "mongodb+srv://manyacs1303:manya1632vishnu@stackit.crhrffo.mongodb.net/"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

let cached = global.mongooseCache

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

async function dbConnect(): Promise<Connection> {
  if (cached!.conn) {
    return cached!.conn
  }
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }
    // Reverted to direct mongoose.connect
    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance.connection
    })
  }
  cached!.conn = await cached!.promise
  return cached!.conn
}

// Ensure connection is established before models are defined/accessed
// This is crucial for `mongoose.models` to be properly initialized.
dbConnect().catch((err) => console.error("Failed to connect to MongoDB on module load:", err))

// --- Mongoose Schemas ---
const UserSchema = new Schema<UserDocument>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["guest", "user", "admin"], default: "user" },
  },
  { timestamps: true },
)

const QuestionSchema = new Schema<QuestionDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    acceptedAnswerId: { type: Schema.Types.ObjectId, ref: "Answer" },
  },
  { timestamps: true },
)

const AnswerSchema = new Schema<AnswerDocument>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
)

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["answer", "comment", "mention"], required: true },
    message: { type: String, required: true },
    link: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// --- Mongoose Models ---
// Helper function to get or create a Mongoose model, robust against hot-reloading
function getModel<T extends Document>(name: string, schema: Schema<T>): Model<T> {
  // Check if the model already exists in mongoose.models
  if (models[name]) {
    return models[name] as Model<T>
  }
  // If not, create and return the new model
  return model<T>(name, schema)
}

export const UserModel = getModel<UserDocument>("User", UserSchema)
export const QuestionModel = getModel<QuestionDocument>("Question", QuestionSchema)
export const AnswerModel = getModel<AnswerDocument>("Answer", AnswerSchema)
export const NotificationModel = getModel<NotificationDocument>("Notification", NotificationSchema)

// Helper function to convert MongoDB document to your interface format
export const convertToUserInterface = (doc: any): User => ({
  id: doc._id.toString(),
  firebaseUid: doc.firebaseUid,
  name: doc.name,
  email: doc.email,
  role: doc.role,
})
export const convertToQuestionInterface = (doc: any): Question => ({
  id: doc._id.toString(),
  title: doc.title,
  description: doc.description,
  tags: doc.tags,
  authorId: doc.authorId.toString(),
  acceptedAnswerId: doc.acceptedAnswerId?.toString(),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
})
export const convertToAnswerInterface = (doc: any): Answer => ({
  id: doc._id.toString(),
  questionId: doc.questionId.toString(),
  content: doc.content,
  authorId: doc.authorId.toString(),
  upvotes: doc.upvotes.map((id: any) => id.toString()),
  downvotes: doc.downvotes.map((id: any) => id.toString()),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
})
export const convertToNotificationInterface = (doc: any): Notification => ({
  id: doc._id.toString(),
  userId: doc.userId.toString(),
  type: doc.type,
  message: doc.message,
  link: doc.link,
  read: doc.read,
  createdAt: doc.createdAt.toISOString(),
})

// --- Database Operations (using Mongoose) ---
export const getQuestions = async (): Promise<Question[]> => {
  await dbConnect()
  const docs = await QuestionModel.find({}).sort({ createdAt: -1 }).lean()
  return docs.map(convertToQuestionInterface)
}
export const getQuestionById = async (id: string): Promise<Question | null> => {
  await dbConnect()
  const doc = await QuestionModel.findById(id).lean()
  return doc ? convertToQuestionInterface(doc) : null
}
export const createQuestion = async (
  questionData: Omit<Question, "id" | "createdAt" | "updatedAt">,
): Promise<Question> => {
  await dbConnect()
  const doc = await QuestionModel.create({
    ...questionData,
    authorId: new mongoose.Types.ObjectId(questionData.authorId),
    acceptedAnswerId: questionData.acceptedAnswerId
      ? new mongoose.Types.ObjectId(questionData.acceptedAnswerId)
      : undefined,
  })
  return convertToQuestionInterface(doc.toObject())
}
export const getAnswersForQuestion = async (questionId: string): Promise<Answer[]> => {
  await dbConnect()
  const docs = await AnswerModel.find({ questionId }).sort({ createdAt: 1 }).lean()
  return docs.map(convertToAnswerInterface)
}
export const createAnswer = async (
  answerData: Omit<Answer, "id" | "createdAt" | "updatedAt" | "upvotes" | "downvotes">,
): Promise<Answer> => {
  await dbConnect()
  const doc = await AnswerModel.create({
    questionId: new mongoose.Types.ObjectId(answerData.questionId),
    content: answerData.content,
    authorId: new mongoose.Types.ObjectId(answerData.authorId),
    upvotes: [],
    downvotes: [],
  })
  return convertToAnswerInterface(doc.toObject())
}
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  await dbConnect()
  const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).lean()
  return docs.map(convertToNotificationInterface)
}
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  await dbConnect()
  return NotificationModel.countDocuments({ userId, read: false })
}
export const markNotificationAsRead = async (id: string): Promise<Notification | null> => {
  await dbConnect()
  const doc = await NotificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).lean()
  return doc ? convertToNotificationInterface(doc) : null
}
export const getUserById = async (id: string): Promise<User | null> => {
  await dbConnect()
  const doc = await UserModel.findById(id).lean()
  return doc ? convertToUserInterface(doc) : null
}
export const getUserByFirebaseUid = async (firebaseUid: string): Promise<User | null> => {
  await dbConnect()
  const doc = await UserModel.findOne({ firebaseUid }).lean()
  return doc ? convertToUserInterface(doc) : null
}
export const createUser = async (userData: Omit<User, "id" | "role">): Promise<User> => {
  await dbConnect()
  const doc = await UserModel.create(userData)
  return convertToUserInterface(doc.toObject())
}
export const toggleVote = async (answerId: string, userId: string, type: "up" | "down"): Promise<Answer | null> => {
  await dbConnect()
  const answer = await AnswerModel.findById(answerId)
  if (!answer) return null
  const userObjectId = new mongoose.Types.ObjectId(userId)
  if (type === "up") {
    const upvoteIndex = answer.upvotes.findIndex((id: mongoose.Types.ObjectId) => id.toString() === userId)
    if (upvoteIndex !== -1) {
      answer.upvotes.splice(upvoteIndex, 1)
    } else {
      answer.upvotes.push(userObjectId)
      const downvoteIndex = answer.downvotes.findIndex((id: mongoose.Types.ObjectId) => id.toString() === userId)
      if (downvoteIndex !== -1) {
        answer.downvotes.splice(downvoteIndex, 1)
      }
    }
  } else {
    const downvoteIndex = answer.downvotes.findIndex((id: mongoose.Types.ObjectId) => id.toString() === userId)
    if (downvoteIndex !== -1) {
      answer.downvotes.splice(downvoteIndex, 1)
    } else {
      answer.downvotes.push(userObjectId)
      const upvoteIndex = answer.upvotes.findIndex((id: mongoose.Types.ObjectId) => id.toString() === userId)
      if (upvoteIndex !== -1) {
        answer.upvotes.splice(upvoteIndex, 1)
      }
    }
  }
  await answer.save()
  return convertToAnswerInterface(answer.toObject())
}
export const acceptAnswer = async (questionId: string, answerId: string): Promise<Question | null> => {
  await dbConnect()
  const question = await QuestionModel.findById(questionId)
  if (!question) return null
  question.acceptedAnswerId = new mongoose.Types.ObjectId(answerId)
  await question.save()
  return convertToQuestionInterface(question.toObject())
}
