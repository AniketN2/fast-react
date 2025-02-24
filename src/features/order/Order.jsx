// Test ID: IIDSAT
import { useFetcher, useLoaderData  } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import db from '../../services/firebaseConfig/'; // Firebase configuration
import OrderItem from './OrderItem';
import Razorpay from 'razorpay';
import { useEffect, useState } from 'react';

import { getOrder } from '../../services/apiRestaurant';
import {
  calcMinutesLeft,
  formatCurrency,
  formatDate,
} from '../../utils/helpers';
import UpdateOrder from './UpdateOrder';

function Order() {
  const initialOrder = useLoaderData(); // Initial order data from loader
  const fetcher = useFetcher();
  const [order, setOrder] = useState(initialOrder);

  useEffect(
    function () {
      if (!fetcher.data && fetcher.state === 'idle') fetcher.load('/menu');
    },
    [fetcher]
  );

  // Everyone can search for all orders, so for privacy reasons we're gonna gonna exclude names or address, these are only for the restaurant staff
  const {
    id,
    status,
    priority,
    priorityPrice,
    orderPrice,
    estimatedDelivery,
    cart,
  } = order;

  const deliveryIn = calcMinutesLeft(estimatedDelivery);

  // Razorpay payment handler
  const handlePayment = async () => {
    const API_BASE_URL = 'http://localhost:5000'; // Replace with your deployed backend URL in production

    try {
      // const response = await fetch(`${API_BASE_URL}/create-order`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: (orderPrice + priorityPrice) * 100, 
      //     currency: 'INR',
      //     receipt: `receipt#${id}`, 
      //   }),
      // }); Previous Working Code

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        // Fetch order details from your backend
        const response = await fetch(`${API_BASE_URL}/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: (orderPrice + priorityPrice) ,
            currency: 'INR',
            receipt: `receipt#${id}`,
          }),
        });


      const orderData = await response.json();

      // Initialize Razorpay Checkout
      const options = {
        key:  import.meta.env.VITE_RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Fast React Pizza',
        description: 'Payment for your order',
        order_id: orderData.id, // Razorpay order ID
        handler: async function (response) {
          // Payment was successful
          alert('Payment Successful!');

          // Store payment details in Firestore (optional)
          const paymentRef = doc(db, 'payments', response.razorpay_payment_id);
          await setDoc(paymentRef, {
            orderId: id,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            amount: orderPrice + priorityPrice,
            status: 'Paid',
          });

          // Redirect to Thank You page
          setOrder((prevOrder) => ({
            ...prevOrder,
            status: 'Paid',
            priority: true, // Example update, adjust as per your requirements
          }));
        },
        prefill: {
          name: 'Your Name', // Replace with user's name
          email: 'your-email@example.com', // Replace with user's email
          contact: '9999999999', // Replace with user's contact number
        },
        theme: {
          color: '#F37254', // Optional: Customize theme color
        },
      };

      // const rzp = new Razorpay(options); previous code
      const rzp = new window.Razorpay(options);
      rzp.open();
    };
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="space-y-8 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Order #{id} status</h2>

        <div className="space-x-2">
          {priority && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-red-50">
              Priority
            </span>
          )}
          <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-green-50">
            {status} order
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-200 px-6 py-5">
        <p className="font-medium">
          {deliveryIn >= 0
            ? `Only ${calcMinutesLeft(estimatedDelivery)} minutes left 😃`
            : 'Order should have arrived'}
        </p>
        <p className="text-xs text-stone-500">
          (Estimated delivery: {formatDate(estimatedDelivery)})
        </p>
      </div>

      <ul className="dive-stone-200 divide-y border-b border-t">
        {cart.map((item) => (
          <OrderItem
            item={item}
            key={item.pizzaId}
            isLoadingIngredients={fetcher.state === 'loading'}
            ingredients={
              fetcher?.data?.find((el) => el.id === item.pizzaId)
                ?.ingredients ?? []
            }
          />
        ))}
      </ul>

      <div className="space-y-2 bg-stone-200 px-6 py-5">
        <p className="text-sm font-medium text-stone-600">
          Price pizza: {formatCurrency(orderPrice)}
        </p>
        {priority && (
          <p className="text-sm font-medium text-stone-600">
            Price priority: {formatCurrency(priorityPrice)}
          </p>
        )}
        <p className="font-bold">
          To pay on delivery: {formatCurrency(orderPrice + priorityPrice)}
        </p>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
        onClick={handlePayment}
      >   Proceed to Payment
      </button>
      {<UpdateOrder order={order} /> && !priority  }
    </div>
  );
}

export async function loader({ params }) {
  try {
    // Fetch the order details using your existing `getOrder` function
    const order = await getOrder(params.orderId);

    // Store the fetched order details into Firestore
    const orderRef = doc(db, 'orders', params.orderId); // Reference to the Firestore document
    await setDoc(orderRef, order, { merge: true }); // Save to Firestore (merge prevents overwriting existing fields)
    // Return the fetched order
    return order;
  } catch (error) {
    console.error('Error handling order:', error);
    throw error; // Re-throw the error to be handled by the router
  }
}

export default Order;
