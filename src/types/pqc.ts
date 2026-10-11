export interface HandshakeArtifacts {
  alice: {
    classicalPubHex: string;
    classicalPubLen: number;
    pqcPubPreviewHex: string;
    pqcPubLen: number;
    combinedPubLen: number;
  };
  bob: {
    ephemeralPubHex: string;
    ephemeralPubLen: number;
    pqcCiphertextPreviewHex: string;
    pqcCiphertextLen: number;
    combinedCiphertextLen: number;
    classicalSharedHex: string;
    pqcSharedHex: string;
    derivedMasterKeyHex: string;
  };
  decapsulation: {
    aliceClassicalSharedHex: string;
    alicePqcSharedHex: string;
    aliceDerivedMasterKeyHex: string;
    keyMatches: boolean;
  };
  metrics: {
    classicalSecurityBits: number;
    postQuantumCategory: string;
    pqcStandard: string;
    classicalStandard: string;
    kdf: string;
    totalPublicTransmissionBytes: number;
  };
}

export interface SimulationResult {
  success: boolean;
  matched: boolean;
  algorithm: string;
  durationMs: number;
  artifacts: HandshakeArtifacts;
}

export interface PresetTask {
  id: string;
  title: string;
  language: string;
  category: 'kem' | 'signature' | 'hpke' | 'audit';
  description: string;
  prompt: string;
}

export interface NISTAlgorithm {
  name: string;
  standard: string;
  type: 'KEM' | 'Signature';
  securityLevel: string;
  classicalEquiv: string;
  publicKeySize: number;
  privateKeySize: number;
  ciphertextOrSigSize: number;
  mathFamily: string;
  status: string;
  recommendedUse: string;
}
