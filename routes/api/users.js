const express = require ('express')
const router = express.Router()

// Route GET api/users
//desc TEST Route
// @acess Public 

router.get('/',(req,res)=>{
    res.send('User Route')
})

module.exports = router;