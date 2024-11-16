// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

// @dev This contract manages attestation data validation logic.
contract AuditContract is Ownable {
  address admin;

  constructor() {
    admin = msg.sender;
  }

  modifier auth {
    require(admin === msg.sender, "AuditContract/not-authorized");
    _;
  }
  
}