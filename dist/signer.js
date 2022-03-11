"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregate = exports.BlsSignerFactory = exports.BlsVerifier = exports.nullBlsSigner = exports.NullBlsSinger = void 0;
const exceptions_1 = require("./exceptions");
const mcl_1 = require("./mcl");
// Useful when your real signer is not loaded but need a placeholder
class NullBlsSinger {
    get pubkey() {
        throw new exceptions_1.NullSigner("NullSinger has no public key");
    }
    sign(message) {
        throw new exceptions_1.NullSigner("NullSinger dosen't sign");
    }
    verify(signature, pubkey, message) {
        throw new exceptions_1.NullSigner("NullSinger dosen't verify");
    }
    verifyMultiple(aggSignature, pubkeys, messages) {
        throw new exceptions_1.NullSigner("NullSinger dosen't verify");
    }
}
exports.NullBlsSinger = NullBlsSinger;
exports.nullBlsSigner = new NullBlsSinger();
class BlsVerifier {
    constructor(domain) {
        this.domain = domain;
    }
    verify(signature, pubkey, message) {
        const signatureG1 = (0, mcl_1.parseG1)(signature);
        const pubkeyG2 = (0, mcl_1.parseG2)(pubkey);
        const messagePoint = (0, mcl_1.hashToPoint)(message, this.domain);
        return (0, mcl_1.verifyRaw)(signatureG1, pubkeyG2, messagePoint);
    }
    verifyMultiple(aggSignature, pubkeys, messages) {
        const signatureG1 = (0, mcl_1.parseG1)(aggSignature);
        const pubkeyG2s = pubkeys.map(mcl_1.parseG2);
        const messagePoints = messages.map((m) => (0, mcl_1.hashToPoint)(m, this.domain));
        return (0, mcl_1.verifyMultipleRaw)(signatureG1, pubkeyG2s, messagePoints);
    }
}
exports.BlsVerifier = BlsVerifier;
class BlsSignerFactory {
    static async new() {
        await (0, mcl_1.init)();
        return new BlsSignerFactory();
    }
    constructor() { }
    getSigner(domain, secretHex) {
        const secret = this.getSecret(secretHex);
        return new BlsSigner(domain, secret);
    }
    getSecret(secretHex) {
        if (!secretHex) {
            // Generate a random secret
            return (0, mcl_1.randFr)();
        }
        try {
            // Attempt to directly parse the hex
            return (0, mcl_1.parseFr)(secretHex);
        }
        catch (_a) {
            // If that fails, hash it
            return (0, mcl_1.setHashFr)(secretHex);
        }
    }
}
exports.BlsSignerFactory = BlsSignerFactory;
class BlsSigner extends BlsVerifier {
    constructor(domain, secret) {
        super(domain);
        this.domain = domain;
        this.secret = secret;
        this._pubkey = (0, mcl_1.getPubkey)(secret);
    }
    get pubkey() {
        return (0, mcl_1.g2ToHex)(this._pubkey);
    }
    sign(message) {
        const { signature } = (0, mcl_1.sign)(message, this.secret, this.domain);
        return (0, mcl_1.g1ToHex)(signature);
    }
}
function aggregate(signatures) {
    const signatureG1s = signatures.map((s) => (0, mcl_1.parseG1)(s));
    const aggregated = (0, mcl_1.aggregateRaw)(signatureG1s);
    return (0, mcl_1.g1ToHex)(aggregated);
}
exports.aggregate = aggregate;
//# sourceMappingURL=signer.js.map