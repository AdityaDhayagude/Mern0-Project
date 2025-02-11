const express = require('express')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 5000
const app = express()

connectDB();

// Init Middleware
app.use(express.json({extended:false}))

// DEFINE ROUTES
app.use('/api/users',require('./routes/api/users'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/post',require('./routes/api/post'))
app.use('/api/profile',require('./routes/api/profile'))

app.get('/',(req,res)=>{
    res.send('API Running')
})

app.listen(PORT,()=>{
    console.log(`Server Started on Port ${PORT}`);
})
