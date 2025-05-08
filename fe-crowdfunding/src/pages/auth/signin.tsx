import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthContent";
import { useRouter } from "next/router";
import Template from "@/templates/Template";

const SignIn = () => {
  const { login } = useAuth(); // Ambil fungsi login dari Context
  const router = useRouter();
  const [formData, setFormData] = useState({ Email: "", Password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle input perubahan
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle submit form login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Kirim dengan format kapital "Email" dan "Password"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      // Simpan token ke context dan localStorage
      login(data.data.user);

      // Redirect ke halaman utama setelah login sukses
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Template>
    <div className="flex items-center justify-center min-h-screen bg-white-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="Email" // 🔹 Ubah menjadi "Email" (Kapital)
              value={formData.Email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded mt-1"
              placeholder="Email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="Password" // 🔹 Ubah menjadi "Password" (Kapital)
              value={formData.Password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded mt-1"
              placeholder="Password"
              required
            />
          </div>

          <p className="text-center text-gray-600 text-sm mb-4">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="font-semibold text-black">
              daftar disini
            </Link>
          </p>

          <button
            type="submit"
            className="w-full bg-black text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
    </Template>
  );
};

export default SignIn;
