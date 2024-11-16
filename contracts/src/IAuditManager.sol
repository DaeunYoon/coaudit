// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IAuditManager {
    // --- Events ---
    event CreatedBounty(
        uint64 attestationId,
        uint chainId,
        address indexed contractAddress,
        address indexed attester
    );

    // --- Functions ---
    function setSchema(bytes32 schemaName, uint64 schemaId) external;
    
    function getSchemaId(bytes32 name) external view returns (uint64);
    
    function getBountyIdForContract(address contractAddress, uint chainId) external view returns (uint64);

    function schemaToHook(bytes32 name) external view returns (address);
}