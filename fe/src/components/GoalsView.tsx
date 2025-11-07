import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getUserGoals, type UserGoals, type SavingGoal, type ExpenseGoal } from '../api/goals';
import { Card } from './Card';
import { formatCurrency } from '../utils/formatters';
import { Toast, useToast } from './Toast';
import { AdjustGoalModal } from './AdjustGoalModal';
import { SavingSummaryChart } from './SavingSummaryChart';

/**
 * Skeleton Loader cho Savings Goal Card
 */
const SavingsGoalSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-48 h-48 bg-gray-300 rounded-full mb-6"></div>
        <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-40"></div>
        <div className="flex space-x-4 mt-6">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </Card>
  );
};

/**
 * Skeleton Loader cho Expense Goal Card
 */
const ExpenseGoalCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-32"></div>
      </div>
    </Card>
  );
};

/**
 * Skeleton Loader cho Expense Goals Grid
 */
const ExpenseGoalsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <ExpenseGoalCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Component hiển thị Savings Goal với biểu đồ cung tròn
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
const SavingsGoalCard: React.FC<{ 
  savingGoal: SavingGoal;
  onEditClick: () => void;
}> = ({ savingGoal, onEditClick }) => {
  const progress = savingGoal.target_achieved / savingGoal.target_amount;
  const percentage = Math.min(Math.round(progress * 100), 100);
  const remaining = Math.max(savingGoal.target_amount - savingGoal.target_achieved, 0);

  // Dữ liệu cho biểu đồ tròn
  const pieData = [
    { name: 'Đã đạt', value: savingGoal.target_achieved },
    { name: 'Còn lại', value: remaining },
  ];

  const COLORS = ['#10b981', '#e5e7eb'];

  // Custom tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-l-4 border-green-500 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50 -z-10" />
      
      <div className="flex flex-col items-center justify-center py-6 px-4 lg:py-8 lg:px-6">
        {/* Biểu đồ cung tròn */}
        <div className="w-48 h-48 lg:w-56 lg:h-56 mb-6 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Percentage text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-gray-900">{percentage}%</p>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Thông tin mục tiêu */}
        <div className="text-center mb-6 w-full">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-xs lg:text-sm text-gray-600">Đã tiết kiệm</span>
              <span className="text-base lg:text-lg font-bold text-gray-900">
                {formatCurrency(savingGoal.target_achieved)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-xs lg:text-sm text-gray-600">Mục tiêu</span>
              <span className="text-base lg:text-lg font-bold text-gray-900">
                {formatCurrency(savingGoal.target_amount)}
              </span>
            </div>
            {savingGoal.present_amount && (
              <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-xs lg:text-sm text-green-700 font-medium">Số tiền hiện tại</span>
                <span className="text-base lg:text-lg font-bold text-green-700">
                  {formatCurrency(savingGoal.present_amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Các nút */}
        <div className="flex space-x-3 w-full">
          <button className="flex-1 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold text-sm lg:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Thêm tiền
          </button>
          <button 
            onClick={onEditClick}
            className="flex-1 px-4 py-2 lg:px-6 lg:py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm lg:text-base"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </Card>
  );
};

/**
 * Component hiển thị Expense Goal Card
 * Thiết kế theo Figma Finebank Financial Management Dashboard
 */
const ExpenseGoalCard: React.FC<{ 
  expenseGoal: ExpenseGoal;
  onEditClick: () => void;
}> = ({ expenseGoal, onEditClick }) => {
  // Lấy icon và màu sắc cho category
  const getCategoryConfig = (category: string) => {
    const configMap: Record<string, { icon: string; borderColor: string; bgGradient: string }> = {
      'Food': {
        icon: '🍔',
        borderColor: 'border-orange-500',
        bgGradient: 'from-orange-50 to-orange-100',
      },
      'Housing': {
        icon: '🏠',
        borderColor: 'border-blue-500',
        bgGradient: 'from-blue-50 to-blue-100',
      },
      'Transportation': {
        icon: '🚗',
        borderColor: 'border-purple-500',
        bgGradient: 'from-purple-50 to-purple-100',
      },
      'Entertainment': {
        icon: '🎬',
        borderColor: 'border-pink-500',
        bgGradient: 'from-pink-50 to-pink-100',
      },
      'Shopping': {
        icon: '🛍️',
        borderColor: 'border-indigo-500',
        bgGradient: 'from-indigo-50 to-indigo-100',
      },
      'Others': {
        icon: '📦',
        borderColor: 'border-gray-500',
        bgGradient: 'from-gray-50 to-gray-100',
      },
    };
    return configMap[category] || configMap['Others'];
  };

  const config = getCategoryConfig(expenseGoal.category);

  return (
    <Card className={`border-l-4 ${config.borderColor} relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 -z-10`} />
      
      <div className="p-6 relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Icon with gradient background */}
            <div className={`w-14 h-14 bg-gradient-to-br ${config.bgGradient} rounded-xl flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 border-2 ${config.borderColor}`}>
              <span>{config.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {expenseGoal.category}
              </h3>
              <span className="text-xs text-gray-500 font-medium">Mục tiêu chi tiêu</span>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {formatCurrency(expenseGoal.target_amount)}
          </p>
          
          {/* Button Chỉnh sửa */}
          <button
            onClick={onEditClick}
            className="w-full px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm"
          >
            Chỉnh sửa
          </button>
        </div>
      </div>
    </Card>
  );
};

/**
 * Component chính hiển thị Goals View
 * Bao gồm: Savings Goal Card và Expense Goals Grid
 */
export const GoalsView: React.FC = () => {
  const [goalsData, setGoalsData] = useState<UserGoals | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [selectedExpenseGoal, setSelectedExpenseGoal] = useState<ExpenseGoal | null>(null);
  const { toast, showToast, hideToast } = useToast();

  /**
   * Hàm fetch goals - có thể gọi lại để refresh dữ liệu
   */
  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const data = await getUserGoals();
      setGoalsData(data);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      // Xử lý lỗi API
      if (err.response?.status === 500) {
        showToast('Lỗi khi tải mục tiêu. Vui lòng thử lại sau.', 'error');
      } else {
        showToast(
          err.response?.data?.message || 'Không thể tải dữ liệu mục tiêu.',
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  /**
   * Hàm xử lý khi mở modal chỉnh sửa
   */
  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  /**
   * Hàm xử lý khi đóng modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Hàm xử lý khi cập nhật mục tiêu thành công
   */
  const handleGoalUpdated = () => {
    fetchGoals();
  };

  /**
   * Hàm xử lý khi mở modal chỉnh sửa Expense Goal
   */
  const handleExpenseEditClick = (expenseGoal: ExpenseGoal) => {
    setSelectedExpenseGoal(expenseGoal);
    setIsExpenseModalOpen(true);
  };

  /**
   * Hàm xử lý khi đóng modal Expense Goal
   */
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setSelectedExpenseGoal(null);
  };

  // Xử lý trạng thái Loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        <SavingsGoalSkeleton />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mục tiêu chi tiêu</h2>
          <ExpenseGoalsSkeleton />
        </div>
      </div>
    );
  }

  // Xử lý dữ liệu rỗng
  const hasNoGoals = !goalsData?.savingGoal && (!goalsData?.expenseGoals || goalsData.expenseGoals.length === 0);

  if (hasNoGoals) {
    return (
      <div className="space-y-8">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Bạn chưa thiết lập mục tiêu nào.</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            + Tạo mục tiêu mới
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Savings Goal Card và Saving Summary Chart - Layout song song */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Goal Card */}
        {goalsData?.savingGoal && (
          <div>
            <SavingsGoalCard 
              savingGoal={goalsData.savingGoal} 
              onEditClick={handleEditClick}
            />
          </div>
        )}

        {/* Saving Summary Chart - Biểu đồ tổng hợp tiết kiệm theo năm */}
        <div>
          <SavingSummaryChart />
        </div>
      </div>

      {/* Adjust Goal Modal */}
      {goalsData?.savingGoal && (
        <AdjustGoalModal
          isOpen={isModalOpen}
          goalId={goalsData.savingGoal.goal_id}
          targetAmount={goalsData.savingGoal.target_amount}
          archivedAmount={goalsData.savingGoal.target_achieved}
          onClose={handleCloseModal}
          onGoalUpdated={handleGoalUpdated}
        />
      )}

      {/* Expense Goals Grid */}
      {goalsData?.expenseGoals && goalsData.expenseGoals.length > 0 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Mục tiêu chi tiêu</h2>
            <span className="text-sm text-gray-600">
              {goalsData.expenseGoals.length} mục tiêu
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalsData.expenseGoals.map((expenseGoal) => (
              <ExpenseGoalCard 
                key={expenseGoal.goal_id} 
                expenseGoal={expenseGoal}
                onEditClick={() => handleExpenseEditClick(expenseGoal)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Adjust Expense Goal Modal */}
      {selectedExpenseGoal && (
        <AdjustGoalModal
          isOpen={isExpenseModalOpen}
          goalId={selectedExpenseGoal.goal_id}
          targetAmount={selectedExpenseGoal.target_amount}
          archivedAmount={0} // Expense Goals không có archived_amount trong response, mặc định là 0
          onClose={handleCloseExpenseModal}
          onGoalUpdated={handleGoalUpdated}
        />
      )}
    </div>
  );
};

