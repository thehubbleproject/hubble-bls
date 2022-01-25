import { assert } from "chai";
import { arrayify, formatBytes32String, keccak256 } from "ethers/lib/utils";
import { aggregate, BlsSignerFactory } from "../src/signer";
import { BadHex } from "../src/exceptions";

describe("BLS Signer", async () => {
    // Domain is a data that signer and verifier must agree on
    // A verifier considers a signature invalid if it is signed with a different domain
    const DOMAIN = arrayify(keccak256("0x1234ABCD"));

    it("verify single signature", async function () {
        // message should be a hex string
        const message = formatBytes32String("Hello");

        const factory = await BlsSignerFactory.new();

        // A signer can be instantiate with new key pair generated
        const signer = factory.getSigner(DOMAIN);
        // ... or with an existing secret
        const signer2 = factory.getSigner(DOMAIN, "0xabcd");

        const signature = signer.sign(message);

        assert.isTrue(signer.verify(signature, signer.pubkey, message));
        assert.isFalse(signer.verify(signature, signer2.pubkey, message));
    });
    it("verify aggregated signature", async function () {
        const factory = await BlsSignerFactory.new();
        const rawMessages = ["Hello", "how", "are", "you"];
        const signers = [];
        const messages = [];
        const pubkeys = [];
        const signatures = [];
        for (const raw of rawMessages) {
            const message = formatBytes32String(raw);
            const signer = factory.getSigner(DOMAIN);
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

    it("can verify 1,000 times", async () => {
        // message should be a hex string
        const message = formatBytes32String("Hello");

        const factory = await BlsSignerFactory.new();

        // A signer can be instantiate with new key pair generated
        const signer = factory.getSigner(DOMAIN);

        const signature = signer.sign(message);

        for (let i = 0; i < 1000; i++) {
            assert.isTrue(signer.verify(signature, signer.pubkey, message));
        }
    }).timeout(20000);

    describe("getSigner", () => {
        const prettyHex = (hex: string): string => {
            if (hex.length < 11) {
                return hex;
            }
            return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
        };
        let factory: BlsSignerFactory;

        before(async () => {
            factory = await BlsSignerFactory.new();
        });

        it("fails if secret is not a hex value", () => {
            assert.throws(() => factory.getSigner(DOMAIN, "abc"), BadHex);
        });

        [
            "",
            "0x0",
            "0x01",
            "0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1c",
            "0x2ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb",
            "0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb",
            "0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cbb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510",
        ].forEach((secret) => {
            it(`gets a signer for secret "${prettyHex(secret)}" (length ${
                secret.length
            })`, () => {
                assert.isDefined(factory.getSigner(DOMAIN, secret));
            });
        });
    });
});
