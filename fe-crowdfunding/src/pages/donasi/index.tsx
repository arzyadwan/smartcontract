import { useEffect, useState } from "react";
import Template from "@/templates/Template";
import Link from "next/link";
import Image from "next/image";
import ReactPaginate from "react-paginate";

interface Campaign {
  _id: string;
  Title: string;
  Description: string;
  TargetAmount: number;
  CurrentAmount: number;
  Deadline: string;
  Status: string;
  Image?: string;
  Created_at: string;
}

const Donasi = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0); // Menyimpan total data
  const itemsPerPage = 8;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
      
        const response = await fetch(
          `${API_URL}/api/v1/campaigns?limit=${itemsPerPage}&sort=-Created_at&page=${currentPage + 1}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
      

        setCampaigns(result.data.campaigns);
        setTotalCampaigns(result.data.total); // Set total campaign
      } catch (err: any) {
        console.error("Error fetching campaigns:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [currentPage]);

  // Perhitungan pageCount berdasarkan totalCampaigns
  const pageCount = Math.ceil(totalCampaigns / itemsPerPage);

  return (
    <Template>
      <h3 className="text-4xl font-semibold mt-10 text-center">Donasi</h3>

      {loading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 px-4 md:px-8">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <Link
                key={campaign._id}
                href={`/donasi/${campaign._id}`}
                className="block p-4 border rounded-lg shadow-md text-left hover:shadow-xl transition duration-300 bg-white"
              >
                <div className="w-full h-40 relative overflow-hidden rounded-md">
                  {campaign.Image ? (
                    <Image
                      src={`${API_URL}${campaign.Image}`}
                      alt={campaign.Title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      Image Placeholder
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-semibold mt-2 truncate">
                  {campaign.Title}
                </h4>
                <p className="text-gray-800 font-bold">
                  {campaign.CurrentAmount.toLocaleString()} POL / {campaign.TargetAmount.toLocaleString()} POL
                </p>
                <p className="text-gray-600 text-sm truncate">
                  {campaign.Description}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  ⏳ Deadline: <span className="font-bold">
                    {new Date(campaign.Deadline).toLocaleDateString()}
                  </span>
                </p>
                <p className={`text-sm font-bold mt-2 ${campaign.Status === "Active" ? "text-green-500" : "text-red-500"}`}>
                  Status: {campaign.Status}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No campaigns found.
            </p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8">
        <ReactPaginate
          previousLabel={"⬅ Prev"}
          nextLabel={"Next ➡"}
          breakLabel={"..."}
          pageCount={pageCount} // Menggunakan pageCount yang telah dihitung berdasarkan total
          marginPagesDisplayed={2}
          pageRangeDisplayed={4}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          containerClassName={"pagination flex gap-2"}
          activeClassName={"bg-blue-500 text-white rounded px-3 py-1"}
          pageClassName={"border rounded px-3 py-1 hover:bg-gray-200"}
          previousClassName={"border rounded px-3 py-1 hover:bg-gray-200"}
          nextClassName={"border rounded px-3 py-1 hover:bg-gray-200"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
        />
      </div>
    </Template>
  );
};

export default Donasi;
