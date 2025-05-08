import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  Image?: string;
  CurrentAmount: number;
  Deadline: string;
  Status: string;
  Created_at: string;
}

const HomeRecentDonasi = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/campaigns?limit=6&sort=-Created_at`);
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
        setCampaigns(data.data.campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h3 className="text-4xl font-semibold text-center mb-6">Donasi Terbaru</h3>
      
      {/* Grid Campaign (2 baris, 3 kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <Link key={campaign._id} href={`/donasi/${campaign._id}`} className="block">
              <div className="p-4 border rounded-lg shadow-lg bg-white transition hover:shadow-xl cursor-pointer">
                {/* Gambar */}
                <div className="relative w-full h-[200px]">
                  <Image
                    src={campaign.Image ? `${API_URL}${campaign.Image}` : "/placeholder.jpg"}
                    alt={campaign.Title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>

                {/* Informasi Campaign */}
                <div className="p-4">
                  <h4 className="text-lg font-bold">{campaign.Title}</h4>
                  <p className="text-gray-800 font-semibold">
                    {campaign.CurrentAmount} POL / {campaign.TargetAmount} POL
                  </p>
                  <p className="text-gray-600 truncate">{campaign.Description}</p>
                  <p className="text-gray-500 text-sm">Created: {new Date(campaign.Created_at).toLocaleDateString()}</p>
                  <p className="text-gray-500 text-sm">Deadline: {new Date(campaign.Deadline).toLocaleDateString()}</p>
                  <p className={`text-md font-bold ${campaign.Status === "Active" ? "text-green-600" : "text-red-600"}`}>
                    Status: {campaign.Status}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No campaigns found.</p>
        )}
      </div>

      {/* Tombol "Lebih Banyak" */}
      <div className="flex justify-center mt-8">
        <Link href="/donasi">
          <button className="bg-blue-500 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-600 transition">
            Klik Selengkapnya
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomeRecentDonasi;