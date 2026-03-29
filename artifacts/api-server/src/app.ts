import express, { Request, Response } from "express"
import pinoHttp from "pino-http"

const app = express()

app.use(pinoHttp())

app.get("/", (req: Request, res: Response) => {
  res.send("API is running 🚀")
})

export default app