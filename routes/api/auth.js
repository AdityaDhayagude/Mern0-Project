const express = require ('express')
const router = express.Router()

// Route GET api/Auth
//desc TEST Route
// @acess Public 

router.get('/',(req,res)=>{
    res.send('Auth Route')
})

module.exports = router;