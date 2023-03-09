import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    TokenAssociateTransaction
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (process.env.HEDERA_ACCOUNT_ID == null || process.env.HEDERA_PRIVATE_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const client = Client.forTestnet();

    client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

    const newKey = PrivateKey.generate();

    let transaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(0)) // 10 h
        .setKey(newKey.publicKey);

    let txResponse = await transaction.execute(client);

    let receipt = await txResponse.getReceipt(client);

    const newAccountId = receipt.accountId;
    // associate token
    transaction = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds(['0.0.3688640', '0.0.3657248'])
        .freezeWith(client);

//Sign with the private key of the account that is being associated to a token
    let signTx = await transaction.sign(newKey);

//Submit the transaction to a Hedera network
    txResponse = await signTx.execute(client);

//Request the receipt of the transaction
    receipt = await txResponse.getReceipt(client);

//Get the transaction consensus status
    let transactionStatus = receipt.status;

    console.log("The transaction consensus status " + transactionStatus.toString());

    return {
        "private_key": newKey.toString(),
        "public_key": newKey.publicKey.toString(),
        "account_id": newAccountId.toString()
    }
}

export const handler = function(event, context) {
    return main()
}