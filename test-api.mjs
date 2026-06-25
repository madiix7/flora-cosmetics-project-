import http from 'http';

(async () => {
  console.log('Sending login request...');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'LJnwqAzg2xgQZjTIQlo' })
  });
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Got cookie:', cookies);
  
  const getOrders = await fetch('http://localhost:3000/api/orders', {
    headers: { 'Cookie': cookies }
  });
  const orders = await getOrders.json();
  const id = orders[0].id;
  const oldStatus = orders[0].status;
  const newStatus = oldStatus === 'pending' ? 'confirmed' : 'pending';
  
  console.log(`Patching ${id} from ${oldStatus} to ${newStatus}`);
  
  const patchRes = await fetch(`http://localhost:3000/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies,
      'Origin': 'http://localhost:3000'
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  console.log('Patch status:', patchRes.status);
  const patchText = await patchRes.text();
  console.log('Patch response:', patchText);
})();
