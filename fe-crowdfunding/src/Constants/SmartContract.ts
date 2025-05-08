// src/constants/contract.ts
export const CONTRACT_ADDRESS = "0x45D7C3ef0C076C8F5d542b1147204321921e06f2";

export const CONTRACT_ABI = [
  "function donate(uint256 campaignId) public payable",
  "function getCampaigns() public view returns (tuple(address owner, string title, string description, uint256 targetAmount, uint256 currentAmount, uint256 deadline, string status)[])",
];
