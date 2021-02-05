import { assert } from "chai";
import { arrayify, formatBytes32String, keccak256 } from "ethers/lib/utils";
import * as mcl from "../src/mcl";

// This is the raw API, it is not recommended to use it directly in your application

describe("BLS raw API", async () => {
    // Domain is a data that signer and verifier must agree on
    // A verifier considers a signature invalid if it is signed with a different domain
    const DOMAIN = arrayify(keccak256("0x1234ABCD"));
    before(async function () {
        // The libaray needs to be inititalized before using it
        await mcl.init();
    });
    it("parse g1", async function () {
        const mclG1 = mcl.randMclG1();
        assert.isTrue(mcl.parseG1(mcl.g1ToHex(mclG1)).isEqual(mclG1));
    });
    it("parse g2", async function () {
        const mclG2 = mcl.randMclG2();
        assert.isTrue(mcl.parseG2(mcl.g2ToHex(mclG2)).isEqual(mclG2));
    });
    it("load and dumps Fr", async function () {
        const fr = mcl.randFr();
        assert.isTrue(fr.isEqual(mcl.loadFr(mcl.dumpFr(fr))));
    });
    it("load and dumps G1", async function () {
        const solG1 = mcl.g1ToHex(mcl.randMclG1());
        assert.deepStrictEqual(mcl.loadG1(mcl.dumpG1(solG1)), solG1);
    });
    it("load and dumps G2", async function () {
        const solG2 = mcl.g2ToHex(mcl.randMclG2());
        assert.deepStrictEqual(mcl.loadG2(mcl.dumpG2(solG2)), solG2);
    });

    it("verify single signature", async function () {
        // mcl.sign takes hex string as input, so the raw string needs to be encoded
        const message = formatBytes32String("Hello");
        const { pubkey, secret } = mcl.newKeyPair();
        const { signature, messagePoint } = mcl.sign(message, secret, DOMAIN);

        // Note that we use the message produced by mcl.sign
        assert.isTrue(mcl.verifyRaw(signature, pubkey, messagePoint));

        const { pubkey: badPubkey } = mcl.newKeyPair();
        assert.isFalse(mcl.verifyRaw(signature, badPubkey, messagePoint));
    });
    it("verify aggregated signature", async function () {
        const rawMessages = ["Hello", "how", "are", "you"];
        const messages: mcl.MessagePoint[] = [];
        const pubkeys: mcl.PublicKey[] = [];
        const signatures: mcl.Signature[] = [];
        for (const raw of rawMessages) {
            const message = formatBytes32String(raw);
            const { pubkey, secret } = mcl.newKeyPair();
            const { signature, messagePoint } = mcl.sign(
                message,
                secret,
                DOMAIN
            );
            messages.push(messagePoint);
            pubkeys.push(pubkey);
            signatures.push(signature);
        }
        const aggSignature = mcl.aggregateRaw(signatures);
        assert.isTrue(mcl.verifyMultipleRaw(aggSignature, pubkeys, messages));
    });
});
