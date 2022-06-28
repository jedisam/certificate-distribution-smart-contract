const express = require('express');

const nftController = require('../controllers/nftController');
// const optinController = require('../controllers/optinController');

const router = express.Router();

router.route('/').post(nftController.addAsset2);
router.route('/send').post(nftController.sendAsset);
router.route('/optin').post(nftController.optinAsset2);
router.route('/opt').post(nftController.optin2);
router.route('/transfer').post(nftController.transferAsset2);
router.route('/transferVerify').post(nftController.transferVerify);

// router.route('/transfer').post(nftController.transferAsset2);

module.exports = router;
