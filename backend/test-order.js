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

  for (let i = 1; i <= 4; i++) {
    console.log(`Placing order ${i}...`);
    try {
      const orderRes = await axios.post('http://localhost:3000/api/v1/orders', {
        items: [
          { menuItemId: 8, quantity: 1, toppingIds: [] } // Trà Đào Cam Sả
        ],
        notes: `Order ${i}`
      }, { headers });
      console.log(`Order ${i} created with ID: ${orderRes.data.data.id}`);

      const payRes = await axios.post('http://localhost:3000/api/v1/payments', {
        orderId: orderRes.data.data.id,
        method: 'CASH'
      }, { headers });
      console.log(`Order ${i} paid!`);

    } catch (err) {
      console.error(`Order ${i} failed! Error:`, err.response?.data || err.message);
    }
  }
}

main();
