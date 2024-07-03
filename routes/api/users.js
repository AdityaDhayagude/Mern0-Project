const express = require ('express')
const router = express.Router()
const { check, validationResult } = require("express-validator");

// Route POSTapi/users
//desc Register Route
// @acess Public 

router.post('/',[
    check('name','Name is required').not().isEmpty(),
    check('email','Please include Email').isEmail(),
    check('password','Please Enter passoword of min Lenght of 6').isLength({min:6})

],(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    res.send('User Route')
});

module.exports = router;