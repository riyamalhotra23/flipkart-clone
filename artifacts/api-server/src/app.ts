import express, { Request, Response } from "express"
import pinoHttp from "pino-http"

const app = express()

const logger = (pinoHttp as any).default
  ? (pinoHttp as any).default()
  : (pinoHttp as any)()

app.use(logger)

app.get("/", (req: Request, res: Response) => {
  res.send("API is running 🚀")
})

export default app