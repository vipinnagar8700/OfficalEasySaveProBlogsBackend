const express = require('express')
const app = express();
var colors = require('colors');
require('dotenv/config')
var cors = require('cors')
const Minio = require('minio');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser')
app.use(cors())
const { notFound, errorHandler } = require('../middlewares/errorHandler');
const morgan = require('morgan')
app.use(morgan('dev'))
const bodyParser = require('body-parser');
app.use(bodyParser.json());
// In your Node.js file (e.g., app.js or server.js)
const bucketName = process.env.BUCKET_NAME
console.log(bucketName, "1111111111111111111111111")
const bucketRegion = process.env.BUCKET_REGION
const accessKeyes = process.env.accessKeyId
const secretAccessKeyid = process.env.secretAccessKey




const minioClient = new Minio.Client({
    endPoint: 's3.easysavepro.com', // Replace with your Minio server's endpoint
    port: 443, // Replace with the port number your Minio server uses
    useSSL: true, // Set to true if your Minio server uses SSL
    accessKey: accessKeyes, // Replace with your Minio server access key
    secretKey: secretAccessKeyid // Replace with your Minio server secret key
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const adminRoute = require('../routes/AdminRoutes')
const SubadminRoute = require('../routes/SubadminRoutes')
const GeoRoute = require('../routes/GeoRoutes')
const UserRoute = require('../routes/UserRoutes')
app.use(cookieParser())
const BlogRoute = require('../routes/BlogRoutes');
const AdsRoute = require('../routes/AdsRoutes')
const dbConnect = require('../config/dbConnected');
dbConnect();

app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('Views', path.join(__dirname, 'Views'));

app.use(express.static('public'));




app.get('/', (req, res) => {
    res.render('adsCreate', { title: 'Hello Mr vipin Nagar' });

})


minioClient.makeBucket(bucketName, process.env.AWS_REGION, function (req, res, err) {
    if (err) {
        console.error('Error creating bucket:', err);
    } else {
        console.log('Bucket created successfully.');
        // Proceed with other operations or respond with success message
    }
});


app.use('/api/ads', AdsRoute)
app.use('/api/admin', adminRoute)
app.use('/api/subadmin', SubadminRoute)
app.use('/api/geo', GeoRoute)
app.use('/api/blog', BlogRoute)
app.use('/api/user', UserRoute)

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));



const port = process.env.PORT || 8000;

const host = '0.0.0.0'; // Listen on all available network interfaces
app.listen(port, host, () => {
    console.log(colors.bgGreen(`Mr Vipin Your Server is Running on server ${port}`))
})