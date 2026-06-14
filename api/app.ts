/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import applicationRoutes from './routes/applications.js'
import bidRoutes from './routes/bids.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import materialRoutes from './routes/materials.js'
import financeRoutes from './routes/finance.js'
import changeRoutes from './routes/changes.js'
import userRoutes from './routes/users.js'
import settingRoutes from './routes/settings.js'
import reportRoutes from './routes/reports.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/bids', bidRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/changes', changeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/reports', reportRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
