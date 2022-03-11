"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMclInstance = exports.loadG2 = exports.loadG1 = exports.dumpG2 = exports.dumpG1 = exports.loadFr = exports.dumpFr = exports.parseG2 = exports.parseG1 = exports.setHashFr = exports.parseFr = exports.randG2 = exports.randG1 = exports.randMclG2 = exports.randMclG1 = exports.randFr = exports.aggregateRaw = exports.verifyMultipleRaw = exports.verifyRaw = exports.sign = exports.newKeyPair = exports.getPubkey = exports.g2ToHex = exports.g1ToHex = exports.negativeG2 = exports.g2 = exports.g1 = exports.toBigEndian = exports.mapToPoint = exports.hashToPoint = exports.validateDomain = exports.validateHex = exports.init = exports.FIELD_ORDER = void 0;
const mcl = __importStar(require("mcl-wasm"));
const ethers_1 = require("ethers");
const hashToField_1 = require("./hashToField");
const utils_1 = require("ethers/lib/utils");
const exceptions_1 = require("./exceptions");
exports.FIELD_ORDER = ethers_1.BigNumber.from("0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47");
async function init() {
    await mcl.init(mcl.BN_SNARK1);
    mcl.setMapToMode(mcl.BN254);
}
exports.init = init;
function validateHex(hex) {
    if (!(0, utils_1.isHexString)(hex))
        throw new exceptions_1.BadHex(`Expect hex but got ${hex}`);
}
exports.validateHex = validateHex;
function validateDomain(domain) {
    if (domain.length != 32)
        throw new exceptions_1.BadDomain(`Expect 32 bytes but got ${domain.length}`);
}
exports.validateDomain = validateDomain;
function hashToPoint(msg, domain) {
    if (!(0, utils_1.isHexString)(msg))
        throw new exceptions_1.BadMessage(`Expect hex string but got ${msg}`);
    const _msg = (0, utils_1.arrayify)(msg);
    const [e0, e1] = (0, hashToField_1.hashToField)(domain, _msg, 2);
    const p0 = mapToPoint(e0);
    const p1 = mapToPoint(e1);
    const p = mcl.add(p0, p1);
    p.normalize();
    return p;
}
exports.hashToPoint = hashToPoint;
function mapToPoint(e0) {
    let e1 = new mcl.Fp();
    e1.setStr(e0.mod(exports.FIELD_ORDER).toString());
    return e1.mapToG1();
}
exports.mapToPoint = mapToPoint;
function toBigEndian(p) {
    // serialize() gets a little-endian output of Uint8Array
    // reverse() turns it into big-endian, which Solidity likes
    return p.serialize().reverse();
}
exports.toBigEndian = toBigEndian;
function g1() {
    const g1 = new mcl.G1();
    g1.setStr("1 0x01 0x02", 16);
    return g1;
}
exports.g1 = g1;
function g2() {
    const g2 = new mcl.G2();
    g2.setStr("1 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b");
    return g2;
}
exports.g2 = g2;
function negativeG2() {
    const g2 = new mcl.G2();
    g2.setStr("1 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2 0x1d9befcd05a5323e6da4d435f3b617cdb3af83285c2df711ef39c01571827f9d 0x275dc4a288d1afb3cbb1ac09187524c7db36395df7be3b99e673b13a075a65ec");
    return g2;
}
exports.negativeG2 = negativeG2;
function g1ToHex(p) {
    p.normalize();
    const x = (0, utils_1.hexlify)(toBigEndian(p.getX()));
    const y = (0, utils_1.hexlify)(toBigEndian(p.getY()));
    return [x, y];
}
exports.g1ToHex = g1ToHex;
function g2ToHex(p) {
    p.normalize();
    const x = toBigEndian(p.getX());
    const x0 = (0, utils_1.hexlify)(x.slice(32));
    const x1 = (0, utils_1.hexlify)(x.slice(0, 32));
    const y = toBigEndian(p.getY());
    const y0 = (0, utils_1.hexlify)(y.slice(32));
    const y1 = (0, utils_1.hexlify)(y.slice(0, 32));
    return [x0, x1, y0, y1];
}
exports.g2ToHex = g2ToHex;
function getPubkey(secret) {
    const pubkey = mcl.mul(g2(), secret);
    pubkey.normalize();
    return pubkey;
}
exports.getPubkey = getPubkey;
function newKeyPair() {
    const secret = randFr();
    const pubkey = getPubkey(secret);
    return { pubkey, secret };
}
exports.newKeyPair = newKeyPair;
function sign(message, secret, domain) {
    const messagePoint = hashToPoint(message, domain);
    const signature = mcl.mul(messagePoint, secret);
    signature.normalize();
    return { signature, messagePoint };
}
exports.sign = sign;
function verifyRaw(signature, pubkey, message) {
    const negG2 = new mcl.PrecomputedG2(negativeG2());
    const pairings = mcl.precomputedMillerLoop2mixed(message, pubkey, signature, negG2);
    // call this function to avoid memory leak
    negG2.destroy();
    return mcl.finalExp(pairings).isOne();
}
exports.verifyRaw = verifyRaw;
function verifyMultipleRaw(aggSignature, pubkeys, messages) {
    const size = pubkeys.length;
    if (size === 0)
        throw new exceptions_1.EmptyArray("number of public key is zero");
    if (size != messages.length)
        throw new exceptions_1.MismatchLength(`public keys ${size}; messages ${messages.length}`);
    const negG2 = new mcl.PrecomputedG2(negativeG2());
    let accumulator = mcl.precomputedMillerLoop(aggSignature, negG2);
    for (let i = 0; i < size; i++) {
        accumulator = mcl.mul(accumulator, mcl.millerLoop(messages[i], pubkeys[i]));
    }
    // call this function to avoid memory leak
    negG2.destroy();
    return mcl.finalExp(accumulator).isOne();
}
exports.verifyMultipleRaw = verifyMultipleRaw;
function aggregateRaw(signatures) {
    let aggregated = new mcl.G1();
    for (const sig of signatures) {
        aggregated = mcl.add(aggregated, sig);
    }
    aggregated.normalize();
    return aggregated;
}
exports.aggregateRaw = aggregateRaw;
function randFr() {
    const r = (0, utils_1.hexlify)((0, utils_1.randomBytes)(12));
    let fr = new mcl.Fr();
    fr.setHashOf(r);
    return fr;
}
exports.randFr = randFr;
function randMclG1() {
    const p = mcl.mul(g1(), randFr());
    p.normalize();
    return p;
}
exports.randMclG1 = randMclG1;
function randMclG2() {
    const p = mcl.mul(g2(), randFr());
    p.normalize();
    return p;
}
exports.randMclG2 = randMclG2;
function randG1() {
    return g1ToHex(randMclG1());
}
exports.randG1 = randG1;
function randG2() {
    return g2ToHex(randMclG2());
}
exports.randG2 = randG2;
function parseFr(hex) {
    validateHex(hex);
    const fr = new mcl.Fr();
    fr.setStr(hex);
    return fr;
}
exports.parseFr = parseFr;
function setHashFr(hex) {
    validateHex(hex);
    const fr = new mcl.Fr();
    fr.setHashOf(hex);
    return fr;
}
exports.setHashFr = setHashFr;
function parseG1(solG1) {
    const g1 = new mcl.G1();
    const [x, y] = solG1;
    g1.setStr(`1 ${x} ${y}`, 16);
    return g1;
}
exports.parseG1 = parseG1;
function parseG2(solG2) {
    const g2 = new mcl.G2();
    const [x0, x1, y0, y1] = solG2;
    g2.setStr(`1 ${x0} ${x1} ${y0} ${y1}`);
    return g2;
}
exports.parseG2 = parseG2;
function dumpFr(fr) {
    return `0x${fr.serializeToHexStr()}`;
}
exports.dumpFr = dumpFr;
function loadFr(hex) {
    const fr = new mcl.Fr();
    fr.deserializeHexStr(hex.slice(2));
    return fr;
}
exports.loadFr = loadFr;
function dumpG1(solG1) {
    const [x, y] = solG1;
    return `0x${x.slice(2)}${y.slice(2)}`;
}
exports.dumpG1 = dumpG1;
function dumpG2(solG2) {
    const [x0, x1, y0, y1] = solG2;
    return `0x${x0.slice(2)}${x1.slice(2)}${y0.slice(2)}${y1.slice(2)}`;
}
exports.dumpG2 = dumpG2;
function loadG1(hex) {
    const bytesarray = (0, utils_1.arrayify)(hex);
    if (bytesarray.length != 64)
        throw new exceptions_1.BadByteLength(`Expect length 64 but got ${bytesarray.length}`);
    const x = (0, utils_1.hexlify)(bytesarray.slice(0, 32));
    const y = (0, utils_1.hexlify)(bytesarray.slice(32));
    return [x, y];
}
exports.loadG1 = loadG1;
function loadG2(hex) {
    const bytesarray = (0, utils_1.arrayify)(hex);
    if (bytesarray.length != 128)
        throw new exceptions_1.BadByteLength(`Expect length 128 but got ${bytesarray.length}`);
    const x0 = (0, utils_1.hexlify)(bytesarray.slice(0, 32));
    const x1 = (0, utils_1.hexlify)(bytesarray.slice(32, 64));
    const y0 = (0, utils_1.hexlify)(bytesarray.slice(64, 96));
    const y1 = (0, utils_1.hexlify)(bytesarray.slice(96, 128));
    return [x0, x1, y0, y1];
}
exports.loadG2 = loadG2;
const getMclInstance = () => mcl;
exports.getMclInstance = getMclInstance;
//# sourceMappingURL=mcl.js.map