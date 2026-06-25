import http from 'http';

(async () => {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'LJnwqAzg2xgQZjTIQlo' })
  });
  const cookies = loginRes.headers.get('set-cookie');
  
  const getOrders = await fetch('http://localhost:3000/api/orders', {
    headers: { 'Cookie': cookies }
  });
  const headers = Object.fromEntries(getOrders.headers.entries());
  console.log('GET /api/orders headers:', headers);
})();
