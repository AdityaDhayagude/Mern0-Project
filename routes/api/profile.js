const express = require ('express')
const auth = require('../../middleware/auth')
const router = express.Router()
const User = require('../../models/Users')
const Profile = require('../../models/Profile')

// Route GET api/Profile/me
//desc GET current user profile
// @acess Private

router.get('/me',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        
        if(!profile){
            return res.status(400).json({msg:'There is no profile of this user'})
        }

        res.json(profile)

    }catch(err){
        console.log(err);
        res.status(500).send('Server')
    }
})

module.exports = router;