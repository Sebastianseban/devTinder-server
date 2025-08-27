import cookieParser from "cookie-parser"
import express from "express"
import { errorHandler, notFound } from "./middleware/errorHandler.middleware.js"

const app = express()

app.use(express.json({limit: "16kb" }))
app.use(cookieParser())

import authRouter from "./routes/auth.routes.js"



app.use("/api/v1/auth",authRouter)




app.use(notFound)

// Global error handler - MUST be the last middleware
// This catches all errors thrown by asyncHandler or any other middleware
app.use(errorHandler)

export {app}