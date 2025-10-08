import React from 'react';
import Button from '../../../components/ui/Button';
import { Crown, Check, X } from 'lucide-react';

const SubscriptionSection = ({ userProfile }) => {
  const currentPlan = userProfile?.subscription_plan || 'free';

  const plans = {
    free: {
      name: 'Free',
      price: '₦0',
      features: [
        'Basic job search',
        'Limited job applications (5/week)',
        'Basic profile',
        'View ads',
      ],
      limitations: [
        'No priority support',
        'Limited search filters',
        'Basic messaging',
      ],
    },
    basic: {
      name: 'Basic',
      price: '₦4,000/month',
      features: [
        'Enhanced job search',
        'Unlimited job applications',
        'Ad-free experience',
        'Priority customer support',
        'Enhanced search filters',
      ],
      limitations: [
        'Limited premium features',
      ],
    },
    pro: {
      name: 'Pro',
      price: '₦8,000/month',
      features: [
        'Everything in Basic',
        'Access to premium professionals',
        'Early job alerts',
        'Advanced analytics',
        'Profile verification badge',
        'Priority job listings',
      ],
      limitations: [],
    },
    elite: {
      name: 'Elite',
      price: '₦16,000/month',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced reporting',
        'API access',
        'White-label options',
      ],
      limitations: [],
    },
  };

  const currentPlanDetails = plans[currentPlan];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Subscription Plan
        </h3>
        <div className="flex items-center space-x-2">
          <Crown size={20} className="text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">
            {currentPlanDetails?.name}
          </span>
        </div>
      </div>

      {/* Current Plan */}
      <div className="border border-blue-200 rounded-lg p-4 mb-6 bg-blue-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-blue-900">
            Current Plan: {currentPlanDetails?.name}
          </h4>
          <span className="text-xl font-bold text-blue-900">
            {currentPlanDetails?.price}
          </span>
        </div>
        
        <div className="space-y-2">
          {currentPlanDetails?.features?.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-blue-800">
              <Check size={16} className="mr-2 text-green-600" />
              {feature}
            </div>
          ))}
          {currentPlanDetails?.limitations?.map((limitation, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <X size={16} className="mr-2 text-red-500" />
              {limitation}
            </div>
          ))}
        </div>
      </div>

      {/* Available Plans */}
      {currentPlan !== 'elite' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Upgrade Your Plan
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(plans)
              .filter(([key]) => key !== currentPlan && key !== 'free')
              .map(([key, plan]) => (
                <div key={key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="text-center mb-3">
                    <h5 className="font-semibold text-gray-900">{plan.name}</h5>
                    <p className="text-lg font-bold text-blue-600">{plan.price}</p>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <Check size={12} className="mr-1 text-green-600" />
                        {feature}
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{plan.features.length - 3} more features
                      </p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Handle upgrade
                      console.log(`Upgrade to ${plan.name}`);
                    }}
                  >
                    Upgrade to {plan.name}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Billing Info */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Next billing date:</span>
          <span>January 15, 2025</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <span>Payment method:</span>
          <span>•••• •••• •••• 1234</span>
        </div>
      </div>

      {/* Cancel Subscription */}
      {currentPlan !== 'free' && (
        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={() => {
              // Handle cancellation
              console.log('Cancel subscription');
            }}
          >
            Cancel Subscription
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;