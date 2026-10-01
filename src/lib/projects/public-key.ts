import { nanoid } from "nanoid";

/**
 * A project's public key identifies it to the (not-yet-implemented)
 * embeddable widget. It is not an authentication secret, but it must
 * still be unguessable: nanoid draws from a cryptographically strong
 * random source, and 32 characters makes a collision practically
 * negligible. It is never derived from the project name.
 */
export function generateProjectPublicKey(): string {
  return `pk_${nanoid(32)}`;
}
