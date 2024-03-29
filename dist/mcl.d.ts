import * as mcl from "mcl-wasm";
import { BigNumber } from "ethers";
export declare const FIELD_ORDER: BigNumber;
export declare type SecretKey = mcl.Fr;
export declare type MessagePoint = mcl.G1;
export declare type Signature = mcl.G1;
export declare type PublicKey = mcl.G2;
export declare type solG1 = [string, string];
export declare type solG2 = [string, string, string, string];
export interface keyPair {
    pubkey: PublicKey;
    secret: SecretKey;
}
export declare type Domain = Uint8Array;
export declare function init(): Promise<void>;
export declare function validateHex(hex: string): void;
export declare function validateDomain(domain: Domain): void;
export declare function hashToPoint(msg: string, domain: Domain): MessagePoint;
export declare function mapToPoint(e0: BigNumber): mcl.G1;
export declare function toBigEndian(p: mcl.Fp | mcl.Fp2): Uint8Array;
export declare function g1(): mcl.G1;
export declare function g2(): mcl.G2;
export declare function negativeG2(): mcl.G2;
export declare function g1ToHex(p: mcl.G1): solG1;
export declare function g2ToHex(p: mcl.G2): solG2;
export declare function getPubkey(secret: SecretKey): PublicKey;
export declare function newKeyPair(): keyPair;
export declare function sign(message: string, secret: SecretKey, domain: Domain): {
    signature: Signature;
    messagePoint: MessagePoint;
};
export declare function verifyRaw(signature: Signature, pubkey: PublicKey, message: MessagePoint): boolean;
export declare function verifyMultipleRaw(aggSignature: Signature, pubkeys: PublicKey[], messages: MessagePoint[]): boolean;
export declare function aggregateRaw(signatures: Signature[]): Signature;
export declare function randFr(): mcl.Fr;
export declare function randMclG1(): mcl.G1;
export declare function randMclG2(): mcl.G2;
export declare function randG1(): solG1;
export declare function randG2(): solG2;
export declare function parseFr(hex: string): mcl.Fr;
export declare function setHashFr(hex: string): mcl.Fr;
export declare function parseG1(solG1: solG1): mcl.G1;
export declare function parseG2(solG2: solG2): mcl.G2;
export declare function dumpFr(fr: mcl.Fr): string;
export declare function loadFr(hex: string): mcl.Fr;
export declare function dumpG1(solG1: solG1): string;
export declare function dumpG2(solG2: solG2): string;
export declare function loadG1(hex: string): solG1;
export declare function loadG2(hex: string): solG2;
export declare const getMclInstance: () => typeof mcl;
