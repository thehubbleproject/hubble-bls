import { assert } from "chai";
import { arrayify, formatBytes32String, keccak256 } from "ethers/lib/utils";
import { aggregate, BlsSigner } from "../src/signer";

// This is the raw API, it is not recommended to use it directly in your application

describe("BLS Signer", async () => {
    // Domain is a data that signer and verifier must agree on
    // A verifier considers a signature invalid if it is signed with a different domain
    const DOMAIN = arrayify(keccak256("0x1234ABCD"));

    it("verify single signature", async function () {
        // mcl.sign takes hex string as input, so the raw string needs to be encoded
        const message = formatBytes32String("Hello");

        // The `new` method creates a key pair
        const signer = await BlsSigner.getSigner(DOMAIN);
        // Signer can also be initiated with an existing secret
        const signer2 = await BlsSigner.getSigner(DOMAIN, "0xabcd");

        const signature = signer.sign(message);

        assert.isTrue(signer.verify(signature, signer.pubkey, message));
        assert.isFalse(signer.verify(signature, signer2.pubkey, message));
    });
    it("verify aggregated signature", async function () {
        const rawMessages = ["Hello", "how", "are", "you"];
        const signers: BlsSigner[] = [];
        const messages = [];
        const pubkeys = [];
        const signatures = [];
        for (const raw of rawMessages) {
            const message = formatBytes32String(raw);
            const signer = await BlsSigner.getSigner(DOMAIN);
            const signature = signer.sign(message);
            signers.push(signer);
            messages.push(message);
            pubkeys.push(signer.pubkey);
            signatures.push(signature);
        }
        const aggSignature = aggregate(signatures);
        assert.isTrue(
            signers[0].verifyMultiple(aggSignature, pubkeys, messages)
        );
    });
});
