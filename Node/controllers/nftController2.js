const TraineeModel = require('../models/traineeModel');
const OptinModel = require('../models/optinModel');

const Email = require('../utils/email');

var axios = require('axios');
var FormData = require('form-data');
var fs = require('fs');
var data = new FormData();

const algosdk = require('algosdk');

const uploadImage = async (name) => {
  data.append('file', fs.createReadStream(`./Certs/${name}.png`));
  data.append('pinataOptions', '{"cidVersion": 2}');
  data.append(
    'pinataMetadata',
    '{"name": "ader", "keyvalues": {"company": "Pinata"}}'
  );

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiNGJiNmI3Mi05NzljLTRmMzQtOWUxNi1iNjA4ZWI0OWYyMDAiLCJlbWFpbCI6InlpZGlzYW0xOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOGEyZGQ2MDEyMTZkOGRkNzgxYTAiLCJzY29wZWRLZXlTZWNyZXQiOiI3MTViY2Q5ZjNlMTM5NzVhMWVkZDZlZDM2YWI1ODQ2MzYxYTM5OGQ1ZTJiOTljMmMwMGI5ODJjZTFlZWVkZjkxIiwiaWF0IjoxNjU1MzczNzgzfQ.OngCH2omKnMyYWndvh9UcSTl_M1dHUW5Uo-QuoA4CBA',
      ...data.getHeaders(),
    },
    data: data,
  };

  const res = await axios(config);

  console.log(res.data);
};

const uploadJson = async (name, description) => {
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
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiNGJiNmI3Mi05NzljLTRmMzQtOWUxNi1iNjA4ZWI0OWYyMDAiLCJlbWFpbCI6InlpZGlzYW0xOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOGEyZGQ2MDEyMTZkOGRkNzgxYTAiLCJzY29wZWRLZXlTZWNyZXQiOiI3MTViY2Q5ZjNlMTM5NzVhMWVkZDZlZDM2YWI1ODQ2MzYxYTM5OGQ1ZTJiOTljMmMwMGI5ODJjZTFlZWVkZjkxIiwiaWF0IjoxNjU1MzczNzgzfQ.OngCH2omKnMyYWndvh9UcSTl_M1dHUW5Uo-QuoA4CBA',
    },
    data: data,
  };

  const res = await axios(config);
  return res.IpfsHash;
  //   console.log(res.data);
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
    let algodClient = new algosdk.Algodv2(token, algod_address, '');

    const passphrase =
      'congress patient load unlock fiction same vague breeze round argue hotel extra cigar cabbage burger must diesel gospel matter later symptom roof rocket above mouse';

    let myAccount = algosdk.mnemonicToSecretKey(passphrase);
    console.log('My address: %s', myAccount.addr);

    let accountInfo = await algodClient.accountInformation(myAccount.addr).do();
    console.log('Account balance: %d microAlgos', accountInfo.amount);
    // const imUrl = await uploadImage(req.body.name);
    // Asset Creation:
    let params = await algodClient.getTransactionParams().do();
    //comment out the next two lines to use suggested fee
    // params.fee = 1000;
    // params.flatFee = true;
    console.log(params);
    let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored

    let addr = pub_1;
    // Whether user accounts will need to be unfrozen before transacting
    let defaultFrozen = false;
    // integer number of decimals for asset unit calculation
    let decimals = 0;
    // total number of this asset available for circulation
    let totalIssuance = 1;
    // Used to display asset units to user
    let unitName = 'Certification';
    // Friendly name of the asset
    let assetName = 'User Certification';
    // Optional string pointing to a URL relating to the asset
    let assetURL = upfsUrl;
    // Optional hash commitment of some sort relating to the asset. 32 character length.
    let assetMetadataHash = '16efaa3924a6fd9d3a4824799a4ac65d';
    // The following parameters are the only ones
    // that can be changed, and they have to be changed
    // by the current manager
    // Specified address can change reserve, freeze, clawback, and manager
    let manager = pub_2;
    // Specified address is considered the asset reserve
    // (it has no special privileges, this is only informational)
    let reserve = pub_2;
    // Specified address can freeze or unfreeze user asset holdings
    let freeze = pub_2;
    // Specified address can revoke user asset holdings and send
    // them to other addresses
    let clawback = pub_2;

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
    let rawSignedTxn = txn.signTxn(sk.sk);
    let tx = await algodClient.sendRawTransaction(rawSignedTxn).do();
    console.log('First reach check');

    let assetID = null;
    // wait for transaction to be confirmed
    const ptx = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
    console.log('Second reach check');
    // Get the new asset's information from the creator account
    // let ptx = await algodclient.pendingTransactionInformation(tx.txId).do();
    assetID = ptx['asset-index'];
    console.log('THE ASSET ID IS: ', assetID);
    //Get the completed Transaction
    console.log(
      'Transaction ' + tx.txId + ' confirmed in round ' + ptx['confirmed-round']
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
    // const asset = await TraineeModel.create(req.body);
    // res.status(201).json({
    //   status: 'success',
    //   data: {
    //     asset,
    //   },
    // });
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
