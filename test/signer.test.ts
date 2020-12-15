import { assert } from "chai";
import { arrayify, formatBytes32String, keccak256 } from "ethers/lib/utils";
import { aggregate, BlsSigner } from "../src/signer";
import { init } from "../src/mcl";

// This is the raw API, it is not recommended to use it directly in your application

describe("BLS Signer", async () => {
    // Domain is a data that signer and verifier must agree on
    // A verifier considers a signature invalid if it is signed with a different domain
    const DOMAIN = arrayify(keccak256("0x1234ABCD"));
    before(async function () {
        // The libaray needs to be inititalized before using it
        await init();
    });

    it("verify single signature", async function () {
        // mcl.sign takes hex string as input, so the raw string needs to be encoded
        const message = formatBytes32String("Hello");

        // The `new` method creates a key pair
        const signer = BlsSigner.new(DOMAIN);

        const signature = signer.sign(message);

        assert.isTrue(signer.verify(signature, signer.pubkey, message));
    });
    it("verify aggregated signature", async function () {
        const rawMessages = ["Hello", "how", "are", "you"];
        const signers: BlsSigner[] = [];
        const messages = [];
        const pubkeys = [];
        const signatures = [];
        for (const raw of rawMessages) {
            const message = formatBytes32String(raw);
            const signer = BlsSigner.new(DOMAIN);
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
