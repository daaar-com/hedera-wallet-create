import {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
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

    const transaction = new AccountCreateTransaction()
        .setInitialBalance(new Hbar(0)) // 10 h
        .setKey(newKey.publicKey);

    const txResponse = await transaction.execute(client);

    const receipt = await txResponse.getReceipt(client);

    const newAccountId = receipt.accountId;

    return {
        "private_kwy": newKey.toString(),
        "public_key": newKey.publicKey.toString(),
        "account_id": newAccountId.toString()
    }
}

export const handler = function(event, context) {
    return main()
}