"""Nft management."""
from asyncio.log import logger
import json
import hashlib
import os
import sys

from utils.logger import Logger

from algosdk import mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import AssetConfigTxn, wait_for_confirmation


class Nft:
    def __init__(self, mnemo):
        """Initialize the Nft class."""
        self.logger = Logger("nft.log").get_app_logger()
        self.mnemo = mnemo
        self.algod_token = (
            "2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b"
        )
        self.algod_address = "https://academy-algod.dev.aws.algodev.network/"
        self.algod_client = algod.AlgodClient(self.algod_token, self.algod_address)

        # self.accounts = accounts

    def create_non_fungible_token(self):
        """Create a non-fungible token."""
        # For ease of reference, add account public and private keys to
        # an accounts dict.
        print("--------------------------------------------")
        self.logger.info("Creating account...")
        print("Creating account...")
        accounts = {}
        # m = create_account()
        # m = "frost fade sustain broom country segment shoulder bench screen game sure gas depend slender connect melody siren abstract want trade simple demand rib abstract thought"
        # print(m)
        accounts[1] = {}
        accounts[1]["pk"] = mnemonic.to_public_key(self.mnemo)
        accounts[1]["sk"] = mnemonic.to_private_key(self.mnemo)

        # Change algod_token and algod_address to connect to a different client

        print("--------------------------------------------")
        self.logger.info("Creating asset...")
        print("Creating Asset...")
        # CREATE ASSET
        # Get network params for transactions before every transaction.
        params = self.algod_client.suggested_params()
        # comment these two lines if you want to use suggested params
        # params.fee = 1000
        # params.flat_fee = True

        # JSON file
        dir_path = os.path.dirname(os.path.realpath(__file__))
        # print(dir_path + "")
        # sys.exit(1)
        f = open(dir_path + "/assets/metadata.json", "r")

        # Reading from file
        metadataJSON = json.loads(f.read())
        metadataStr = json.dumps(metadataJSON)

        hash = hashlib.new("sha512_256")
        hash.update(b"arc0003/amj")
        hash.update(metadataStr.encode("utf-8"))
        json_metadata_hash = hash.digest()

        # Account 1 creates an asset called latinum and
        # sets Account 1 as the manager, reserve, freeze, and clawback address.
        # Asset Creation transaction
        pth = dir_path + "/assets/metadata.json"
        txn = AssetConfigTxn(
            sender=accounts[1]["pk"],
            sp=params,
            total=1,
            default_frozen=False,
            unit_name="ALICE001",
            asset_name="Alice's Artwork 001",
            manager=accounts[1]["pk"],
            reserve=None,
            freeze=None,
            clawback=None,
            strict_empty_address_check=False,
            url=pth,
            metadata_hash=json_metadata_hash,
            decimals=0,
        )

        # Sign with secret key of creator
        stxn = txn.sign(accounts[1]["sk"])

        # Send the transaction to the network and retrieve the txid.
        txid = self.algod_client.send_transaction(stxn)
        self.logger.info("Asset Creation Transaction ID: {}".format(txid))
        print("Asset Creation Transaction ID: {}".format(txid))

        # Wait for the transaction to be confirmed
        confirmed_txn = wait_for_confirmation(self.algod_client, txid, 4)
        self.logger.debug("Confirmed Transaction: {}".format(confirmed_txn))
        print("TXID: ", txid)
        print("Result confirmed in round: {}".format(confirmed_txn["confirmed-round"]))
        try:
            # Pull account info for the creator
            # account_info = algod_client.account_info(accounts[1]['pk'])
            # get asset_id from tx
            # Get the new asset's information from the creator account
            ptx = self.algod_client.pending_transaction_info(txid)
            asset_id = ptx["asset-index"]
            self.print_created_asset(self.algod_client, accounts[1]["pk"], asset_id)
            self.print_asset_holding(self.algod_client, accounts[1]["pk"], asset_id)
        except Exception as e:
            self.logger.error(e)
            print(e)

        print("--------------------------------------------")
        self.logger.info("NFT created Successfully!")
        print(
            "You have successfully created your own Non-fungible token! For the purpose of the demo, we will now delete the asset."
        )
        # print("Deleting Asset...")

        # Asset destroy transaction
        # txn = AssetConfigTxn(
        #     sender=accounts[1]["pk"],
        #     sp=params,
        #     index=asset_id,
        #     strict_empty_address_check=False,
        # )

        # # Sign with secret key of creator
        # stxn = txn.sign(accounts[1]["sk"])
        # # Send the transaction to the network and retrieve the txid.
        # txid = algod_client.send_transaction(stxn)
        # print("Asset Destroy Transaction ID: {}".format(txid))

        # Wait for the transaction to be confirmed
        # confirmed_txn = wait_for_confirmation(algod_client, txid, 4)
        # print("TXID: ", txid)
        # print("Result confirmed in round: {}".format(confirmed_txn["confirmed-round"]))
        # # Asset was deleted.
        # try:
        #     self.print_asset_holding(algod_client, accounts[1]["pk"], asset_id)
        #     self.print_created_asset(algod_client, accounts[1]["pk"], asset_id)
        #     print("Asset is deleted.")
        # except Exception as e:
        #     print(e)

        # print("--------------------------------------------")
        # print("Sending closeout transaction back to the testnet dispenser...")
        # closeout_account(algod_client, accounts[1])

    #   Utility function used to print created asset for account and assetid

    def print_created_asset(self, algodclient, account, assetid):
        # note: if you have an indexer instance available it is easier to just use this
        # response = myindexer.accounts(asset_id = assetid)
        # then use 'account_info['created-assets'][0] to get info on the created asset
        account_info = algodclient.account_info(account)
        idx = 0
        for my_account_info in account_info["created-assets"]:
            scrutinized_asset = account_info["created-assets"][idx]
            idx = idx + 1
            if scrutinized_asset["index"] == assetid:
                self.logger.info("Asset {} created by account {}".format(scrutinized_asset["index"])
                print("Asset ID: {}".format(scrutinized_asset["index"]))
                print(json.dumps(my_account_info["params"], indent=4))
                break

    #   Utility function used to print asset holding for account and assetid

    def print_asset_holding(self, algodclient, account, assetid):
        # note: if you have an indexer instance available it is easier to just use this
        # response = myindexer.accounts(asset_id = assetid)
        # then loop thru the accounts returned and match the account you are looking for
        account_info = algodclient.account_info(account)
        idx = 0
        for my_account_info in account_info["assets"]:
            scrutinized_asset = account_info["assets"][idx]
            idx = idx + 1
            if scrutinized_asset["asset-id"] == assetid:
                print("Asset ID: {}".format(scrutinized_asset["asset-id"]))
                print(json.dumps(scrutinized_asset, indent=4))
                break

    def opt_in_non_fungible_token(self, asset_id):
        # Opt-in to the network
        # This is required for the account to be able to transact on the network.
        # OPT-IN
        # Check if asset_id is in account 3's asset holdings prior
        # to opt-in
        params = self.algod_client.suggested_params()
        # comment these two lines if you want to use suggested params
        # params.fee = 1000
        # params.flat_fee = True
        account_info = self.algod_client.account_info(self.accounts[3]["pk"])
        holding = None
        idx = 0
        for my_account_info in account_info["assets"]:
            scrutinized_asset = account_info["assets"][idx]
            idx = idx + 1
            if scrutinized_asset["asset-id"] == asset_id:
                holding = True
                break
        if not holding:
            # Use the AssetTransferTxn class to transfer assets and opt-in
            txn = AssetTransferTxn(
                sender=accounts[3]["pk"],
                sp=params,
                receiver=accounts[3]["pk"],
                amt=0,
                index=asset_id,
            )
            stxn = txn.sign(accounts[3]["sk"])
            # Send the transaction to the network and retrieve the txid.
            try:
                txid = self.algod_client.send_transaction(stxn)
                self.logger.info("Opt-in Transaction ID: {}".format(txid))
                print("Signed transaction with txID: {}".format(txid))
                # Wait for the transaction to be confirmed
                confirmed_txn = wait_for_confirmation(algod_client, txid, 4)
                print("TXID: ", txid)
                self.logger.info("Opt-in confirmed in round: {}".format(confirmed_txn["confirmed-round"]))
                print(
                    "Result confirmed in round: {}".format(
                        confirmed_txn["confirmed-round"]
                    )
                )
            except Exception as err:
                self.logger.error(err)
                print(err)
            # Now check the asset holding for that account.
            # This should now show a holding with a balance of 0.
            self.print_asset_holding(algod_client, self.accounts[3]["pk"], asset_id)


    def transfer_non_fungible_token(self, address, asset_id):
        """Transfer a non-fungible token to a new address."""
                
        # TRANSFER ASSET
        # transfer asset of 10 from account 1 to account 3
        params = algod_client.suggested_params()
        # comment these two lines if you want to use suggested params
        # params.fee = 1000
        # params.flat_fee = True
        txn = AssetTransferTxn(
            sender=accounts[1]['pk'],
            sp=params,
            receiver=address,
            amt=10,
            index=asset_id)
        stxn = txn.sign(accounts[1]['sk'])
        # Send the transaction to the network and retrieve the txid.
        try:
            txid = algod_client.send_transaction(stxn)
            print("Signed transaction with txID: {}".format(txid))
            # Wait for the transaction to be confirmed
            confirmed_txn = wait_for_confirmation(algod_client, txid, 4) 
            print("TXID: ", txid)
            print("Result confirmed in round: {}".format(confirmed_txn['confirmed-round']))
        except Exception as err:
            print(err)
        # The balance should now be 10.
        print_asset_holding(algod_client, accounts[3]['pk'], asset_id)
        