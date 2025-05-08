import Template from "@/templates/Template";
import { useEffect, useState } from "react";

const Campaign = () => {
  const [title, setTitle] = useState("");
  const [nominal, setNominal] = useState(10);
  const [date, setDate] = useState("2025-01-10");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // ⬅️ Loading state
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ownerID, setOwnerID] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const [popupSuccessMessage, setPopupSuccessMessage] = useState<string | null>(null)

  // Ambil API_URL dari global state atau environment variable
  const API_URL = (globalThis as any)._?.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const storedWallet = localStorage.getItem("wallet");
  
    
    if (storedWallet) {
      setWalletConnected(true);
      setWalletAddress(storedWallet);
    }
    const storedOwnerID = localStorage.getItem("userKey");
    if (storedOwnerID) {
      setOwnerID(storedOwnerID);
    }

     // Menggunakan API eksternal seperti MetaMask (ethereum) untuk memantau status wallet
     if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("disconnect", handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      }
    };



  }, []);

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => setPopupMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  useEffect(() => {
    if (popupSuccessMessage) {
      const timer = setTimeout(() => setPopupSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popupSuccessMessage]);

   // Handler untuk perubahan akun
   const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // Wallet disconnected
      setWalletConnected(false);
      setWalletAddress(null);
      localStorage.removeItem("wallet");
      setPopupMessage("Wallet terputus. Silakan hubungkan kembali.");
      setTimeout(() => setPopupMessage(null), 5000); // Hapus popup setelah 5 detik
    } else {
      // Wallet connected
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
      localStorage.setItem("wallet", accounts[0]);
      setPopupMessage(null); // Hapus popup jika wallet berhasil terkoneksi
    }
  };

  // Handler untuk disconnect event
  const handleDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    localStorage.removeItem("wallet");
    setPopupMessage("Wallet terputus. Silakan hubungkan kembali.");
    setTimeout(() => setPopupMessage(null), 5000); // Hapus popup setelah 5 detik
  };

  const handleSubmit = async () => {
    if (!walletConnected) {
      setPopupMessage("User belum konek wallet");
      setTimeout(() => setPopupMessage(null), 3000);
      return;
    }
    if (!title) {
      setError({ field: "title", message: "Judul harus diisi!" });
      return;
    }
    if (!nominal) {
      setError({ field: "nominal", message: "Nominal harus diisi!" });
      return;
    }
    if (!date) {
      setError({ field: "date", message: "Tanggal harus diisi!" });
      return;
    }
    if (!description) {
      setError({ field: "description", message: "Deskripsi harus diisi!" });
      return;
    }
    if (!file) {
      setError({ field: "file", message: "Gambar harus diunggah!" });
      return;
    }
    if (!ownerID) {
      setPopupMessage("User tidak memiliki OwnerID. Silakan login ulang.");
      setTimeout(() => setPopupMessage(null), 3000);
      setError({ message: "User tidak memiliki OwnerID. Silakan login ulang." });
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("TargetAmount", nominal.toString());
    formData.append("Deadline", new Date(date).toISOString());
    formData.append("Description", description);
    formData.append("Status", "Active");
    formData.append("OwnerID", ownerID);
    formData.append("Image", file); 

    try {
      const response = await fetch(`${API_URL}/api/v1/campaigns`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal membuat campaign!");
      }

      setPopupSuccessMessage("Campaign berhasil dibuat!");
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : "Terjadi kesalahan!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Template>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center mb-4">Buat Campaign</h2>

        {/* Popup Kesalahan */}
        {popupMessage && (
          <div className="fixed top-20 right-5 bg-red-500 text-white py-4 px-8 rounded-lg shadow-lg border-2 border-red-700 text-lg font-semibold animate-fadeIn">
            {popupMessage}
          </div>
        )}

        {/* Popup Sukses */}
        {popupSuccessMessage && (
          <div className="fixed top-28 right-5 bg-green-500 text-white py-4 px-8 rounded-lg shadow-lg border-2 border-green-700 text-lg font-semibold animate-fadeIn">
            {popupSuccessMessage}
          </div>
        )}
        {/* Judul */}
        <div className="mb-4">
          <label className="block text-gray-700">Judul</label>
          <input
            type="text"
            className={`w-full p-2 border ${error?.field === "title" ? "border-red-500" : "border-gray-300"} rounded`}
            placeholder="Masukkan judul campaign"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error?.field === "title" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>

        <div className="flex gap-4 mb-4">
          {/* Nominal */}
          <div className="w-1/2">
            <label className="block text-gray-700">Nominal</label>
            <input
              type="number"
              className={`w-full p-2 border ${error?.field === "nominal" ? "border-red-500" : "border-gray-300"} rounded`}
              placeholder="Masukkan nominal"
              value={nominal}
              onChange={(e) => setNominal(parseFloat(e.target.value))}
            />
            {error?.field === "nominal" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
          </div>

          {/* Tenggat Waktu */}
          <div className="w-1/2">
            <label className="block text-gray-700">Tenggat Waktu</label>
            <input
              type="date"
              className={`w-full p-2 border ${error?.field === "date" ? "border-red-500" : "border-gray-300"} rounded`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {error?.field === "date" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Deskripsi</label>
          <textarea
            className={`w-full p-2 border ${error?.field === "description" ? "border-red-500" : "border-gray-300"} rounded`}
            rows={4}
            placeholder="Deskripsikan campaign..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {error?.field === "description" && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>



        {/* Upload Gambar */}
        <div className="mt-4">
          <label className="block text-gray-700">Gambar</label>
          <input
            type="file"
            className="border border-gray-300 p-2 rounded w-full"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          {file && <p className="text-sm text-gray-500">{file.name}</p>}
        </div>

        {/* Tombol Buat Campaign */}
        <button
          className="w-full bg-gray-800 text-white p-2 rounded mt-4 hover:bg-gray-700 disabled:opacity-50 flex justify-center items-center"
          onClick={handleSubmit}
          disabled={loading} // Disable saat loading
        >
          {loading ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          ) : (
            "Buat Campaign"
          )}
        </button>

  

      </div>
    </Template>
  );
};

export default Campaign;
