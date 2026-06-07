import axios from 'axios';

async function main() {
  console.log("Logging in as cashier...");
  let token;
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      username: 'cashier1',
      password: 'cashier123'
    });
    token = loginRes.data.data.accessToken; 
    console.log("Logged in!");
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  console.log(`Placing order with 3 items...`);
  try {
    const orderRes = await axios.post('http://localhost:3000/api/v1/orders', {
      items: [
        { menuItemId: 8, quantity: 1, toppingIds: [1] }, // Trà Đào Cam Sả + Trân châu trắng
        { menuItemId: 1, quantity: 2, toppingIds: [] },  // Cà phê đen
        { menuItemId: 2, quantity: 1, toppingIds: [2] }  // Cà phê sữa + Kem cheese
      ],
      notes: `Test order`
    }, { headers });
    console.log(`Order created with ID: ${orderRes.data.data.id}`);

    const payRes = await axios.post('http://localhost:3000/api/v1/payments', {
      orderId: orderRes.data.data.id,
      method: 'CASH'
    }, { headers });
    console.log(`Order paid!`, payRes.data);

  } catch (err) {
    console.error(`Order failed! Error:`, err.response?.data || err.message);
  }
}

main();
