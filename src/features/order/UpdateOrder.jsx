import { useFetcher } from 'react-router-dom';
import Button from '../../ui/Button';
import { updateOrder } from '../../services/apiRestaurant';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../services/firebaseConfig/'; // Firebase configuration

function UpdateOrder({ order }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="PATCH" className="text-right">
      <Button type="primary">Make priority</Button>
    </fetcher.Form>
  );
}

export default UpdateOrder;

export async function action({ request, params }) {
  const data = { priority: true };
  await updateOrder(params.orderId, data);

  try {
    // Reference the specific order document in Firestore
    const orderRef = doc(db, 'orders', params.orderId);

    // Update the document with new data

    await updateDoc(orderRef, data);

    console.log('Order updated successfully');
  } catch (error) {
    console.error('Error updating order:', error);
  }
}