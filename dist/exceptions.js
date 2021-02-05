"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullSigner = exports.BadByteLength = exports.BadHex = exports.BadMessage = exports.MismatchLength = exports.EmptyArray = exports.BadDomain = exports.SignerError = exports.MclError = exports.HashToFieldError = exports.HubbleBlsError = void 0;
class HubbleBlsError extends Error {
}
exports.HubbleBlsError = HubbleBlsError;
class HashToFieldError extends HubbleBlsError {
}
exports.HashToFieldError = HashToFieldError;
class MclError extends HubbleBlsError {
}
exports.MclError = MclError;
class SignerError extends HubbleBlsError {
}
exports.SignerError = SignerError;
// HashToFieldError
class BadDomain extends HashToFieldError {
}
exports.BadDomain = BadDomain;
// MclError
class EmptyArray extends MclError {
}
exports.EmptyArray = EmptyArray;
class MismatchLength extends MclError {
}
exports.MismatchLength = MismatchLength;
class BadMessage extends MclError {
}
exports.BadMessage = BadMessage;
class BadHex extends MclError {
}
exports.BadHex = BadHex;
class BadByteLength extends MclError {
}
exports.BadByteLength = BadByteLength;
// SignerError
class NullSigner extends SignerError {
}
exports.NullSigner = NullSigner;
//# sourceMappingURL=exceptions.js.map