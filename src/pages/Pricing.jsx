import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import './Pricing.css';

//pricing plans
const pricingData = [
  {
    planName: 'Free',
    description: 'Everything you need to get started.',
    price: 0,
    features: [
      'Access to articles and tutorials',
      'Create and manage posts',
      'Basic account features',
      'Access to the DEV@Deakin community'
    ]
  },
  {
    planName: 'Paid',
    description: 'Get more from your learning experience.',
    price: 199,
    features: [
      'Everything included in Free',
      'Enhanced learning resources',
      'Additional premium content',
      'Premium subscription badge'
    ]
  }
];

function Pricing() {
  const { currentUser, token, login } = useAuth();

  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const currentPlan = currentUser?.subscription || 'Free';

  //select a subscription plan
  function handlePlanSelection(planName) {
    setMessage('');

    if (!currentUser) {
      setMessage('Please log in before selecting a plan.');
      return;
    }

    if (currentPlan === planName) {
      setMessage(`You are already on the ${planName} plan.`);
      return;
    }

    if (planName === 'Paid') {
      setShowModal(true);
    }
  }

  //upgrade the subscription
  async function handleUpgrade() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/upgrade`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upgrade failed.');
      }

      login(result.user, token);
      setShowModal(false);
      setMessage('Your subscription is now Paid.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="pricing-page">
      <div className="pricing-container">

        <div className="pricing-heading">
          <span className="pricing-label">SUBSCRIPTION PLANS</span>
          <h1>Choose Your Plan</h1>

          <p>
            Find the right plan for your DEV@Deakin learning experience.
          </p>
        </div>

        <div className="pricing-cards">
          {pricingData.map((plan) => {
            const isCurrentPlan = currentPlan === plan.planName;

            return (
              <div
                className={`pricing-card ${
                  plan.planName === 'Paid'
                    ? 'paid-pricing-card'
                    : 'free-pricing-card'
                }`}
                key={plan.planName}
              >
                <div className="pricing-plan-details">
                  <span className="pricing-plan-badge">
                    {plan.planName}
                  </span>

                  <p className="pricing-description">
                    {plan.description}
                  </p>

                  <div className="pricing-price">
                    ₹{plan.price}
                    <span>/month</span>
                  </div>

                  <button
                    className="pricing-button"
                    onClick={() => handlePlanSelection(plan.planName)}
                    disabled={isCurrentPlan}
                  >
                    <span>
                      {isCurrentPlan
                        ? 'Current Plan'
                        : plan.planName === 'Paid'
                          ? 'Upgrade Plan'
                          : 'Select Plan'}
                    </span>

                    <span className="pricing-button-icon">
                      <ArrowUpRight size={18} />
                    </span>
                  </button>
                </div>

                <div className="pricing-features">
                  <h3>What's included</h3>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={17} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {message && (
          <p className="pricing-message" role="status">
            {message}
          </p>
        )}
      </div>

      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </section>
  );
}

export default Pricing;