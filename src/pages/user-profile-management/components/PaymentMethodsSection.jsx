import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const PaymentMethodsSection = ({ user, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState(user.paymentMethods || []);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'NG'
    }
  });

  const countryOptions = [
    { value: 'NG', label: 'Nigeria' },
    { value: 'GH', label: 'Ghana' },
    { value: 'KE', label: 'Kenya' },
    { value: 'ZA', label: 'South Africa' }
  ];

  const handleCardInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewCard(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewCard(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddCard = () => {
    const cardToAdd = {
      id: Date.now(),
      ...newCard,
      cardNumber: `****-****-****-${newCard.cardNumber.slice(-4)}`,
      isDefault: paymentMethods.length === 0
    };
    
    const updatedMethods = [...paymentMethods, cardToAdd];
    setPaymentMethods(updatedMethods);
    onSave('paymentMethods', updatedMethods);
    
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'NG'
      }
    });
    setIsAddingCard(false);
  };

  const handleRemoveCard = (cardId) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== cardId);
    setPaymentMethods(updatedMethods);
    onSave('paymentMethods', updatedMethods);
  };

  const handleSetDefault = (cardId) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === cardId
    }));
    setPaymentMethods(updatedMethods);
    onSave('paymentMethods', updatedMethods);
  };

  const getCardIcon = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'CreditCard'; // Visa
    if (firstDigit === '5') return 'CreditCard'; // Mastercard
    if (firstDigit === '3') return 'CreditCard'; // Amex
    return 'CreditCard';
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon name="CreditCard" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
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
            {/* Existing Payment Methods */}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg ${
                    method.isDefault ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon name={getCardIcon(method.cardNumber)} size={24} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{method.cardNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiryDate} • {method.cardholderName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                          Default
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => !method.isDefault && handleSetDefault(method.id)}
                        disabled={method.isDefault}
                      >
                        Set Default
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCard(method.id)}
                        className="text-error hover:text-error"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Card Button */}
            {!isAddingCard && (
              <Button
                variant="outline"
                onClick={() => setIsAddingCard(true)}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add New Payment Method
              </Button>
            )}

            {/* Add New Card Form */}
            {isAddingCard && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-medium text-foreground">Add New Card</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    label="Card Number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={newCard.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                    required
                  />
                  <Input
                    label="Cardholder Name"
                    type="text"
                    placeholder="John Doe"
                    value={newCard.cardholderName}
                    onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                    required
                  />
                  <Input
                    label="Expiry Date"
                    type="text"
                    placeholder="MM/YY"
                    value={newCard.expiryDate}
                    onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                    required
                  />
                  <Input
                    label="CVV"
                    type="text"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-foreground">Billing Address</h5>
                  <Input
                    label="Street Address"
                    type="text"
                    value={newCard.billingAddress.street}
                    onChange={(e) => handleCardInputChange('billingAddress.street', e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      type="text"
                      value={newCard.billingAddress.city}
                      onChange={(e) => handleCardInputChange('billingAddress.city', e.target.value)}
                      required
                    />
                    <Input
                      label="State"
                      type="text"
                      value={newCard.billingAddress.state}
                      onChange={(e) => handleCardInputChange('billingAddress.state', e.target.value)}
                      required
                    />
                    <Input
                      label="ZIP Code"
                      type="text"
                      value={newCard.billingAddress.zipCode}
                      onChange={(e) => handleCardInputChange('billingAddress.zipCode', e.target.value)}
                      required
                    />
                  </div>
                  <Select
                    label="Country"
                    options={countryOptions}
                    value={newCard.billingAddress.country}
                    onChange={(value) => handleCardInputChange('billingAddress.country', value)}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button onClick={handleAddCard}>
                    Add Card
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Billing History */}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSection;