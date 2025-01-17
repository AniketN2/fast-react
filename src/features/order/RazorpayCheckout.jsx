import React from 'react';

import { db } from './firebaseConfig'; // Your Firebase config file
import { doc, setDoc } from 'firebase/firestore';

const handlePaymentSuccess = async (response) => {
  try {
    const docRef = doc(db, 'orders', response.razorpay_order_id);
    await setDoc(docRef, {
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      signature: response.razorpay_signature,
      status: 'Paid',
    });
    alert('Payment details saved successfully!');
  } catch (error) {
    console.error('Error saving payment details:', error);
  }
};

function RazorpayCheckout() {
  const handlePayment = async () => {
    // Fetch the order ID from your backend
    const response = await fetch('http://localhost:5000/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 500, // INR amount
        currency: 'INR',
        receipt: 'receipt#1',
      }),
    });

    const order = await response.json();

    // Initialize Razorpay options
    const options = {
      key:  import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
      amount: order.amount,
      currency: order.currency,
      name: 'Fast Pizza',
      description: 'Test Transaction',
      image: 'https://your-logo-url.com', // Optional: Your app logo
      order_id: order.id, // Order ID from Razorpay
      handler: function (response) {
        // Payment successful callback
        alert(`Payment ID: ${response.razorpay_payment_id}`);
        alert(`Order ID: ${response.razorpay_order_id}`);
        alert(`Signature: ${response.razorpay_signature}`);
      },
      prefill: {
        name: 'Your Name', // Replace with user's name
        email: 'your-email@example.com', // Replace with user's email
        contact: '9999999999', // Replace with user's phone number
      },
      notes: {
        address: 'Your Address', // Optional
      },
      theme: {
        color: '#F37254', // Optional: Change checkout theme color
      },
    };

    // Open Razorpay Checkout
    const rzp = new Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      <button onClick={handlePayment}>Pay with Razorpay</button>
    </div>
  );
}

export default RazorpayCheckout;
