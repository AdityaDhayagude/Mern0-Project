const express = require ('express')
const auth = require('../../middleware/auth')
const router = express.Router()
const { check, validationResult } = require('express-validator');
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

// Route POST api/Profile
//desc Create or update profile
// @acess Private

router.post(
    '/',
    auth,
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // destructure the request
      const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        // spread the rest of the fields we don't need to check
        ...rest
      } = req.body;
  
      // build a profile
      const profileFields = {
        user: req.user.id,
        // website:
        //   website && website !== ''
        //     ? normalize(website, { forceHttps: true })
        //     : '',
        skills: Array.isArray(skills)
          ? skills
          : skills.split(',').map((skill) => ' ' + skill.trim()),
        ...rest
      };
  
      // Build socialFields object
      const socialFields = { youtube, twitter, instagram, linkedin, facebook };
  
      // normalize social fields to ensure valid url
    //   for (const [key, value] of Object.entries(socialFields)) {
    //     if (value && value.length > 0)
    //       socialFields[key] = normalize(value, { forceHttps: true });
    //   }
      // add to profileFields
      profileFields.social = socialFields;
  
      try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        // CREATE
        profile = new Profile(profileFields);
        await profile.save()
        res.json(profile)

        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
      }
    }
  );


// Route GET api/Profile
//desc GET all profile
// @acess Private

router.get('/',async(req,res)=>{
  try{
    const profiles = await Profile.find().populate('user',['name','avatar'])
    res.json(profiles)
  }catch(err){
    console.log(err);
    res.status(500).send('Server Error');
  }
})
// Route GET api/user/:user_id
//desc GET Single profile via user id
// @acess Private

router.get('/user/:user_id',async(req,res)=>{
  try{
    const profile = await Profile.findOne({
      user:req.params.user_id
    }).populate('user',['name','avatar'])

    if(!profile){
      return res.status(400).json({msg:"Profile of User not found "})
    }
    res.json(profile)
  }catch(err){
    console.log(err);
    if(err.kind == "ObjectId"){
      return res.status(400).json({msg:"Profile of User not found "})
    }
  }
})

// Route DELETE api/Profile
//desc DELETE profile,user and posts
// @acess Private

router.delete('/',auth,async(req,res)=>{
  try{
    // @to-do Remove User Posts

    // Remove User
    await User.findOneAndDelete({ _id: req.user.id })

    // Remove Profile
    await Profile.findOneAndDelete({user: req.user.id})

    res.json({msg:"User Deleted"})

  }catch(err){
    console.log(err);
    res.status(500).send('Server Error');
  }
})

// Route PUT api/profile/experience
//desc PUT profile experience
// @acess Private

router.put('/experience',
  auth,
  check('title', 'Title is required').notEmpty(),
  check('company', 'Company is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past')
    .notEmpty()
    .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),async(req,res)=>{

  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({msg:errors.array()})
  }
  
  const {
    title, company, location, from, to, current, description
    } = req.body

  const newExp = {
      title, company, location, from, to, current, description
    }

  try {
    const profile = await Profile.findOne({user:req.user.id})

    profile.experience.unshift(newExp)

    await profile.save()
    res.json(profile)

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error')
  }

})

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
  '/education',
  auth,
  check('school', 'School is required').notEmpty(),
  check('degree', 'Degree is required').notEmpty(),
  check('fieldofstudy', 'Field of study is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past')
    .notEmpty()
    .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(req.body);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: 'No Github profile found' });
  }
});


module.exports = router;