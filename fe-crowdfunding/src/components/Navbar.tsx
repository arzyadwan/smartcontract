import Link from "next/link";
import { useAuth } from "@/components/AuthContent";
import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // ✅ Import useRouter

const Navbar = () => {
  const { user, logout, setWalletAddress } = useAuth(); // ✅ Tambahkan setWalletAddress
  
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // ✅ State untuk hamburger menu
  const router = useRouter(); // ✅ Gunakan useRouter untuk redirect

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    logout(); // Logout user & hapus token
    setWalletAddress(null); // ⬅️ Hapus wallet dari state
    localStorage.removeItem("userKey");
    router.push("/"); // Redirect ke halaman utama
  };

  // Function to check if the current page matches the link
  const isActiveLink = (link: string) => router.pathname === link;

  return (
    <nav className="bg-gray-300 p-4 shadow-md flex justify-between items-center relative">
      {/* Logo */}
      <div className="text-2xl font-bold text-pink-500">🅱</div>

      {/* Menu Navigasi di Tengah */}
      <div className="hidden lg:flex-grow lg:flex justify-center space-x-6">
        <Link href="/">
          <div
            className={isActiveLink("/") ? "font-bold text-black-300" : "text-black"}
          >
            Home
          </div>
        </Link>
        <Link href="/donasi">
          <div
            className={isActiveLink("/donasi") ? "font-bold text-black-300" : "text-black"}
          >
            Donasi
          </div>
        </Link>
        <Link href="/campaign">
          <div
            className={isActiveLink("/campaign") ? "font-bold text-black-300" : "text-black"}
          >
            Buat Campaign
          </div>
        </Link>
      </div>

      {/* Tombol Hamburger untuk Mobile */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">
          {isOpen ? "✖️" : "☰"} {/* Toggle hamburger menu */}
        </button>
      </div>

      {/* Tombol Sign In dan Register atau User Info */}
      <div className="space-x-4 flex items-center">
        {isClient ? (
          user ? (
            <>
              <Link href="/profile">
                <div className="text-gray-700 cursor-pointer hover:underline text-sm lg:text-base">
                  👤 {user.email}
                </div>
              </Link>
              <button
                onClick={handleLogout} // ✅ Panggil handleLogout saat klik
                className="bg-red-500 text-white px-4 py-2 rounded text-xs lg:text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <button className=" text-black px-4 py-2 text-xs lg:text-sm">Login</button>
              </Link>
              <Link href="/auth/register">
                <button className=" text-black px-4 py-2 text-xs lg:text-sm">Register</button>
              </Link>
            </>
          )
        ) : null}
      </div>

      {/* Dropdown Menu untuk Mobile */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-gray-300 flex flex-col items-center space-y-4 p-4">
          <Link href="/">
            <div className={isActiveLink("/") ? "font-bold text-black-300" : "text-black"}>Home</div>
          </Link>
          <Link href="/donasi">
            <div className={isActiveLink("/donasi") ? "font-bold text-black-300" : "text-black"}>Donasi</div>
          </Link>
          <Link href="/campaign">
            <div className={isActiveLink("/campaign") ? "font-bold text-black-300" : "text-black"}>Buat Campaign</div>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
