import http from 'http';

const testOrderPatch = async () => {
  // Try to GET orders first
  const getRes = await fetch('http://localhost:3000/api/orders');
  const orders = await getRes.json();
  if (orders.length === 0) {
    console.log('No orders to test');
    return;
  }
  
  const id = orders[0].id;
  const oldStatus = orders[0].status;
  const newStatus = oldStatus === 'pending' ? 'confirmed' : 'pending';
  
  console.log(`Updating order ${id} from ${oldStatus} to ${newStatus}`);
  
  const patchRes = await fetch(`http://localhost:3000/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  
  console.log('PATCH response status:', patchRes.status);
  const patchBody = await patchRes.text();
  console.log('PATCH response body:', patchBody);
  
  const verifyRes = await fetch(`http://localhost:3000/api/orders/${id}`);
  const verifyBody = await verifyRes.json();
  console.log('Verify response status:', verifyBody.status);
};

testOrderPatch();
