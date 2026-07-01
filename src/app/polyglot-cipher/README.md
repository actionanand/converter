# Polyglot Cipher

A 4-layer, key-derived encryption system that works across multiple scripts and languages — Latin (English, French, German, Spanish), Devanagari (Hindi), Tamil, Kannada, Telugu, Malayalam, Bengali, Gujarati, Gurmukhi, and Oriya.

---

## Character Pool

Before any encryption happens, a unified **character pool** is built by scanning Unicode code point ranges for all supported scripts and keeping only characters that match `\p{Letter}` (the Unicode letter property). This produces ~900+ characters ordered as:

```
[Latin A-Z, a-z, Latin Extended A/B, Latin Extended Additional,
 Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam]
```

Every character in this pool has a fixed index. The cipher operates entirely on these indices — any character **not** in the pool (spaces, numbers, punctuation, symbols) is passed through untouched.

---

## Key Derivation

A single master key produces **4 independent 32-bit sub-keys** — one per cipher layer.

```
deriveSubKeys(key, count = 4) → [seed0, seed1, seed2, seed3]
```

The derivation mixes two running accumulators (`h1`, `h2`) using:

- A rotating set of prime multipliers
- Layer index offsets so each sub-key's derivation path diverges
- Avalanche finalization (multiply-xor-shift rounds) to ensure that a one-character change in the key fully changes all bits in all sub-keys

This means sub-keys 0–3 are cryptographically independent — knowing one does not help predict another.

---

## PRNG — Mulberry32

All randomness in the cipher uses **Mulberry32**, a high-quality 32-bit integer PRNG:

```
state = (state + 0x6d2b79f5) | 0
t = imul(state ^ (state >>> 15), 1 | state)
t = (t + imul(t ^ (t >>> 7), 61 | t)) ^ t
return (t ^ (t >>> 14)) >>> 0 / 2^32
```

It is:

- **Deterministic** — same seed always produces the same sequence
- **Fast** — integer-only arithmetic
- **Good distribution** — passes statistical randomness tests

Each layer that needs a sequence of random values seeds a fresh Mulberry32 instance with its own sub-key.

---

## Encryption — 4 Layers

Encoding applies layers **1 → 2 → 3 → 4**. Decoding applies them in reverse: **4⁻¹ → 3⁻¹ → 2⁻¹ → 1⁻¹**.

---

### Layer 1 — Global Substitution (sub-key 0)

A **Fisher-Yates shuffle** of the full pool index array using Mulberry32 seeded with sub-key 0 produces a permutation `P`:

```
P = [p0, p1, p2, ..., pN]   where N = pool size
```

Encoding maps pool index `i` → `P[i]`.  
Decoding uses the **inverse permutation** `P⁻¹`, mapping `P[i]` → `i`.

**Effect:** Every letter in every script is substituted with another letter from the entire cross-script pool. An English `a` might become a Tamil character; a Kannada vowel might become a German umlaut.

---

### Layer 2 — Positional Shift (sub-key 1)

A fresh Mulberry32 sequence seeded with sub-key 1 generates one random shift value per character position:

```
for each character at position j:
    shift_j = floor(rng() * N)
    encoded_index = (pool_index + shift_j) % N
```

Decoding subtracts the same shift:

```
    original_index = ((encoded_index - shift_j) % N + N) % N
```

**Effect:** Two identical characters at different positions produce **different** cipher characters. This defeats frequency analysis — a statistical attacker cannot count how often a cipher character appears and map it back to a plaintext character, because the mapping changes at every position.

---

### Layer 3 — Secondary Substitution (sub-key 2)

Identical to Layer 1 but uses sub-key 2, producing a completely independent permutation `Q`.

**Effect:** A second shuffle further scrambles the output of Layer 2. Even if Layer 2 output were partially predictable, Layer 3 destroys that structure.

---

### Layer 4 — Feedback Cipher (sub-key 3)

This layer makes the cipher **context-dependent** — the encoding of each character depends on the character that came before it.

```
prev = sub-key 3 % N          ← initialization vector

for each character:
    base_shift = floor(rng() * N)
    total_shift = (base_shift + prev) % N

    on encode:
        new_index = (pool_index + total_shift) % N
        prev = new_index               ← feed forward the *output* index

    on decode:
        original_index = ((encoded_index - total_shift) % N + N) % N
        prev = encoded_index           ← feed forward the *input* index (= encoded output)
```

**Effect:** Changing any single character in the plaintext changes not only its own cipher character but also every character after it in the output. This is the same principle as **CBC (Cipher Block Chaining)** mode in block ciphers, applied here at the character level. It prevents attackers from substituting individual characters in the ciphertext to achieve targeted changes in the plaintext.

---

## Full Encode / Decode Flow

```
Plaintext
   │
   ▼  Layer 1 — Global Substitution    (Fisher-Yates permutation, sub-key 0)
   │
   ▼  Layer 2 — Positional Shift       (per-position PRNG shift, sub-key 1)
   │
   ▼  Layer 3 — Secondary Substitution (Fisher-Yates permutation, sub-key 2)
   │
   ▼  Layer 4 — Feedback Cipher        (chained PRNG shift, sub-key 3)
   │
Ciphertext

Decode reverses each step in opposite order using inverse operations.
```

---

## Special Characters

Any character **not found in the pool** — digits, spaces, punctuation, emoji, control characters — is passed through without modification. This means the structure of a sentence (word lengths, spaces) remains visible in the ciphertext. The cipher is designed for letter-level confidentiality, not structural concealment.

---

## Security Properties

| Property             | Description                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| Key sensitivity      | Every bit of the key affects all 4 sub-keys via avalanche hashing                   |
| Position sensitivity | Identical plaintext letters at different positions produce different ciphertext     |
| Context dependency   | Each letter's encoding depends on all previous letters (feedback chain)             |
| Cross-script output  | Ciphertext characters span all supported scripts, making pattern recognition harder |
| Deterministic        | Same key + same plaintext always produces the same ciphertext                       |
| Reversible           | Lossless: decoding always recovers the exact original text                          |

> **Note:** This cipher is designed to be complex and educational. It is not a cryptographically vetted algorithm (e.g., AES, ChaCha20) and should not be used to protect sensitive data in production systems.
