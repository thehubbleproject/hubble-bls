export declare class HubbleBlsError extends Error {
}
export declare class HashToFieldError extends HubbleBlsError {
}
export declare class MclError extends HubbleBlsError {
}
export declare class SignerError extends HubbleBlsError {
}
export declare class BadDomain extends HashToFieldError {
}
export declare class EmptyArray extends MclError {
}
export declare class MismatchLength extends MclError {
}
export declare class BadMessage extends MclError {
}
export declare class BadHex extends MclError {
}
export declare class BadByteLength extends MclError {
}
export declare class NullSigner extends SignerError {
}
