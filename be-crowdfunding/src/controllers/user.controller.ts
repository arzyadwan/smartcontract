import { Request, Response } from "express";

import { IUsers } from "../models/userModel";
import { newErrorResponse, newSuccessResponse } from "../utils/response";
import { UserService } from "../services/user.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { campaignABI } from "../ABI/abi";
import { ethers } from "ethers";
export class UserController {
  private userService: UserService;

  private contractAddress: string;
  private abi: any[];
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.userService = new UserService();

    this.contractAddress = `${process.env.CONTRACT_ADDRESS}`;
    this.abi = campaignABI;
    this.provider = new ethers.providers.JsonRpcProvider(
      `${process.env.INFURA_KEY}`
    );
    this.signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`);
    this.contract = new ethers.Contract(
      this.contractAddress,
      this.abi,
      this.signer
    );

    this.LoginUser = this.LoginUser.bind(this);
    this.ConnectWallet = this.ConnectWallet.bind(this);
    this.DisconnectWallet = this.DisconnectWallet.bind(this);
    this.GetAllUsers = this.GetAllUsers.bind(this);
    this.CreateUser = this.CreateUser.bind(this);
    this.UpdateUser = this.UpdateUser.bind(this);
    this.DeleteUser = this.DeleteUser.bind(this);
  }

  async GetAllUsers(req: Request, res: Response) {
    try {
      const result = await this.userService.getAllUser();

      if (!result) {
        res.status(400).json(newErrorResponse("User not found"));
        return;
      }

      res.status(200).json(newSuccessResponse("User get successfully", result));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error get all users"));
    }
  }

  async LoginUser(req: Request, res: Response): Promise<void> {
    try {
      const body: IUsers = req.body;

      const user = await this.userService.loginUser({
        ...body,
      });

      if (!user) {
        res.status(401).json(newErrorResponse("Invalid email or password"));
        return;
      }

      res.status(200).json(newSuccessResponse("Login successful", { user }));
    } catch (error) {
      console.log(error);
      res.status(500).json(newErrorResponse("Error logging in user"));
    }
  }

  async CreateUser(req: Request, res: Response): Promise<void> {
    try {
      const body: IUsers = req.body;

      const result = await this.userService.createUser({
        ...body,
      });

      if (!result) {
        res
          .status(400)
          .json(newErrorResponse(`User with Email ${body.Name} already exist`));
        return;
      }

      res.status(201).json(newSuccessResponse("User created successfully"));
    } catch (error) {
      console.log(error);

      res.status(500).json(newErrorResponse("Error creating user"));
    }
  }

  async ConnectWallet(req: Request, res: Response): Promise<void> {
    try {
      const contractAddress = this.contractAddress;
      const abi = this.abi;

      const provider = this.provider;

      const privateKey = this.signer;

      const signer = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const body: IUsers = req.body;

      if (!body.WalletAddress) {
        res.status(400).json({ message: "Wallet address is required" });
        return;
      }

      // ✅ Panggil service untuk connect wallet & update database
      const user = await this.userService.connectWallet({
        ...body,
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const gasPrice = await provider.getGasPrice();

      const balance = await provider.getBalance(signer.address);

      // ✅ Panggil Smart Contract untuk menyimpan user di blockchain
      const tx = await contract.registerUser(
        body.WalletAddress?.toString(),
        body.Name.toString(),
        body.Email?.toString(),
        {
          gasLimit: ethers.utils.hexlify(500000),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice.mul(2)),
          maxFeePerGas: ethers.utils.hexlify(gasPrice.mul(3)),
        }
      );

      // await tx.wait();

      res
        .status(201)
        .json(newSuccessResponse("User connect wallet successfully", user));
    } catch (error) {
      console.log("Error", error);

      res.status(500).json(newErrorResponse("Error connect wallet user"));
    }
  }

  async DisconnectWallet(req: Request, res: Response): Promise<void> {
    try {
      const body: IUsers = req.body;

      const user = await this.userService.disconnectWallet({
        ...body,
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res
        .status(201)
        .json(newSuccessResponse("User disconnect wallet successfully", user));
    } catch (error) {
      console.log("Error", error);

      res.status(500).json(newErrorResponse("Error disconnect wallet user"));
    }
  }

  async UpdateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body: IUsers = req.body;

      const result = await this.userService.updateUser(id, {
        ...body,
      });
      if (!result) {
        res
          .status(403)
          .json(newErrorResponse(`User with name ${body.Name} not found`));
        return;
      }

      res.status(200).json(newSuccessResponse("Update user succesfully"));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error updated user"));
    }
  }

  async DeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);
      if (!result) {
        res.status(403).json(newErrorResponse(`User with _id ${id} not found`));
      }

      res.status(200).json(newSuccessResponse("Delete user succesfully"));
    } catch (error) {
      res.status(500).json(newErrorResponse("Error delete user"));
    }
  }
}
