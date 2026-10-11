# PQC Studio: Post-Quantum Cryptography & Hybrid KEM Workbench

Senior Cryptography Engineering workbench for Post-Quantum Cryptography (PQC), NIST FIPS 203 ML-KEM, FIPS 204 ML-DSA, and hybrid X25519 key encapsulation mechanisms.

For the comprehensive engineering specification and Python integration module, see:
👉 **[PQC_HYBRID_KEM_INTEGRATION.md](./PQC_HYBRID_KEM_INTEGRATION.md)**

## Features
- **PQC Implementation Agent:** Deterministic generation (temperature 0.0) with NIST FIPS 203/204 guardrails.
- **Hybrid KEM Handshake Simulator:** Live Alice & Bob simulation combining X25519 with ML-KEM-768 via HKDF-SHA256.
- **NIST Standards Matrix:** Detailed parameter analysis for FIPS 203, FIPS 204, FIPS 205, and CNSA 2.0 timelines.
- **Cryptographic Assurance Audit:** 8-point automated compliance checker for side-channels, zeroization, and dual-PRF security.
