import Template from "@/templates/Template";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  wallet: string | null;
  Image: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Profile = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // State for image file

  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user?.Image}`;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 🔥 **Fetch data profil dari API**
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing");
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/profile`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Tambahkan token di header
        },
      });

      const profileData = response.data.data;
   

      const profileDataKey = response.data.data.Key;
  

      const ownerID = localStorage.setItem("userKey", profileDataKey);

      if (profileData.WalletAddress) {
        localStorage.setItem("wallet", profileData.WalletAddress);
      }

      setUser({
        _id: profileData._id,
        name: profileData.Name,
        email: profileData.Email,
        wallet: profileData.WalletAddress,
        Image: profileData.Image || "/profile-placeholder.png",
      });

      setWallet(profileData.WalletAddress);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to fetch user profile");
      router.push("/auth/signin");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 **Update Profile Image**
  const updateProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("Image", file); 

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing");
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/v1/profile/${user?._id}`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", 
          },
        }
      );

      setUser({
        ...user,
        _id: response.data.data._id || "", // Defaultkan _id ke string kosong jika tidak ada
        name: response.data.data.Name || "", // Defaultkan name jika undefined
        email: response.data.data.Email || "", // Defaultkan email jika undefined
        wallet: response.data.data.WalletAddress || null, // Defaultkan wallet ke null jika tidak ada
        Image: response.data.data.Image || "/profile-placeholder.png", // Defaultkan Image jika undefined
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
      setError("Failed to update profile image");
    }
  };

  // 🔥 **Handle file input for image upload**
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]); // Set the selected file
      updateProfileImage(e.target.files[0]); // Call function to upload and update profile image
    }
  };

  // 🔥 **Connect Wallet using MetaMask**
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask tidak ditemukan. Silakan instal MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];


      if (wallet === walletAddress) {
       
        return;
      }

      // 🔥 Kirim permintaan ke backend untuk koneksi wallet
      const response = await axios.post(
        `${API_URL}/api/v1/users/connect-wallet`,
        {
          WalletAddress: walletAddress,
          Name: user?.name,
          Email: user?.email,
        }
      );

      
      setWallet(walletAddress);
      setUser((prevUser) =>
        prevUser ? { ...prevUser, wallet: walletAddress } : null
      );

      // 🔥 Redirect ke profile setelah sukses
      router.push("/profile");
      setTimeout(() => {
        window.location.reload(); // 🔥 Hard refresh agar state diperbarui
      }, 500);
    } catch (error: any) {
      console.error("Backend Error:", error);
      setError(error.response?.data?.message || "Gagal menghubungkan wallet.");

      // 🔥 Jika gagal, tetap fetch ulang profile
      await fetchUserProfile();

      // 🔥 Redirect ke profile setelah error
      router.push("/profile");
      setTimeout(() => {
        window.location.reload(); // 🔥 Hard refresh setelah redirect
      }, 500);
    }

    setIsModalOpen(false);
  };

  // 🔥 **Disconnect Wallet**
  const disconnectWallet = async () => {
    if (!wallet) return;

    try {
      await axios.post(`${API_URL}/api/v1/users/disconnect-wallet`, {
        WalletAddress: wallet,
      });

      setWallet(null);
      setUser((prevUser) => (prevUser ? { ...prevUser, wallet: null } : null));
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setError("Gagal memutuskan koneksi wallet.");
    }
  };

  return (
    <Template>
      <div className="flex justify-center items-center min-h-screen bg-white-100">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-6 w-full max-w-lg border border-black">
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : user ? (
            <>
              {/* Foto Profil */}
              <div
                className="cursor-pointer"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <Image
                  src={imageUrl || "/profile-placeholder.png"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              </div>

              {/* Informasi Pengguna */}
              <div>
                <p className="text-gray-600">Nama</p>
                <h2 className="text-lg font-semibold">{user.name}</h2>

                <p className="text-gray-600 mt-2">Email</p>
                <h3 className="text-gray-800">{user.email}</h3>

                <p className="text-gray-600 mt-2">Wallet Address</p>
                {wallet ? (
                  <>
                    <h3 className="text-gray-800 font-semibold">{wallet}</h3>
                    <button
                      onClick={disconnectWallet}
                      className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Disconnect Wallet
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-500 font-semibold"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* Input file untuk gambar */}
              <input
                id="fileInput"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }} // Menyembunyikan input file
              />
            </>
          ) : (
            <p className="text-gray-600">User data not found.</p>
          )}
        </div>

        {/* Modal Pop-up untuk Connect Wallet */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
              <button
                onClick={connectWallet}
                className="w-full bg-black text-white px-4 py-2 rounded"
              >
                Connect Wallet
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-2 bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Template>
  );
};

export default Profile;
