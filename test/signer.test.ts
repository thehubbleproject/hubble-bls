import { assert } from "chai";
import { arrayify, formatBytes32String, keccak256 } from "ethers/lib/utils";
import { solG1, solG2 } from "../src/mcl";
import { aggregate, BlsSignerFactory, BlsVerifier } from "../src/signer";

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

    it("rejects invalid signature", async function() {
        const verifier = new BlsVerifier(arrayify(keccak256("0xfeedbee5")));

        // Starting from a correctly signed example
        const signature: solG1 = ["0x159647ae964ea7a386767ab1e41aa47652265bf031ab9d05b70bf5ad1a770a3c","0x0d46b38b1f72d7df1f88786272f0b3fea1c79e1c8515a165fe19939e031ced9e"];
        const pubkey: solG2 = ["0x2836b6b13bd5ace9680634043f09fec8732b6e43939f7e4d2f76c03db0afce15","0x18496f68063e0be219b95a1d086279772a3bca0005aa1cb39eabde35d2d8d5f4","0x0ae7d6473913e4865cdeba81f88d3511acb461175f4e9ac7e8fe5e48bbc55c0f","0x075a3c3c825d516ed0b6014246e869d50f24be3affcac6f1814ee69429cd045d"];
        const message = "0x0000000000000000000000000000000000000000000000000000000000066eeb000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000008cd755f93e56c90e3d5803c036771cfcc12b7c537717ec640ce190aa48cd0019aad18112e6c16befa603de675c3e86a11228aab6";

        assert.isTrue(verifier.verify(
            signature,
            pubkey,
            message,
        ));

        // Change first hex digit of signature from 1 to 0 (to make it invalid)
        const badSignature = signature.slice() as solG1;
        badSignature[0] = `0x0${signature[0].slice(3)}`;

        // This should just return false, but it throws :(
        assert.isFalse(verifier.verify(
            badSignature,
            pubkey,
            message,
        ));
    });
});
