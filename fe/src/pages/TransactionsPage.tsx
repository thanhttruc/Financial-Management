import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionsView } from '../components/TransactionsView';
import { Button } from '../components/Button';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAddTransaction = () => {
    navigate('/transactions/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Giao dịch</h1>
          <Button
            variant="primary"
            onClick={handleAddTransaction}
            style={{ backgroundColor: '#009688' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#008577';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#009688';
            }}
          >
            + Thêm giao dịch
          </Button>
        </div>

        <TransactionsView />
      </div>
    </div>
  );
};
