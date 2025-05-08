import Template from "@/templates/Template";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 **Update nilai form saat user mengetik**
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 **Handle submit form registrasi**
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // **Validasi Password**
    if (formData.password.length < 6) {
      setErrorMessage("Password harus memiliki minimal 6 karakter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 🔥 **API Register ke Backend**
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
        {
          Name: formData.nama,
          Email: formData.email,
          Password: formData.password,
        }
      );

      if (response.status === 201) {
        setSuccessMessage("Registrasi berhasil! Silakan login.");
        setTimeout(() => {
          window.location.href = "/auth/signin"; // Redirect ke halaman login
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Terjadi kesalahan saat registrasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Template>
      <div className="flex items-center justify-center min-h-screen bg-white-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>

          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Nama</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded mt-1"
                placeholder="Nama"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded mt-1"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded mt-1"
                placeholder="Password"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Konfirmasi Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded mt-1"
                placeholder="Konfirmasi Password"
                required
              />
            </div>
            <p className="text-center text-gray-600 text-sm mb-4">
              Sudah punya akun?{" "}
              <Link href="/auth/signin" className="font-semibold text-black">
                login disini
              </Link>
            </p>
            <button
              type="submit"
              className="w-full bg-black text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </Template>
  );
};

export default Register;
  