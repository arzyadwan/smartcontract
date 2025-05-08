import { FilterQuery, Model } from "mongoose";
import { IUsers, UserModel } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserService {
  private userModel: Model<IUsers>;

  constructor() {
    this.userModel = UserModel;
  }

  async generateKey() {
    const result = await this.userModel
      .findOne({ Key: { $exists: true } })
      .sort({ Key: -1 });

    if (result && result.Key) {
      return result.Key + 1;
    }

    return 1;
  }

  async getOneUser(filter: FilterQuery<IUsers>): Promise<IUsers | null> {
    const category = await this.userModel.findOne(filter);
    return category;
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ Email: email });
  }

  async getAllUser() {
    try {
      const result = await this.userModel.find();
      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async loginUser(body: IUsers): Promise<string | null> {
    try {
      const user = await this.userModel.findOne({
        Email: body.Email,
      });

      if (!user) {
        return null;
      }

      const isMatch = await bcrypt.compare(body.Password, user.Password);

      if (!isMatch) {
        return null;
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.Email },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );

      return token;
    } catch (error) {
      throw error;
    }
  }

  async createUser(body: IUsers): Promise<IUsers | null> {
    try {
      const user = await this.userModel.findOne({
        Email: body.Email,
      });

      if (user) {
        return null;
      }
      const key = await this.generateKey();

      const newUser = new this.userModel({ ...body, Key: key });

      const savedUser = await newUser.save();

      return savedUser;
    } catch (error) {
      throw error;
    }
  }

  async connectWallet(body: IUsers) {
    try {
      // ✅ Cari user berdasarkan email
      const user = await this.userModel.findOne({ Email: body.Email });

      if (!user) {
        throw new Error("User not found");
      }

      if (!body.WalletAddress) {
        throw new Error("Wallet address is required");
      }

      // ✅ Cek apakah user sudah memiliki wallet yang berbeda sebelumnya
      if (user.WalletAddress && user.WalletAddress !== body.WalletAddress) {
        throw new Error(
          "Anda tidak bisa mengganti wallet yang sudah terhubung."
        );
      }

      // ✅ Cek apakah WalletAddress sudah digunakan oleh user lain
      const existingUser = await this.userModel.findOne({
        WalletAddress: body.WalletAddress,
      });

      if (existingUser && existingUser.Email !== user.Email) {
        throw new Error(
          "Wallet ini sudah pernah terhubung ke akun lain dan tidak bisa digunakan lagi."
        );
      }

      // ✅ Jika user yang sama menghubungkan kembali wallet, aktifkan kembali
      if (existingUser && existingUser.Email === user.Email) {
        existingUser.isConnected = true;
        await existingUser.save();
        return existingUser;
      }

      // ✅ Jika ini pertama kali wallet digunakan, kaitkan ke user
      user.WalletAddress = body.WalletAddress;
      user.isConnected = true;
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  async disconnectWallet(body: IUsers) {
    try {
      // 🔥 Cari user berdasarkan key
      const user = await this.userModel.findOne({
        WalletAddress: body.WalletAddress,
      });

      if (!user) {
        return null; // Jika user tidak ditemukan, kembalikan null
      }

      if (!user.WalletAddress) {
        throw new Error("User tidak memiliki wallet yang terhubung.");
      }

      // 🔥 Set `isConnected` menjadi false (wallet tidak aktif, tapi tetap tercatat)
      user.isConnected = false;
      await user.save();

      return user; // Kembalikan user tanpa format JSON, controller yang menangani response
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, body: IUsers) {
    try {
      const data = await this.userModel.findOne({
        _id: id,
      });
      if (!data) {
        return null;
      }

      body.Updated_at = new Date();

      const result = await this.userModel
        .findByIdAndUpdate(
          { _id: id },
          {
            ...body,
          },
          { new: true }
        )
        .exec();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const data = await this.userModel.findOne({ _id: id });
      if (!data) {
        return null;
      }

      const result = await this.userModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          {
            isDeleted: true,
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            new: true,
          }
        )
        .exec();

      return result;
    } catch (error) {
      throw error;
    }
  }
}
