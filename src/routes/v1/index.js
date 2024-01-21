const express = require('express');

const router = express.Router();

const { InfoController } = require('../../controllers');  // requiring the controller (i.e. last middleware) 
       // do not forget to destructure the above thing
       
router.get('/info', InfoController.info);


module.exports = router;