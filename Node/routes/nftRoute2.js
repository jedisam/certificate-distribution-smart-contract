const express = require('express');

const nftController = require('../controllers/nftController');
// const optinController = require('../controllers/optinController');

const router = express.Router();

router.route('/').post(nftController.addAsset2);
router.route('/send').post(nftController.sendAsset);
// router.route('/transfer').post(nftController.transferAsset2);

module.exports = router;
