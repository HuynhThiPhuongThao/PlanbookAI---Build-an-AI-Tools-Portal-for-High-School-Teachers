import React, { useState, useEffect } from 'react';
import packageApi from '../../services/packageApi';
import PackageCard from '../../components/package/PackageCard';

const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: '',
    description: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packageApi.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error("Lỗi tải danh sách gói:", error);
      setMessage("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.durationDays) {
      setMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const newPackage = {
        name: formData.name,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        description: formData.description
      };

      await packageApi.createPackage(newPackage);
      
      setMessage("Tạo gói cước thành công!");
      setShowForm(false);
      setFormData({ name: '', price: '', durationDays: '', description: '' });
      
      loadPackages(); // Refresh danh sách

      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error(error);
      setMessage("Có lỗi xảy ra khi tạo gói. Vui lòng thử lại.");
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Gói Cước</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary px-6 py-2"
        >
          + Tạo gói mới
        </button>
      </div>

      {message && (
        <div className={`max-w-md mx-auto mb-6 p-4 rounded-lg ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Form tạo gói mới */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4">Tạo gói cước mới</h2>
          <form onSubmit={handleCreatePackage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên gói</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Ví dụ: Pro AI Premium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá (VND)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="99000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời hạn (ngày)</label>
              <input
                type="number"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="30"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg h-24"
                placeholder="Mô tả quyền lợi của gói..."
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">
                Tạo gói
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="btn btn-secondary flex-1"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách gói */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            isManager={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PackagesPage;
