import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { getGoals, getSavingsSummary, createGoal, updateGoal, type SavingGoal, type ExpenseGoal, type SavingsSummaryResponse, type CreateGoalRequest, type UpdateGoalRequest } from '../api/goals';
import { formatCurrency } from '../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Lấy icon và màu cho từng category
 */
const getCategoryConfig = (category: string) => {
  const configs: Record<string, { icon: string; color: string; borderColor: string }> = {
    Housing: { icon: '🏠', color: 'bg-blue-100', borderColor: 'border-blue-500' },
    Food: { icon: '🍔', color: 'bg-green-100', borderColor: 'border-green-500' },
    Transportation: { icon: '🚗', color: 'bg-yellow-100', borderColor: 'border-yellow-500' },
    Entertainment: { icon: '🎬', color: 'bg-purple-100', borderColor: 'border-purple-500' },
    Shopping: { icon: '🛍️', color: 'bg-pink-100', borderColor: 'border-pink-500' },
    Others: { icon: '📦', color: 'bg-gray-100', borderColor: 'border-gray-500' },
  };
  
  return configs[category] || { icon: '📦', color: 'bg-gray-100', borderColor: 'border-gray-500' };
};

/**
 * Lấy dữ liệu form mặc định
 */
const getDefaultFormData = (): CreateGoalRequest => {
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  return {
    goal_type: 'Saving',
    category_id: null,
    start_date: now.toISOString().split('T')[0],
    end_date: nextYear.toISOString().split('T')[0],
    target_amount: 0,
    target_archived: 0,
  };
};

export const GoalsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingGoal, setSavingGoal] = useState<SavingGoal | null>(null);
  const [expenseGoals, setExpenseGoals] = useState<ExpenseGoal[]>([]);
  
  // State cho tháng được chọn (format: YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    // Mặc định là tháng hiện tại
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // State cho Saving Summary
  const [savingsSummary, setSavingsSummary] = useState<SavingsSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    // Mặc định là năm hiện tại
    return new Date().getFullYear();
  });

  // State cho modal tạo mục tiêu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGoalRequest>(getDefaultFormData());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  // State cho modal điều chỉnh mục tiêu
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustFormData, setAdjustFormData] = useState<{ target_amount: number; archived_amount: number }>({
    target_amount: 0,
    archived_amount: 0,
  });
  const [adjustFormErrors, setAdjustFormErrors] = useState<Record<string, string>>({});
  const [adjustFormLoading, setAdjustFormLoading] = useState(false);
  const [adjustingGoalId, setAdjustingGoalId] = useState<number | null>(null);

  // Danh sách categories (hardcoded - có thể thay bằng API sau)
  const categories = [
    { id: 1, name: 'Housing' },
    { id: 2, name: 'Food' },
    { id: 3, name: 'Transportation' },
    { id: 4, name: 'Entertainment' },
    { id: 5, name: 'Shopping' },
    { id: 6, name: 'Others' },
  ];

  // Tạo danh sách các tháng để chọn (12 tháng gần nhất)
  const getMonthOptions = (): string[] => {
    const options: string[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      options.push(`${year}-${month}`);
    }
    
    return options;
  };

  // Tạo danh sách các năm để chọn (năm hiện tại và 5 năm trước)
  const getYearOptions = (): number[] => {
    const options: number[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i <= 5; i++) {
      options.push(currentYear - i);
    }
    
    return options;
  };

  // Format dữ liệu cho biểu đồ
  const formatChartData = () => {
    if (!savingsSummary) return [];
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return savingsSummary.summary.this_year.map((item, index) => ({
      month: monthNames[index],
      monthNum: item.month,
      thisYear: item.amount,
      lastYear: savingsSummary.summary.last_year[index]?.amount || 0,
    }));
  };

  // Format tháng để hiển thị (YYYY-MM -> "Tháng MM/YYYY")
  const formatMonthDisplay = (month: string): string => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(monthNum, 10) - 1;
    const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'][monthIndex];
    return `${monthName}/${year}`;
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You need to login to view financial goals.');
          setLoading(false);
          return;
        }
        
        const data = await getGoals(selectedMonth);
        setSavingGoal(data.savingGoal);
        setExpenseGoals(data.expenseGoals || []);
      } catch (err: any) {
        console.error('[GoalsPage] Error fetching goals:', err);
        
        // Xử lý các loại lỗi khác nhau
        if (err.response?.status === 401) {
          setError('Login session expired. Please login again.');
        } else if (err.message?.includes('Authentication required')) {
          setError('You need to login to view financial goals.');
        } else {
          setError(err.response?.data?.message || err.message || 'Unable to load goals list');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [selectedMonth]);

  // Fetch savings summary khi năm thay đổi
  useEffect(() => {
    const fetchSavingsSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
          setSummaryError('Bạn cần đăng nhập để xem tổng kết tiết kiệm.');
          setSummaryLoading(false);
          return;
        }
        
        const data = await getSavingsSummary(selectedYear);
        setSavingsSummary(data);
      } catch (err: any) {
        console.error('[GoalsPage] Error fetching savings summary:', err);
        
        // Xử lý các loại lỗi khác nhau
        if (err.response?.status === 401) {
          setSummaryError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (err.message?.includes('Authentication required')) {
          setSummaryError('Bạn cần đăng nhập để xem tổng kết tiết kiệm.');
        } else {
          setSummaryError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu tổng kết tiết kiệm');
        }
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSavingsSummary();
  }, [selectedYear]);

  // Reset form về giá trị mặc định
  const resetForm = () => {
    setFormData(getDefaultFormData());
    setFormErrors({});
  };

  // Xử lý khi mở/đóng modal
  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === 'goal_type' || name === 'category_id' 
          ? (name === 'category_id' ? (value === '' ? null : Number(value)) : value)
          : name === 'target_amount' || name === 'target_archived'
          ? Number(value) || 0
          : value,
      };
      
      // Reset category_id khi chuyển từ Expense_Limit sang Saving
      if (name === 'goal_type' && value === 'Saving') {
        updated.category_id = null;
      }
      
      return updated;
    });

    // Xóa lỗi của field này khi người dùng nhập
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.start_date) {
      errors.start_date = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.end_date) {
      errors.end_date = 'Ngày kết thúc không được để trống';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (start >= end) {
        errors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (!formData.target_amount || formData.target_amount <= 0) {
      errors.target_amount = 'Số tiền mục tiêu phải lớn hơn 0';
    }

    if (formData.goal_type === 'Expense_Limit' && !formData.category_id) {
      errors.category_id = 'Vui lòng chọn danh mục';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    try {
      const payload: CreateGoalRequest = {
        goal_type: formData.goal_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        target_amount: formData.target_amount,
        category_id: formData.goal_type === 'Expense_Limit' ? formData.category_id : null,
        ...(formData.target_archived && formData.target_archived > 0 
          ? { target_archived: formData.target_archived } 
          : {}),
      };

      await createGoal(payload);
      
      // Đóng modal và refresh danh sách
      handleCloseModal();
      
      // Reload goals
      const data = await getGoals(selectedMonth);
      setSavingGoal(data.savingGoal);
      setExpenseGoals(data.expenseGoals || []);
      
      // Hiển thị thông báo thành công (có thể thay bằng toast notification)
      alert('Tạo mục tiêu thành công!');
    } catch (err: any) {
      console.error('[GoalsPage] Error creating goal:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tạo mục tiêu. Vui lòng thử lại.';
      
      // Hiển thị lỗi (có thể thay bằng toast notification)
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Tính phần trăm hoàn thành cho saving goal
  const getProgressPercentage = (goal: SavingGoal | null): number => {
    if (!goal || goal.target_amount === 0) return 0;
    return Math.min((goal.target_achieved / goal.target_amount) * 100, 100);
  };

  // Xử lý mở modal điều chỉnh mục tiêu
  const handleOpenAdjustModal = (goal: SavingGoal | ExpenseGoal) => {
    setAdjustingGoalId(goal.goal_id);
    setAdjustFormData({
      target_amount: goal.target_amount,
      archived_amount: goal.goal_id === savingGoal?.goal_id 
        ? (savingGoal.target_achieved || 0)
        : 0,
    });
    setAdjustFormErrors({});
    setIsAdjustModalOpen(true);
  };

  // Xử lý đóng modal điều chỉnh mục tiêu
  const handleCloseAdjustModal = () => {
    setIsAdjustModalOpen(false);
    setAdjustingGoalId(null);
    setAdjustFormData({ target_amount: 0, archived_amount: 0 });
    setAdjustFormErrors({});
  };

  // Xử lý thay đổi input trong modal điều chỉnh
  const handleAdjustInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setAdjustFormData((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));

    // Xóa lỗi của field này khi người dùng nhập
    if (adjustFormErrors[name]) {
      setAdjustFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Validate form điều chỉnh
  const validateAdjustForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!adjustFormData.target_amount || adjustFormData.target_amount <= 0) {
      errors.target_amount = 'Số tiền mục tiêu phải lớn hơn 0';
    }

    if (adjustFormData.archived_amount < 0) {
      errors.archived_amount = 'Số tiền đã tích lũy không được âm';
    }

    setAdjustFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý submit form điều chỉnh
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAdjustForm() || !adjustingGoalId) {
      return;
    }

    setAdjustFormLoading(true);
    try {
      const payload: UpdateGoalRequest = {
        target_amount: adjustFormData.target_amount,
        archived_amount: adjustFormData.archived_amount || 0,
      };

      await updateGoal(adjustingGoalId, payload);
      
      // Đóng modal và refresh danh sách
      handleCloseAdjustModal();
      
      // Reload goals
      const data = await getGoals(selectedMonth);
      setSavingGoal(data.savingGoal);
      setExpenseGoals(data.expenseGoals || []);
      
      // Hiển thị thông báo thành công
      alert('Cập nhật mục tiêu thành công!');
    } catch (err: any) {
      console.error('[GoalsPage] Error updating goal:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật mục tiêu. Vui lòng thử lại.';
      
      // Hiển thị lỗi
      alert(errorMessage);
    } finally {
      setAdjustFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <Loading text="Đang tải danh sách mục tiêu..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage(savingGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Mục tiêu tài chính</h1>
            <p className="text-gray-500 text-sm sm:text-base">Quản lý và theo dõi mục tiêu tiết kiệm và chi tiêu của bạn</p>
          </div>
          <Button variant="primary" onClick={handleOpenModal} className="whitespace-nowrap">
            <span className="mr-2">+</span> Thêm mục tiêu
          </Button>
        </div>

        <div className="space-y-6">
          {/* Savings Goal Section */}
          <Card className="border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Savings Goal</h2>
                  <p className="text-sm text-gray-500">Mục tiêu tiết kiệm tổng thể</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="month-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Chọn tháng:
                  </label>
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400"
                  >
                    {getMonthOptions().map((month) => (
                      <option key={month} value={month}>
                        {formatMonthDisplay(month)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {savingGoal ? (
                <div className="space-y-6">
                  {/* Progress Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Mục tiêu tiết kiệm</h3>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {progressPercentage.toFixed(1)}% hoàn thành
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        {progressPercentage > 0 && (
                          <div className="h-full w-full bg-white opacity-20 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Target Achieved</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(savingGoal.target_achieved)}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-green-600 font-medium">● Tiết kiệm</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Target Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(savingGoal.target_amount)}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-blue-600 font-medium">● Mục tiêu</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full py-3 font-semibold hover:shadow-md transition-all"
                    onClick={() => savingGoal && handleOpenAdjustModal(savingGoal)}
                  >
                    ✏️ Điều chỉnh mục tiêu
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-gray-600 font-medium mb-2">Chưa có mục tiêu tiết kiệm</p>
                  <p className="text-sm text-gray-500 mb-6">Tạo mục tiêu đầu tiên của bạn để bắt đầu tiết kiệm</p>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      resetForm();
                      setFormData((prev) => ({ ...prev, goal_type: 'Saving' }));
                      setIsModalOpen(true);
                    }}
                    className="px-6"
                  >
                    + Tạo mục tiêu tiết kiệm
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Saving Summary Section */}
          <Card className="border-l-4 border-indigo-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Saving Summary</h2>
                  <p className="text-sm text-gray-500">Tổng kết tiết kiệm theo từng tháng</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="year-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Chọn năm:
                  </label>
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer hover:border-gray-400"
                  >
                    {getYearOptions().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {summaryLoading ? (
                <div className="py-8">
                  <Loading text="Đang tải dữ liệu..." />
                </div>
              ) : summaryError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {summaryError}
                </div>
              ) : savingsSummary ? (
                <div className="w-full">
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                      <span className="text-sm text-gray-700 font-semibold">Năm {selectedYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-1 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-700 font-semibold">Cùng kỳ năm trước</span>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="w-full h-96 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={formatChartData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="thisYear"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ fill: '#2563eb', r: 5, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 7 }}
                          name="Năm hiện tại"
                        />
                        <Line
                          type="monotone"
                          dataKey="lastYear"
                          stroke="#9ca3af"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          dot={{ fill: '#9ca3af', r: 4, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6 }}
                          name="Cùng kỳ năm trước"
                          opacity={0.7}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600 font-medium">Chưa có dữ liệu tổng kết tiết kiệm</p>
                </div>
              )}
            </div>
          </Card>

          {/* Expenses Goals by Category Section */}
          <Card className="border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Giới hạn chi tiêu theo danh mục</h2>
                <p className="text-sm text-gray-500">Theo dõi và quản lý chi tiêu theo từng danh mục</p>
              </div>
              
              {expenseGoals.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-600 font-medium mb-2">Chưa có mục tiêu chi tiêu theo danh mục</p>
                  <p className="text-sm text-gray-500 mb-6">Tạo mục tiêu để kiểm soát chi tiêu tốt hơn</p>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      resetForm();
                      setFormData((prev) => ({ ...prev, goal_type: 'Expense_Limit' }));
                      setIsModalOpen(true);
                    }}
                    className="px-6"
                  >
                    + Tạo mục tiêu chi tiêu
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expenseGoals.map((goal) => {
                    const config = getCategoryConfig(goal.category);
                    return (
                      <Card
                        key={goal.goal_id}
                        className={`border-l-4 ${config.borderColor} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-14 h-14 ${config.color} rounded-xl flex items-center justify-center text-3xl shadow-sm`}>
                              {config.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{goal.category}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Giới hạn chi tiêu</p>
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Target Amount</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(goal.target_amount)}
                          </p>
                        </div>
                        <Button 
                          variant="secondary" 
                          className="w-full py-2.5 font-semibold hover:shadow-md transition-all"
                          onClick={() => handleOpenAdjustModal(goal)}
                        >
                          ✏️ Điều chỉnh
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal tạo mục tiêu mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tạo mục tiêu mới</h2>
                  <p className="text-sm text-gray-500 mt-1">Thiết lập mục tiêu tài chính của bạn</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors text-2xl font-bold w-10 h-10 flex items-center justify-center"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Goal Type */}
                <div>
                  <label htmlFor="goal_type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại mục tiêu <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="goal_type"
                    name="goal_type"
                    value={formData.goal_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                  >
                    <option value="Saving">Mục tiêu tiết kiệm</option>
                    <option value="Expense_Limit">Giới hạn chi tiêu theo danh mục</option>
                  </select>
                    {formErrors.goal_type && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.goal_type}</p>
                    )}
                </div>

                {/* Category (chỉ hiển thị khi goal_type = Expense_Limit) */}
                {formData.goal_type === 'Expense_Limit' && (
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.category_id}</p>
                    )}
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    />
                    {formErrors.start_date && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.start_date}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    />
                    {formErrors.end_date && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.end_date}</p>
                    )}
                  </div>
                </div>

                {/* Target Amount */}
                <div>
                  <label htmlFor="target_amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Số tiền mục tiêu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="target_amount"
                    name="target_amount"
                    value={formData.target_amount || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Nhập số tiền mục tiêu"
                  />
                  {formErrors.target_amount && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.target_amount}</p>
                  )}
                  {formData.target_amount > 0 && (
                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      {formatCurrency(formData.target_amount)}
                    </p>
                  )}
                </div>

                {/* Target Archived (Optional) */}
                <div>
                  <label htmlFor="target_archived" className="block text-sm font-semibold text-gray-700 mb-2">
                    Số tiền đã tích lũy hiện tại <span className="text-gray-400 text-xs">(tùy chọn)</span>
                  </label>
                  <input
                    type="number"
                    id="target_archived"
                    name="target_archived"
                    value={formData.target_archived || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Nhập số tiền đã tích lũy (nếu có)"
                  />
                  {formData.target_archived && formData.target_archived > 0 && (
                    <p className="mt-2 text-sm font-semibold text-green-600">
                      {formatCurrency(formData.target_archived)}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={formLoading}
                    className="px-6"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={formLoading}
                    className="px-8 shadow-lg hover:shadow-xl transition-all"
                  >
                    {formLoading ? 'Đang tạo...' : 'Tạo mục tiêu'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal điều chỉnh mục tiêu */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Điều chỉnh mục tiêu</h2>
                  <p className="text-sm text-gray-500 mt-1">Cập nhật số tiền mục tiêu và đã đạt được</p>
                </div>
                <button
                  onClick={handleCloseAdjustModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors text-2xl font-bold w-10 h-10 flex items-center justify-center"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-5">
                {/* Target Amount */}
                <div>
                  <label htmlFor="adjust_target_amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="adjust_target_amount"
                    name="target_amount"
                    value={adjustFormData.target_amount || ''}
                    onChange={handleAdjustInputChange}
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Nhập số tiền mục tiêu"
                  />
                  {adjustFormErrors.target_amount && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{adjustFormErrors.target_amount}</p>
                  )}
                  {adjustFormData.target_amount > 0 && (
                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      {formatCurrency(adjustFormData.target_amount)}
                    </p>
                  )}
                </div>

                {/* Archived Amount */}
                <div>
                  <label htmlFor="adjust_archived_amount" className="block text-sm font-semibold text-gray-700 mb-2">
                    Archived Amount <span className="text-gray-400 text-xs font-normal">(Số tiền đã đạt được)</span>
                  </label>
                  <input
                    type="number"
                    id="adjust_archived_amount"
                    name="archived_amount"
                    value={adjustFormData.archived_amount || ''}
                    onChange={handleAdjustInputChange}
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Nhập số tiền đã đạt được"
                  />
                  {adjustFormErrors.archived_amount && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{adjustFormErrors.archived_amount}</p>
                  )}
                  {adjustFormData.archived_amount > 0 && (
                    <p className="mt-2 text-sm font-semibold text-green-600">
                      {formatCurrency(adjustFormData.archived_amount)}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseAdjustModal}
                    disabled={adjustFormLoading}
                    className="px-6"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={adjustFormLoading}
                    className="px-8 shadow-lg hover:shadow-xl transition-all"
                  >
                    {adjustFormLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
