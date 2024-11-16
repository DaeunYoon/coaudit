// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ISP} from "lib/sign-protocol-evm/src/interfaces/ISP.sol";
import {DataLocation} from "lib/sign-protocol-evm/src/models/DataLocation.sol";
import {Attestation} from "lib/sign-protocol-evm/src/models/Attestation.sol";

interface BountyHook {
    function getBountyIdForContract(address contractAddress, uint chainId) external view returns (uint64);
}

// @dev This contract manages attestation data validation logic.
contract AuditManager {
    address public admin;
    mapping(bytes32 => uint64) public schemaToId;
    mapping(bytes32 => address) public schemaToHook;
    mapping(uint => mapping(address => uint64)) public chainToContractToBounty;
    mapping(uint64 => uint256) public bountyIdToBalance;
    ISP private sp;

    // --- Events ---
    event CreatedBounty(
        uint64 attestationId, uint chainId, address indexed contractAddress, address indexed attester
    );

    constructor(address _sp) {
        admin = msg.sender;
        sp = ISP(_sp);
    }

    modifier auth() {
        require(admin == msg.sender, "AuditContract/not-authorized");
        _;
    }

    function setSchema(bytes32 schemaName, uint64 schemaId) external auth {
        schemaToId[schemaName] = schemaId;
        schemaToHook[schemaName] = address(sp.getSchema(schemaId).hook);
    }

    function createBounty(uint chainId, address contractAddress) external payable auth returns (uint64 bountyId) {
        require(msg.value > 0, "AuditContrct/zero-bounty-amount");
        bytes memory data = abi.encode(contractAddress, chainId, msg.sender);

        Attestation memory a = Attestation({
            schemaId: schemaToId["bounty"],
            linkedAttestationId: 0,
            attestTimestamp: 0,
            revokeTimestamp: 0,
            attester: address(this),
            validUntil: 0,
            dataLocation: DataLocation.ONCHAIN,
            revoked: false,
            recipients: new bytes[](0),
            data: data
        });

        bountyId = sp.attest(a, "", "", "");
        bountyIdToBalance[bountyId] = msg.value;
        emit CreatedBounty(bountyId, chainId, contractAddress, msg.sender);
    }

    function getBalanceForBounty(uint64 bountyId) external view returns (uint256) {
        return bountyIdToBalance[bountyId];
    }

    function getSchemaId(bytes32 name) external view returns (uint64) {
        return schemaToId[name];
    }

    function getBountyIdForContract(address contractAddress, uint chainId) public view returns (uint64) {
        return BountyHook(schemaToHook["bounty"]).getBountyIdForContract(contractAddress, chainId);
    }

    function refundBounty(uint64 bountyId) external returns(uint256 amount) {
        amount = bountyIdToBalance[bountyId];
        require(amount > 0, "AuditContract/zero-bounty-amount");
        require(amount <= address(this).balance, "AuditContract/insufficient-balance");

        Attestation memory a = sp.getAttestation(bountyId);
        ( , , address owner) = abi.decode(a.data, (address, uint, address));
        require(owner == msg.sender, "AuditContract/wrong-bounty-owner");
        bountyIdToBalance[bountyId] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "AuditContract/refund-failed");
        _revokeBounty(bountyId);
    }

    function _revokeBounty(uint64 bountyId) private {
      sp.revoke(bountyId, "zero-balance", "", "");
    }
}
