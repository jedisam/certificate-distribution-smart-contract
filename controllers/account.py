import json
import base64
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import PaymentTxn, wait_for_confirmation
import time


def create_account(fund=True):
    # Change algod_token and algod_address to connect to a different client
    algod_token = "2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b"
    algod_address = "https://academy-algod.dev.aws.algodev.network/"
    algod_client = algod.AlgodClient(algod_token, algod_address)

    # Generate new account for this transaction
    secret_key, my_address = account.generate_account()
    m = mnemonic.from_private_key(secret_key)
    print("My address: {}".format(my_address))

    # Check your balance. It should be 0 microAlgos
    account_info = algod_client.account_info(my_address)
    print("Account balance: {} microAlgos".format(account_info.get("amount")) + "\n")

    if fund:
        # Fund the created account
        print(
            "Go to the below link to fund the created account using testnet faucet: \n https://dispenser.testnet.aws.algodev.network/?account={}".format(
                my_address
            )
        )

        completed = ""
        while completed.lower() != "yes":
            completed = input("Type 'yes' once you funded the account: ")

        print("Fund transfer in process...")
        # Wait for the faucet to transfer funds
        time.sleep(5)

        print("Fund transferred!")
        # Check your balance. It should be 5000000 microAlgos
        account_info = algod_client.account_info(my_address)
        print(
            "Account balance: {} microAlgos".format(account_info.get("amount")) + "\n"
        )

    return m


def closeout_account(algod_client, account):
    # build transaction
    print("--------------------------------------------")
    print("Closing out account......")
    params = algod_client.suggested_params()
    # comment out the next two (2) lines to use suggested fees
    #   params.flat_fee = True
    #   params.fee = 1000
    receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA"
    note = "closing out account".encode()

    # Fifth argument is a close_remainder_to parameter that creates a payment txn that sends all of the remaining funds to the specified address. If you want to learn more, go to: https://developer.algorand.org/docs/reference/transactions/#payment-transaction
    unsigned_txn = PaymentTxn(account["pk"], params, receiver, 0, receiver, note)

    # sign transaction
    signed_txn = unsigned_txn.sign(account["sk"])
    txid = algod_client.send_transaction(signed_txn)
    print("Transaction Info:")
    print("Signed transaction with txID: {}".format(txid))

    # wait for confirmation
    try:
        confirmed_txn = wait_for_confirmation(algod_client, txid, 4)
        print("TXID: ", txid)
        print("Result confirmed in round: {}".format(confirmed_txn["confirmed-round"]))
    except Exception as err:
        print(err)
        return
    account_info = algod_client.account_info(account["pk"])
    print("Account balance: {} microAlgos".format(account_info.get("amount")) + "\n")
    print("Account Closed")

