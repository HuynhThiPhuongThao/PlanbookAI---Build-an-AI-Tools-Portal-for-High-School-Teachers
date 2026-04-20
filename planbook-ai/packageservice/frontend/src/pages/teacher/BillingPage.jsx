import React, { useState, useEffect } from 'react';
import packageApi from '../../services/packageApi';
import PackageCard from '../../components/package/PackageCard';

const BillingPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packageApi.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách gói:", error);
      setMessage("Không thể tải danh sách gói cước. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = async (packageId) => {
    if (!window.confirm("Xác nhận mua gói này?")) return;

    try {
      await packageApi.subscribePackage(packageId);
      setMessage("Yêu cầu mua gói đã được gửi. Vui lòng chờ xác nhận thanh toán!");
      
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error(error);
      setMessage("Có lỗi xảy ra khi mua gói. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return <div className="text-center py-20">Đang tải danh sách gói cước...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Gói Cước & Thanh Toán</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Chọn gói phù hợp để trải nghiệm đầy đủ tính năng AI của PlanbookAI
        </p>
      </div>

      {message && (
        <div className="max-w-lg mx-auto mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onBuy={handleBuyPackage}
          />
        ))}
      </div>
    </div>
  );
};

export default BillingPage;

