const {Router}=require('express');

const {
  auth,
  userPic
}= require("../controllers/userAuth");


const {
    getTask,
    saveTask1,
    updateTask,
    deleteTask
  } = require('../controllers/taskControllers');
  const {
    user,
    emailVar
  } = require('../controllers/createUser');
  

const router =Router();

router.get('/get',getTask);
router.post('/save',saveTask1);
router.put('/update/:id',updateTask);
router.delete('/delete/:id',deleteTask);

router.post('/auth',auth);
router.post('/user', user);


router.get('/users/:id/verify/:token',emailVar)

router.get('/user/photo/:userId',userPic );

module.exports=router;