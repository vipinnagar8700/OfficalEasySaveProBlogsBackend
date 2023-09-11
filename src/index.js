const express = require('express')
const app = express();
var colors = require('colors');
require('dotenv/config')
var cors = require('cors')

const cookieParser = require('cookie-parser')
app.use(cors())
const { notFound, errorHandler } = require('../middlewares/errorHandler');
const morgan = require('morgan')
app.use(morgan('dev'))
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const adminRoute = require('../routes/AdminRoutes')
const SubadminRoute = require('../routes/SubadminRoutes')
app.use(cookieParser())
const BlogRoute = require('../routes/BlogRoutes')
const dbConnect = require('../config/dbConnected');
dbConnect();
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello Mr vipin Nagar' })

})

app.use('/api/admin', adminRoute)
app.use('/api/subadmin', SubadminRoute)

app.use('/api/blog', BlogRoute)






const port = process.env.PORT || 8000;

const host = '0.0.0.0'; // Listen on all available network interfaces
app.listen(port, host, () => {
    console.log(colors.bgGreen(`Mr Vipin Your Server is Running on server ${port}`))
})