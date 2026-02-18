import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentMethodsSection = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name="CreditCard" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Payment History</h3>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="space-y-4 mt-4">
            {/* Recent Transactions */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Recent Transactions</h4>
              <div className="space-y-3">
                {[
                  {
                    id: 1,
                    date: '2024-12-01',
                    description: 'Pro Plan Subscription',
                    amount: '₦8,000',
                    status: 'Completed'
                  },
                  {
                    id: 2,
                    date: '2024-11-01',
                    description: 'Pro Plan Subscription',
                    amount: '₦8,000',
                    status: 'Completed'
                  },
                  {
                    id: 3,
                    date: '2024-10-01',
                    description: 'Basic Plan Subscription',
                    amount: '₦4,000',
                    status: 'Completed'
                  }
                ].map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{transaction.amount}</p>
                      <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* See All Option */}
            <Button
              variant="outline"
              onClick={() => console.log('See all history clicked')}
              className="w-full text-sm font-medium"
            >
              See all other payment history
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSection;