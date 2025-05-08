import mongoose, { FilterQuery, Model, SortOrder } from "mongoose";
import { ICampaigns, CampaignModel } from "../models/campaignModel";

interface FilterOptions {
  limit?: number;
  sort?: string;
  page?: number;
}
export class CampaignService {
  private CampaignModel: Model<ICampaigns>;

  constructor() {
    this.CampaignModel = CampaignModel;
  }

  async generateKey() {
    const result = await this.CampaignModel.findOne({
      Key: { $exists: true },
    }).sort({ Key: -1 });

    if (result && result.Key) {
      return result.Key + 1;
    }

    return 1;
  }

  async getOneCampaign(
    filter: FilterQuery<ICampaigns>
  ): Promise<ICampaigns | null> {
    const category = await this.CampaignModel.findOne(filter);
    return category;
  }

  async getAllCampaign() {
    try {
      const result = await this.CampaignModel.find();

      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getCampaignById(id: string) {
    try {
      if (!id) {
        throw new Error("ID is required");
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid campaign ID format");
      }

      const campaign = await this.CampaignModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) }, // Cari campaign berdasarkan real _id
        },
        {
          $lookup: {
            from: "users",
            let: { ownerID: "$OwnerID" }, // Ambil OwnerID dari campaign
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$Key", { $toInt: "$$ownerID" }], // Cocokkan Key di users dengan OwnerID yang dikonversi ke angka
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  Name: 1,
                  Email: 1,
                  Key: 1,
                  WalletAddress: 1,
                },
              }, // Pilih hanya field yang diperlukan
            ],
            as: "Owner",
          },
        },
        {
          $unwind: { path: "$Owner", preserveNullAndEmptyArrays: true }, // Pastikan tidak menghapus campaign jika owner tidak ditemukan
        },
      ]);

      if (!campaign || campaign.length === 0) {
        throw new Error("Campaign not found");
      }

      return campaign[0]; // Ambil elemen pertama karena hasil aggregate berupa array
    } catch (error) {
      console.error("Error fetching campaign by ID:", error);
      throw error;
    }
  }

  async getCampaign(ownerId?: string) {
    try {
      const pipeline: any[] = [
        {
          $lookup: {
            from: "users",
            let: { ownerIdStr: { $toString: "$OwnerID" } },
            pipeline: [
              {
                $addFields: {
                  keyString: { $toString: "$key" },
                },
              },
              {
                $match: {
                  $expr: { $eq: ["$keyString", "$$ownerIdStr"] },
                },
              },
            ],
            as: "Owner",
          },
        },
        { $unwind: "$Owner" },
        {
          $project: {
            _id: 1,
            Title: 1,
            Description: 1,
            key: 1,
            TargetAmount: 1,
            CurrentAmount: 1,
            Deadline: 1,
            Status: 1,
            Owner: {
              Name: "$Owner.Name",
              Email: "$Owner.Email",
              WalletAddress: "$Owner.WalletAddress",
            },
          },
        },
      ];

      // 🟢 Tambahkan Filter Berdasarkan OwnerID Jika Diberikan
      if (ownerId) {
        pipeline.unshift({ $match: { OwnerID: ownerId } });
      }

      const result = await this.CampaignModel.aggregate(pipeline);

      return result;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      throw new Error("Failed to fetch campaign data");
    }
  }

  async getFilteredCampaigns(options: FilterOptions) {
    try {
      const { limit = 6, sort = "-Created_at", page = 1 } = options;

      let sortField = sort.startsWith("-") ? sort.substring(1) : sort;
      let sortOrder: SortOrder = sort.startsWith("-") ? -1 : 1;

      const sortObj: { [key: string]: SortOrder } = { [sortField]: sortOrder };

      // Hitung offset berdasarkan page dan limit
      const offset = (page - 1) * limit;

      // Query dengan sorting
      const campaigns = await CampaignModel.find({})
        .sort(sortObj) // ✅ Gunakan sorting berdasarkan nama field yang benar
        .skip(offset)
        .limit(limit)
        .select(
          "_id Title Description TargetAmount Image CurrentAmount Deadline Status Created_at"
        );

      const total = await CampaignModel.countDocuments();

      return { campaigns, total };
    } catch (error) {
      throw error;
    }
  }

  async createCampaign(body: ICampaigns): Promise<ICampaigns | null> {
    try {
      const campaign = await this.CampaignModel.findOne({
        Title: body.Title,
        OwnerID: body.OwnerID,
      });

      if (campaign) {
        // Jika campaign sudah ada, kembalikan null atau error sesuai kebutuhan
        return null;
      }
      const key = await this.generateKey();

      const newCampaign = new this.CampaignModel({ ...body, Key: key });

      return await newCampaign.save();
    } catch (error) {
      throw error;
    }
  }

  async updateCampaign(id: string, body: ICampaigns) {
    try {
      const data = await this.CampaignModel.findOne({
        _id: id,
      });
      if (!data) {
        return null;
      }

      body.Updated_at = new Date();

      const result = await this.CampaignModel.findByIdAndUpdate(
        { _id: id },
        {
          ...body,
        },
        { new: true }
      ).exec();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateStatusCampaign(
    CampaignID: string,
    Status: string
  ): Promise<boolean> {
    try {
      // Cek apakah CampaignID valid
      if (!CampaignID) {
        console.error("🚨 Error: CampaignID is missing");
        return false;
      }

      // Cek apakah campaign dengan `key` yang diberikan ada di database sebelum update
      const campaignBeforeUpdate = await CampaignModel.findOne({
        Key: CampaignID,
      });
      if (!campaignBeforeUpdate) {
        console.error(`🚨 Error: No campaign found with key ${CampaignID}`);
        return false;
      }

      // Proses update CurrentAmount dengan $inc
      const updateResult = await CampaignModel.updateOne(
        { Key: CampaignID },
        { $set: { Status: Status } }
      );

      return true;
    } catch (error) {
      console.error("🚨 Error in updateOneCampaign:", error);
      throw error;
    }
  }

  async updateOneCampaign(
    CampaignID: string,
    Amount: number
  ): Promise<boolean> {
    try {
      // Cek apakah CampaignID valid
      if (!CampaignID) {
        console.error("🚨 Error: CampaignID is missing");
        return false;
      }

      // Cek apakah Amount valid
      if (typeof Amount !== "number" || isNaN(Amount) || Amount <= 0) {
        console.error("🚨 Error: Invalid Amount value", Amount);
        return false;
      }

      // Cek apakah campaign dengan `key` yang diberikan ada di database sebelum update
      const campaignBeforeUpdate = await CampaignModel.findOne({
        Key: CampaignID,
      });
      if (!campaignBeforeUpdate) {
        console.error(`🚨 Error: No campaign found with key ${CampaignID}`);
        return false;
      }

      // Proses update CurrentAmount dengan $inc
      const updateResult = await CampaignModel.updateOne(
        { Key: CampaignID },
        { $inc: { CurrentAmount: Amount } }
      );

      // Cek apakah update berhasil dengan mengambil kembali data dari database
      const campaignAfterUpdate = await CampaignModel.findOne({
        Key: CampaignID,
      });

      if (updateResult.modifiedCount === 0) {
        console.error(`🚨 Error: Campaign update failed for key ${CampaignID}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("🚨 Error in updateOneCampaign:", error);
      throw error;
    }
  }

  async deleteCampaign(id: string) {
    try {
      const data = await this.CampaignModel.findOne({ _id: id });
      if (!data) {
        return null;
      }

      const result = await this.CampaignModel.findByIdAndUpdate(
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
      ).exec();

      return result;
    } catch (error) {
      throw error;
    }
  }
}
