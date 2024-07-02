const express = require ('express')
const router = express.Router()

// Route GET api/post
//desc TEST Route
// @acess Public 

router.get('/',(req,res)=>{
    res.send('Post Route')
})

module.exports = router;