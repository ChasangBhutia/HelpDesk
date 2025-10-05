const express = require('express');
const { registerUser, loginUser, logout, getMe,getAgents, getUsers } = require('../controllers/authController');
const router = express.Router();

router.get('/', (req,res)=>{
    res.json({message:"This is working"});
})

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/me', getMe);
router.get("/agents", getAgents);
router.get("/users", getUsers);

module.exports = router;