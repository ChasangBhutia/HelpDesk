const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const authRoute = require('./routes/authRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/auth/', authRoute);

connectDB();

app.listen(PORT, ()=>{
    console.log(`Server is live on PORT: ${PORT}`)
})