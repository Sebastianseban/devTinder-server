import cookieParser from "cookie-parser"
import express from "express"
import { errorHandler, notFound } from "./middleware/errorHandler.middleware.js"

const app = express()

app.use(express.json({limit: "16kb" }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(compression());


import authRouter from "./routes/auth.routes.js"
import  connectionRequestRouter from "./routes/connectionRequest.routes.js"
import profileRouter from "./routes/profile.routes.js"
import compression from "compression"



app.use("/api/v1/auth",authRouter)
app.use("/api/v1/connections",connectionRequestRouter)
app.use("/api/v1/profile",profileRouter)

    


app.use(notFound)

// Global error handler - MUST be the last middleware
// This catches all errors thrown by asyncHandler or any other middleware
app.use(errorHandler)

export {app}