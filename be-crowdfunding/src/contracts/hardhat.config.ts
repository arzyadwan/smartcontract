import "@nomiclabs/hardhat-ethers";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    polygon: {
      url: "https://polygon-amoy.infura.io/v3/7a3aca476da84aa2a9f1a2e764c5b523", // Ganti dengan RPC Polygon Amoy Anda
      accounts: [
        `e3b54f3f54d9aa6dc372a1d131ee5ff97e57d14785937b48ed8d7459fd9627e8`,
      ], // Private key tanpa `0x` di depan
    },
  },
  paths: {
    sources: "../../src/contracts", // Path ke folder yang berisi file .sol
  },
};

export default config;
