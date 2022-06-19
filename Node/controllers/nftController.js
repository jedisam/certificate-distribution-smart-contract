const TraineeModel = require('../models/traineeModel');
const OptinModel = require('../models/optinModel');

const Email = require('../utils/email');

var axios = require('axios');
var FormData = require('form-data');
var fs = require('fs');
var data = new FormData();

const algosdk = require('algosdk');

const uploadJson = async (name, description) => {
  console.log(name, description);
  BASE_JSON = {
    name: name,
    description: description,
    image:
      'https://gateway.pinata.cloud/ipfs/QmNiu8S6zAR9Z7n4gdmUmzPdEAaKrv8hrf5o2CjBiyBGxw',
    attributes: [],
  };

  var data = JSON.stringify({
    pinataOptions: {
      cidVersion: 1,
    },
    pinataMetadata: {
      name: `${name}`,
      keyvalues: {
        customKey: 'customValue',
        customKey2: 'customValue2',
      },
    },
    pinataContent: BASE_JSON,
  });

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PINATA_TOKEN}`,
    },
    data: data,
  };

  const res = await axios(config);
  return res.data.IpfsHash;
  //   console.log(res.data);
};

const freezeAsset = async (
  algodclient,
  adminAddress,
  traineeAddress,
  assetID,
  sk
) => {
  // await getChangingParms(algodclient);
  params = await algodclient.getTransactionParams().do();
  //comment out the next two lines to use suggested fee
  // params.fee = 1000;
  // params.flatFee = true;

  from = adminAddress;
  freezeTarget = traineeAddress;
  freezeState = true;
  note = undefined;

  // The freeze transaction needs to be signed by the freeze account
  let ftxn = algosdk.makeAssetFreezeTxnWithSuggestedParams(
    from,
    note,
    assetID,
    freezeTarget,
    freezeState,
    params
  );

  // Must be signed by the freeze account
  rawSignedTxn = ftxn.signTxn(sk.sk);
  let ftx = await algodclient.sendRawTransaction(rawSignedTxn).do();

  // Wait for confirmation
  confirmedTxn = await algosdk.waitForConfirmation(algodclient, ftx.txId, 4);
  //Get the completed Transaction
  console.log(
    'Transaction ' +
      ftx.txId +
      ' confirmed in round ' +
      confirmedTxn['confirmed-round']
  );

  // You should now see the asset is frozen listed in the account information
  // console.log('Account 3 = ');
};

const waitForConfirmation = async function (algodClient, txId) {
  let lastround = (await algodClient.status().do())['last-round'];
  while (true) {
    const pendingInfo = await algodClient
      .pendingTransactionInformation(txId)
      .do();
    if (
      pendingInfo['confirmed-round'] !== null &&
      pendingInfo['confirmed-round'] > 0
    ) {
      //Got the completed Transaction
      console.log(
        'Transaction confirmed in round ' + pendingInfo['confirmed-round']
      );
      break;
    }
    lastround++;
    await algodClient.statusAfterBlock(lastround).do();
  }
};

exports.addAsset = async (req, res, next) => {
  try {
    // upload asset to IPFS
    const ipfsHash = await uploadJson(
      req.body.name,
      `${req.body.name}'s certificate`
    );
    sk = algosdk.mnemonicToSecretKey(process.env.MNEMO1);

    const upfsUrl = 'https://ipfs.io/ipfs/' + ipfsHash;

    algod_token = process.env.ALGOD_TOKEN;
    algod_address = process.env.ALGOD_ADDRESS;
    console.log(algod_token, algod_address);
    const pub_1 = process.env.PUBLIC_KEY1;
    const pub_2 = process.env.PUBLIC_KEY2;
    const token = {
      'X-API-Key': process.env.A_KEY,
    };
    // let algodclient = new algosdk.Algod(algod_token, algod_address);
    let algodclient = new algosdk.Algodv2(token, algod_address, '');

    let params = await algodclient.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;
    let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored
    // The following parameters are asset specific
    // Throughout the example these will be re-used.
    // We will also change the manager later in the example
    let addr = pub_1;
    // Whether user accounts will need to be unfrozen before transacting
    let defaultFrozen = false;
    // integer number of decimals for asset unit calculation
    let decimals = 0;
    // total number of this asset available for circulation
    let totalIssuance = 1;
    // Used to display asset units to user
    let unitName = 'NANAN';
    // Friendly name of the asset
    let assetName = 'ALALA';
    // Optional string pointing to a URL relating to the asset
    let assetURL = upfsUrl;
    // Optional hash commitment of some sort relating to the asset. 32 character length.
    let assetMetadataHash = '16efaa3924a6fd9d3a4824799a4ac65d';
    // The following parameters are the only ones
    // that can be changed, and they have to be changed
    // by the current manager
    // Specified address can change reserve, freeze, clawback, and manager
    let manager = pub_1;
    // Specified address is considered the asset reserve
    // (it has no special privileges, this is only informational)
    let reserve = pub_1;
    // Specified address can freeze or unfreeze user asset holdings
    let freeze = pub_1;
    // Specified address can revoke user asset holdings and send
    // them to other addresses
    let clawback = pub_1;

    // signing and sending "txn" allows "addr" to create an asset
    let txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
      addr,
      note,
      totalIssuance,
      decimals,
      defaultFrozen,
      manager,
      reserve,
      freeze,
      clawback,
      unitName,
      assetName,
      assetURL,
      assetMetadataHash,
      params
    );

    let signedTxn = algosdk.signTransaction(txn, sk.sk);
    const sendTx = await algodclient.sendRawTransaction(signedTxn.blob).do();
    console.log('Transaction sent with ID ' + sendTx.txId);
    // const ptx = await waitForConfirmation(algodclient, sendTx.txId);
    const ptx = await algosdk.waitForConfirmation(algodclient, sendTx.txId, 4);
    const assetID = ptx['asset-index'];
    console.log('THE ASSET ID IS: ', assetID);
    // Update the traineeModel by ID and change Mint field to Minted
    await TraineeModel.findOneAndUpdate(
      { email: req.body.email },
      {
        mint: 'Minted',
      }
    );
    const user = {
      name: req.body.name,
      email: req.body.email,
    };
    await new Email(user, assetID).sendId();
    res.status(200).json({
      status: 'success',
      assetID,
    });
  } catch (err) {
    console.log('SOME ERROR HAS OCCURED: ', err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.transferAsset = async (req, res, next) => {
  try {
    sk = algosdk.mnemonicToSecretKey(process.env.MNEMO1);

    algod_token = process.env.ALGOD_TOKEN;
    algod_address = process.env.ALGOD_ADDRESS;
    console.log(algod_token, algod_address);
    const pub_1 = process.env.PUBLIC_KEY1;
    const pub_2 = req.body.address;
    const token = {
      'X-API-Key': process.env.A_KEY,
    };
    // let algodclient = new algosdk.Algod(algod_token, algod_address);
    let algodclient = new algosdk.Algodv2(token, algod_address, '');
    params = await algodclient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;

    sender = pub_1;
    recipient = pub_2;
    revocationTarget = undefined;
    closeRemainderTo = undefined;
    note = undefined;
    assetID = req.body.asset_id;
    //Amount of the asset to transfer
    amount = 1;

    // signing and sending "txn" will send "amount" assets from "sender" to "recipient"
    let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
      sender,
      recipient,
      closeRemainderTo,
      revocationTarget,
      amount,
      note,
      assetID,
      params
    );
    // Must be signed by the account sending the asset
    rawSignedTxn = xtxn.signTxn(sk.sk);
    let xtx = await algodclient.sendRawTransaction(rawSignedTxn).do();

    // Wait for confirmation
    confirmedTxn = await algosdk.waitForConfirmation(algodclient, xtx.txId, 4);
    //Get the completed Transaction
    console.log(
      'Transaction ' +
        xtx.txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );

    // You should now see the 1 assets listed in the account information
    console.log('Successfuly transferred asset');
    await OptinModel.findOneAndDelete({ asset_id: req.body.asset_id });
    //  Freeze the asset
    console.log('Freezing asset...');
    await freezeAsset(algodclient, sender, recipient, req.body.asset_id, sk);
    console.log('Asset successfully frozen');
    res.status(200).json({
      status: 'success',
      message: 'Asset transferred successfully',
    });
  } catch (err) {
    console.log('SOME ERROR HAS OCCURED: ', err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    algodToken = process.env.ALGOD_TOKEN;
    algodServer = process.env.ALGOD_ADDRESS;
    // let algodClient = new algosdk.Algod(algod_token, algod_address);

    let algodClient = new algosdk.Algodv2(algodToken, algodServer);

    let params = await algodClient.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;
    const receiver =
      'GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A';
    const enc = new TextEncoder();
    let note = enc.encode('Hello World');
    let txn = algosdk.makePaymentTxnWithSuggestedParams(
      myAccount.addr,
      receiver,
      1000000,
      undefined,
      note,
      params
    );

    const account = await algosdk.generateAccount();
    res.status(201).json({
      status: 'success',
      data: {
        account,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
