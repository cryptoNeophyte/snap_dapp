const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')

const errorHandler = require('./middleware/error')

// connect to database
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_CLOUD_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  console.log(`MongoDB connected: ${conn.connection.host}`)
}
connectDB()

// Route files
const image = require('./routes/image.route')

// initialize app variable with express
const app = express()

// Body Parser --> middleware for reading requests
app.use(express.json())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// File uploading
app.use(
  fileUpload({
    // storing uploaded file in temp folder
    useTempFiles: true,
  }),
)

// enable cors
app.use(cors())

// set static folder

// health check
app.get('/', (req, res) => {
  res.status(200).send('Health Ok!')
})

// mount routers
app.use('/api/v1/image', image)

//error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
)

//global handler for unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`)

  //close server and exit process
  server.close(() => {
    process.exit(1)
  })
})
