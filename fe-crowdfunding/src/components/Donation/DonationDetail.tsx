import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/Constants/SmartContract";

interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  CurrentAmount: number;
  Key: Number;
  Deadline: string;
  Status: string;
  Image?: string;
  Owner: {
    Name: string;
    Email: string;
    Key: Number;
    WalletAddress?: string | null;
  };
}

const DonationDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Ambil ID dari URL
  const [donation, setDonation] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("POL"); // ✅ Default POL (Polygon Amoy Testnet)
  const [donating, setDonating] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;

    const fetchDonation = async () => {
      try {
       
        const response = await fetch(`${API_URL}/api/v1/campaigns/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
     

        setDonation(data.data);
      } catch (err: any) {
        console.error("Error fetching donation details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id, API_URL]);

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => setPopupMessage(null), 3000); // Hilangkan setelah 3 detik
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  // ✅ **Fungsi Donasi ke Smart Contract dengan POL**
  const handleDonate = async () => {
    if (!window.ethereum) {
      alert("MetaMask belum terinstal!");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Masukkan nominal donasi yang valid!");
      return;
    }

    if (currency !== "POL") {
      alert("Saat ini hanya donasi menggunakan POL di Polygon Amoy Testnet!");
      return;
    }

    try {
      setDonating(true);

      // **1. Hubungkan Wallet MetaMask**
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // **2. Menampilkan Popup MetaMask untuk mendapatkan konfirmasi dari pengguna**
      setPopupMessage("Menunggu konfirmasi transaksi di MetaMask...");

      // **3. Kirim Data ke Backend setelah MetaMask konfirmasi (tanpa kirim transaksi ke blockchain)**
      const donationData = {
        CampaignID: donation?.Key,
        DonorID: donation?.Owner.Key, // ID Donor
        Amount: amount,
      };

      // **4. Kirim Data Donasi ke Backend (Back-end akan menangani transaksi blockchain)**
      const response = await fetch(`${API_URL}/api/v1/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData), // Mengirimkan data donasi ke backend
      });

      if (!response.ok) {
        throw new Error(
          `Gagal menyimpan donasi ke backend: ${response.status}`
        );
      }

      const result = await response.json();
    

      // **5. Tampilkan Pesan Pop-up di UI untuk Konfirmasi Donasi**
      setPopupMessage("Donasi berhasil! Terima kasih atas dukungan Anda.");
    } catch (error) {
      console.error("Error saat donasi:", error);
      setPopupMessage("Gagal melakukan donasi. Coba lagi.");
    } finally {
      setDonating(false);
    }
  };

  // ✅ **Fungsi untuk Withdraw**
  const handleWithdraw = async () => {
   

    if (!donation || !donation.Key) {
      alert("Donasi tidak valid untuk ditarik.");
      return;
    }

    try {
      setWithdrawing(true);

      // Call withdraw endpoint
      const response = await fetch(`${API_URL}/api/v1/donations/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CampaignID: donation.Key,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gagal menarik donasi: ${response.status}`);
      }

      const result = await response.json();
  
      setPopupMessage("Donasi berhasil ditarik.");
    } catch (error) {
      console.error("Error saat menarik donasi:", error);
      setPopupMessage("Gagal menarik donasi. Coba lagi.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!donation)
    return <h1 className="text-center text-2xl">Donasi tidak ditemukan</h1>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md grid grid-cols-1 md:grid-cols-2 gap-8">
      {popupMessage && (
        <div className="fixed top-20 right-5 bg-green-500 text-white py-4 px-8 rounded-lg shadow-lg border-2 border-green-700 text-lg font-semibold animate-fadeIn">
          {popupMessage}
        </div>
      )}

      {/* Bagian Kiri: Detail Donasi */}
      <div className="border rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{donation.Title}</h1>

        {/* Gambar Campaign */}
        <div className="relative w-full h-[300px] rounded-md overflow-hidden mb-4">
          <Image
            src={
              donation.Image
                ? `${API_URL}${donation.Image}`
                : "/placeholder.jpg"
            }
            alt={donation.Title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>

        {/* Status Donasi */}
        <div className="mb-4">
          <span
            className={`px-4 py-2 text-white text-sm rounded-full ${
              donation.CurrentAmount >= donation.TargetAmount
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
          >
            {donation.CurrentAmount >= donation.TargetAmount
              ? "Successful"
              : "Fundraising"}
          </span>
        </div>

        {/* Informasi Pembuat Donasi */}
        <div className="mb-4 flex items-center space-x-2">
          <span className="text-gray-600">👤 {donation.Owner.Name}</span>
        </div>

        {/* Deskripsi Donasi */}
        <p className="text-gray-700 mb-4">{donation.Description}</p>

        {/* Target Donasi */}
        <p className="font-semibold">
          Target Donasi: {donation.TargetAmount} POL
        </p>

        {/* Tenggat Waktu */}
        <p className="font-semibold text-gray-800 mt-2">
          Tenggat Waktu:{" "}
          <span className="font-bold">
            {new Date(donation.Deadline).toLocaleDateString()}
          </span>
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm font-semibold mb-1">
            <span>Terkumpul</span>
            <span>Persentase</span>
            <span>Sisa Hari</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>{donation.CurrentAmount} SOL</span>
            <span>
              {Math.round(
                (donation.CurrentAmount / donation.TargetAmount) * 100
              )}
              %
            </span>
            <span>
              {Math.max(
                Math.ceil(
                  (new Date(donation.Deadline).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                ),
                0
              )}{" "}
              Hari
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className={`h-2 rounded ${
                donation.CurrentAmount >= donation.TargetAmount
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(
                  (donation.CurrentAmount / donation.TargetAmount) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
           {/* Show Withdraw Button if Campaign is Successful */}
       {donation.Status === "Completed" && donation.Owner.WalletAddress && (
        <div className="flex justify-center">
          <button
            onClick={handleWithdraw}
            className="w-full bg-red-600 text-white p-2 rounded mt-4 hover:bg-red-500 disabled:opacity-50 flex justify-center items-center"
            disabled={withdrawing}
          >
            {withdrawing ? (
              <span className="w-6 h-6 border-4 border-t-4 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Withdraw Donation"
            )}
          </button>
        </div>
      )}
        </div>
      </div>


      

      

      {/* Bagian Kanan: Form Donasi */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Donasimu</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Mata Uang</label>
          <select className="w-full px-4 py-2 border rounded">
            <option value="POL">POL</option>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nominal Donasi</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Masukkan nominal"
          />
        </div>

        <button
          className="w-full bg-gray-800 text-white p-2 rounded mt-4 hover:bg-gray-700 disabled:opacity-50 flex justify-center items-center"
          disabled={donating || !amount}
          onClick={handleDonate}
        >
          {donating ? (
            <span className="w-6 h-6 border-4 border-t-4 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Donasikan"
          )}
        </button>
      </div>
    </div>
  );
};

export default DonationDetail;
