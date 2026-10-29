import { useState } from 'react';

function PaymentModal({ onClose, onUpgrade }) {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !cardNumber || !expiry || !cvv) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      setError('Enter a 16-digit card number.');
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError('Enter expiry in MM/YY format.');
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError('Enter a valid CVV.');
      return;
    }

    onUpgrade();
  }

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <button onClick={onClose} className="close-button">
          X
        </button>

        <h2>Upgrade to Paid</h2>
        <p>Subscription: ₹199/month</p>
    
        <form onSubmit={handleSubmit}>
          <label>Cardholder Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder='Reuel Menpara'
          />

          <label>Demo Card Number</label>
          <input
            value={cardNumber}
            onChange={(event) =>
              setCardNumber(event.target.value.replace(/\D/g, '').slice(0, 16))
            }
            inputMode="numeric"
            placeholder="Enter your 16 digit cardnumber"
            required
          />

          <label>Expiry Date (MM/YY)</label>
          <input
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
            placeholder="11/11"
            required
          />

          <label>Demo CVV</label>
          <input
            type="password"
            value={cvv}
            onChange={(event) =>
              setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))
            }
            placeholder="123"
            inputMode="numeric"
            required
          />

          {error && <p className="payment-error">{error}</p>}

          <button type="submit" className="payment-submit">
            Confirm Upgrade
          </button>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;