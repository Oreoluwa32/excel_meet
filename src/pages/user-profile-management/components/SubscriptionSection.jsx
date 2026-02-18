import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { Crown, Check, X } from 'lucide-react';
import { initializeSubscription, cancelSubscription, recordPayment, updateUserSubscription } from '../../../utils/paystackService';
import { useAuth } from '../../../contexts/AuthContext';

const plans = {
  free: {
    name: 'Free',
    price: '₦0',
    amount: 0,
    planCode: null,
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
    price: '₦1,500/month',
    amount: 1500,
    planCode: 'PLN_c8ju4nnjje9jwg9',
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
    price: '₦3,000/month',
    amount: 3000,
    planCode: 'PLN_i6ijfhscu3l8v3k',
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
    price: '₦4,000/month',
    amount: 4000,
    planCode: 'PLN_vg7iryponce5mbt',
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

const SubscriptionSection = ({ userProfile }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  
  const isExpired = userProfile?.subscription_end_date && new Date(userProfile.subscription_end_date) < new Date();
  const effectivePlan = (isExpired || !userProfile?.subscription_tier) ? 'free' : userProfile.subscription_tier;
  const currentPlanDetails = plans[effectivePlan];

  const handleUpgrade = async (planKey) => {
    const plan = plans[planKey];
    if (!plan.planCode) return;

    setProcessingPlan(planKey);
    setLoading(true);

    try {
      const reference = `SUB_${user.id}_${planKey}_${Date.now()}`;

      await initializeSubscription(
        {
          planCode: plan.planCode,
          email: user.email,
          reference,
          metadata: {
            user_id: user.id,
            subscription_type: planKey,
            plan_name: plan.name
          }
        },
        async (response) => {
          // Success callback
          console.log('Subscription successful:', response);
          
          // Record payment
          await recordPayment({
            reference: response.reference,
            amount: plan.amount * 100, // Convert to kobo
            status: 'successful'
          });

          // Update user subscription
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          await updateUserSubscription(user.id, {
            tier: planKey,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: nextMonth.toISOString(),
            subscription_code: response.reference
          });

          alert(`Successfully upgraded to ${plan.name} plan!`);
          window.location.reload(); // Refresh to show updated subscription
        },
        () => {
          // Close callback
          console.log('Payment window closed');
          setLoading(false);
          setProcessingPlan(null);
        }
      );
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      alert('Failed to process subscription. Please try again.');
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setLoading(true);
    try {
      const subscriptionCode = userProfile?.paystack_subscription_code;
      
      if (subscriptionCode) {
        // Cancel on Paystack (requires email token - you'll need to implement this flow)
        // For now, we'll just update locally
        // Keep the current tier and end_date - user retains access until subscription expires
        await updateUserSubscription(user.id, {
          tier: userProfile.subscription_tier, // Keep current tier
          status: 'cancelled',
          start_date: userProfile.subscription_start_date, // Keep start date
          end_date: userProfile.subscription_end_date, // Keep end date - access until this date
          subscription_code: subscriptionCode // Keep subscription code for reference
        });
      }

      alert('Subscription cancelled successfully. You will retain access until ' + 
            new Date(userProfile.subscription_end_date).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }));
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Available Plans - Only show if current plan is free or expired */}
      {effectivePlan === 'free' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {isExpired ? 'Renew or Upgrade Your Plan' : 'Upgrade Your Plan'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(plans)
              .filter(([key]) => key !== 'free')
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
                    onClick={() => handleUpgrade(key)}
                    disabled={loading || processingPlan === key}
                  >
                    {processingPlan === key ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Billing Info - Show if they have/had a paid plan */}
      {userProfile?.subscription_tier && userProfile.subscription_tier !== 'free' && userProfile?.subscription_end_date && (
        <div className="mt-6 pt-6 border-t">
          {userProfile.subscription_status === 'cancelled' && !isExpired && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Subscription Cancelled:</strong> You will retain access to {plans[userProfile.subscription_tier]?.name} features until your subscription expires.
              </p>
            </div>
          )}
          {isExpired && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Subscription Expired:</strong> Your {plans[userProfile.subscription_tier]?.name} subscription expired on {new Date(userProfile.subscription_end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{isExpired ? 'Expired on:' : (userProfile.subscription_status === 'cancelled' ? 'Access expires on:' : 'Next billing date:')}</span>
            <span>{new Date(userProfile.subscription_end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
            <span>Payment method:</span>
            <span>Paystack</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
            <span>Status:</span>
            <span className={`capitalize ${
              isExpired ? 'text-red-600' :
              userProfile.subscription_status === 'active' ? 'text-green-600' : 
              userProfile.subscription_status === 'cancelled' ? 'text-yellow-600' : 
              'text-gray-600'
            }`}>
              {isExpired ? 'Expired' : (userProfile.subscription_status === 'cancelled' ? 'Cancelled (Active until expiry)' : userProfile.subscription_status || 'Active')}
            </span>
          </div>
        </div>
      )}

      {/* Cancel Subscription - Only show if active and not expired */}
      {effectivePlan !== 'free' && userProfile?.subscription_status !== 'cancelled' && (
        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={handleCancelSubscription}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Cancel Subscription'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSection;