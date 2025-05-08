import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// 🔹 Tipe data untuk user
interface User {
  email: string;
  name?: string;
}

// 🔹 Tipe data untuk AuthContext
interface AuthContextType {
  user: User | null;
  wallet: string | null; // ⬅️ Tambahkan state wallet
  login: (token: string) => void;
  logout: () => void;
  setWalletAddress: (address: string | null) => void; // ⬅️ Fungsi untuk set wallet
}

// 🔹 Buat Context dengan tipe `AuthContextType`
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWalletAddress] = useState<string | null>(null); // ⬅️ State wallet

  // 🔹 Cek token dan wallet saat pertama kali load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedWallet = localStorage.getItem("wallet"); // ⬅️ Cek wallet di localStorage

    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
        setUser({ email: decoded.email });
      } catch (error) {
        console.error("Invalid token", error);
      }
    }

    if (savedWallet) {
      setWalletAddress(savedWallet); // ⬅️ Set wallet jika ada di localStorage
    }
  }, []);

  // 🔹 Fungsi login
  const login = (token: string) => {
    localStorage.setItem("token", token);
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      setUser({ email: decoded.email });
    } catch (error) {
      console.error("Invalid token", error);
    }
  };

  // 🔹 Fungsi logout (hapus token & wallet)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("wallet"); // ⬅️ Hapus wallet dari localStorage
    setUser(null);
    setWalletAddress(null); // ⬅️ Hapus wallet dari state
  };

  return (
    <AuthContext.Provider value={{ user, wallet, login, logout, setWalletAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook untuk menggunakan AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
