import { solG2, Domain, solG1, SecretKey } from "./mcl";
export interface BlsSignerInterface {
    pubkey: solG2;
    sign(message: string): solG1;
    verify(signature: solG1, pubkey: solG2, message: string): boolean;
    verifyMultiple(aggSignature: solG1, pubkeys: solG2[], messages: string[]): boolean;
}
export declare class NullBlsSinger implements BlsSignerInterface {
    get pubkey(): solG2;
    sign(message: string): solG1;
    verify(signature: solG1, pubkey: solG2, message: string): boolean;
    verifyMultiple(aggSignature: solG1, pubkeys: solG2[], messages: string[]): boolean;
}
export declare const nullBlsSigner: NullBlsSinger;
export declare class BlsVerifier {
    domain: Domain;
    constructor(domain: Domain);
    verify(signature: solG1, pubkey: solG2, message: string): boolean;
    verifyMultiple(aggSignature: solG1, pubkeys: solG2[], messages: string[]): boolean;
}
export declare class BlsSignerFactory {
    static new(): Promise<BlsSignerFactory>;
    private constructor();
    getSigner(domain: Domain, secretHex?: string): BlsSigner;
    private getSecret;
}
declare class BlsSigner extends BlsVerifier implements BlsSignerInterface {
    domain: Domain;
    private secret;
    private _pubkey;
    constructor(domain: Domain, secret: SecretKey);
    get pubkey(): solG2;
    sign(message: string): solG1;
}
export declare function aggregate(signatures: solG1[]): solG1;
export {};
