// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NotaryRegistry
 * @notice AyuAI Immutable Consultation Notary
 *
 * Anchors SHA-256 hashes of clinical consultation records on-chain.
 * The consultation data itself stays off-chain (Supabase); only the
 * tamper-evident fingerprint lives on the blockchain.
 *
 * Deploy to Sepolia testnet for hackathon demo:
 *   npx hardhat run scripts/deploy.js --network sepolia
 *
 * Then set NEXT_PUBLIC_NOTARY_CONTRACT_ADDRESS in .env.local
 */
contract NotaryRegistry {
    // ── Events ───────────────────────────────────────────────────────────
    event ConsultationAnchored(
        bytes32 indexed appointmentId,
        bytes32 indexed payloadHash,
        address indexed doctor,
        uint256 timestamp
    );

    // ── Storage ───────────────────────────────────────────────────────────
    struct AnchorRecord {
        bytes32 payloadHash;    // SHA-256 of consultation payload
        address doctor;         // wallet address of the anchoring doctor
        uint256 timestamp;      // block.timestamp at anchor time
        bool exists;
    }

    // appointmentId (as bytes32) => latest anchor
    mapping(bytes32 => AnchorRecord) public records;

    // appointmentId => ordered list of all anchor hashes (history)
    mapping(bytes32 => bytes32[]) public anchorHistory;

    // ── Owner ─────────────────────────────────────────────────────────────
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // ── Core Functions ────────────────────────────────────────────────────

    /**
     * @notice Anchor a consultation record hash on-chain.
     * @param appointmentId  The appointment UUID (pass as keccak256 of the UUID string)
     * @param payloadHash    The SHA-256 hash of the canonical consultation payload (as bytes32)
     */
    function anchor(bytes32 appointmentId, bytes32 payloadHash) external {
        records[appointmentId] = AnchorRecord({
            payloadHash: payloadHash,
            doctor: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        anchorHistory[appointmentId].push(payloadHash);

        emit ConsultationAnchored(appointmentId, payloadHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verify that a given hash matches the on-chain anchor.
     * @param appointmentId  The appointment UUID (keccak256)
     * @param payloadHash    The hash to verify
     * @return valid         true if the hash matches the stored anchor
     * @return doctor        The address that anchored the record
     * @return timestamp     When the record was anchored
     */
    function verify(bytes32 appointmentId, bytes32 payloadHash)
        external
        view
        returns (bool valid, address doctor, uint256 timestamp)
    {
        AnchorRecord storage r = records[appointmentId];
        return (
            r.exists && r.payloadHash == payloadHash,
            r.doctor,
            r.timestamp
        );
    }

    /**
     * @notice Get full anchor record for an appointment.
     */
    function getRecord(bytes32 appointmentId)
        external
        view
        returns (bytes32 payloadHash, address doctor, uint256 timestamp, bool exists)
    {
        AnchorRecord storage r = records[appointmentId];
        return (r.payloadHash, r.doctor, r.timestamp, r.exists);
    }

    /**
     * @notice Get number of times a consultation has been re-anchored.
     */
    function getAnchorCount(bytes32 appointmentId) external view returns (uint256) {
        return anchorHistory[appointmentId].length;
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /**
     * @notice Convert a hex string payload hash to bytes32.
     * Call this off-chain (ethers.js) — not gas efficient on-chain.
     * Example (JavaScript):
     *   const appointmentIdBytes = ethers.keccak256(ethers.toUtf8Bytes(appointmentUUID))
     *   const payloadHashBytes = '0x' + sha256HexString
     *   await contract.anchor(appointmentIdBytes, payloadHashBytes)
     */
}
