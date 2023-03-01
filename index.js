import {
    Wallet,
    LocalProvider,
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

    const wallet = new Wallet(
        process.env.HEDERA_ACCOUNT_ID,
        process.env.HEDERA_PRIVATE_KEY,
        new LocalProvider()
    );

    const newKey = PrivateKey.generate();

    let transaction = await new AccountCreateTransaction()
        .setInitialBalance(new Hbar(0)) // 10 h
        .setKey(newKey.publicKey)
        .freezeWithSigner(wallet);


    console.log(`private key = ${newKey.toString()}`);
    console.log(`public key = ${newKey.publicKey.toString()}`);

    console.log(`account id = ${newKey.publicKey.toAccountId(0,0).toString()}`);

    return {
        "private_kwy": newKey.toString(),
        "public_key": newKey.publicKey.toString(),
        "account_id": newKey.publicKey.toAccountId(0,0).toString()
    }
}

export const handler = function(event, context) {
    return main()
}