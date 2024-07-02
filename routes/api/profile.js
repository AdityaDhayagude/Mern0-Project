const express = require ('express')
const router = express.Router()

// Route GET api/Profile
//desc TEST Route
// @acess Public 

router.get('/',(req,res)=>{
    res.send('Profile Route')
})

module.exports = router;