const express = require('express');

const nftController = require('../controllers/nftController');
// const optinController = require('../controllers/optinController');

const router = express.Router();

router.route('/').post(nftController.addAsset);
router.route('/transfer').post(nftController.transferAsset);

module.exports = router;
