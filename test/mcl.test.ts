import { assert } from "chai";
import { formatBytes32String, keccak256 } from "ethers/lib/utils";
import * as mcl from "../src/mcl";

describe("BLS", async () => {
    before(async function () {
        // The libaray needs to be inititalized before using it
        await mcl.init();
        // Domain is a data that signer and verifier must agree on
        // A verifier considers a signature invalid if it is signed with a different domain
        const DOMAIN_HEX = keccak256("0x1234ABCD");
        mcl.setDomainHex(DOMAIN_HEX);
    });
    it("parse g1", async function () {
        const mclG1 = mcl.randMclG1();
        assert.isTrue(mcl.parseG1(mcl.g1ToHex(mclG1)).isEqual(mclG1));
    });
    it("parse g2", async function () {
        const mclG2 = mcl.randMclG2();
        assert.isTrue(mcl.parseG2(mcl.g2ToHex(mclG2)).isEqual(mclG2));
    });

    it("verify single signature", async function () {
        // mcl.sign takes hex string as input, so the raw string needs to be encoded
        const message = formatBytes32String("Hello");
        const { pubkey, secret } = mcl.newKeyPair();
        const { signature, M } = mcl.sign(message, secret);

        // Note that we use the message produced by mcl.sign
        assert.isTrue(mcl.verify(signature, pubkey, M));

        const { pubkey: badPubkey } = mcl.newKeyPair();
        assert.isFalse(mcl.verify(signature, badPubkey, M));
    });
    it("verify aggregated signature", async function () {
        const rawMessages = ["Hello", "how", "are", "you"];
        const messages: mcl.Message[] = [];
        const pubkeys: mcl.PublicKey[] = [];
        const signatures: mcl.Signature[] = [];
        for (const raw of rawMessages) {
            const message = formatBytes32String(raw);
            const { pubkey, secret } = mcl.newKeyPair();
            const { signature, M } = mcl.sign(message, secret);
            messages.push(M);
            pubkeys.push(pubkey);
            signatures.push(signature);
        }
        const aggSignature = mcl.aggreagate(signatures);
        assert.isTrue(mcl.verifyMultiple(aggSignature, pubkeys, messages));
    });
});
