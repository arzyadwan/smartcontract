import express, { Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { CampaignController } from "../controllers/campaign.controller";
import { DonationController } from "../controllers/donation.controller";
import authenticateToken from "../middlewares/authenticateToken";
import { ProfileController } from "../controllers/profile.controller";
import { upload, processImage } from "../middlewares/multer";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();

const privateKey = process.env.PRIVATE_KEY || ""; // Ambil private key dari .env

const userController = new UserController();
const campaignController = new CampaignController();
const donationController = new DonationController(privateKey);
const profileController = new ProfileController();
const paymentController = new PaymentController();

// User Routes
router.post("/users/login", userController.LoginUser);
router.post("/users/connect-wallet", userController.ConnectWallet);
router.post("/users/disconnect-wallet", userController.DisconnectWallet);
router.get("/users", userController.GetAllUsers);
router.post("/users", userController.CreateUser);
router.put("/users/:id", userController.UpdateUser);
router.delete("/users/:id", userController.DeleteUser);

// Campaign Routes
router.get("/campaigns", campaignController.GetAllCampaigns);
router.get("/campaigns/:id", campaignController.GetAllCampaignsById);
router.post(
  "/campaigns",
  upload.single("Image"),
  processImage,
  campaignController.CreateCampaign
);
router.put("/campaigns/:id", campaignController.UpdateCampaign);
router.delete("/campaigns/:id", campaignController.DeleteCampaign);

// Donation Routes

router.post("/donations", donationController.CreateDonation);
router.post("/donations/withdraw", donationController.WithdrawDonation);

//Profile Routes

router.get("/profile", authenticateToken, profileController.GetProfile);
router.put(
  "/profile/:id",
  upload.single("Image"),
  processImage,
  profileController.UpdateProfile
);
router.delete(
  "/profile/:id",
  authenticateToken,
  profileController.DeleteProfile
);

router.get("/payments", paymentController.GetPayment);
router.post("/payments", paymentController.CreatePayment);
router.put("/payments/:id", paymentController.UpdatePayment);
router.delete("/payments/:id", paymentController.DeletePayment);

export default router;
