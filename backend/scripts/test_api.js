// Test API endpoints
const BASE_URL = 'http://localhost:5000/api';

async function testAPIs() {
  console.log('🧪 Testing CasaWood API Endpoints\n');
  console.log('='.repeat(50));

  let token = '';

  // 1. Test Login
  console.log('\n1️⃣  Testing Login...');
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'roshanchaudhari4145@gmail.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginData.success) {
      console.log('   ✅ Login successful');
      console.log(`   📧 Email: ${loginData.user.email}`);
      console.log(`   👤 Role: ${loginData.user.role}`);
      token = loginData.token;
    } else {
      console.log('   ❌ Login failed:', loginData.message);
      return;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return;
  }

  // 2. Test Admin Dashboard Stats
  console.log('\n2️⃣  Testing Admin Dashboard Stats...');
  try {
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    
    if (statsData.success) {
      console.log('   ✅ Dashboard stats loaded');
      console.log(`   📦 Total Orders: ${statsData.data.totalOrders}`);
      console.log(`   🛍️  Total Products: ${statsData.data.totalProducts}`);
      console.log(`   👥 Total Customers: ${statsData.data.totalCustomers}`);
      console.log(`   💰 Total Revenue: ₹${statsData.data.totalRevenue}`);
    } else {
      console.log('   ❌ Stats failed:', statsData.message);
    }
  } catch (error) {
    console.log('   ❌ Stats error:', error.message);
  }

  // 3. Test Admin Products
  console.log('\n3️⃣  Testing Admin Products...');
  try {
    const productsRes = await fetch(`${BASE_URL}/admin/products?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const productsData = await productsRes.json();
    
    if (productsData.success) {
      const count = productsData.data.products?.length || productsData.data?.length || 0;
      console.log(`   ✅ Products loaded: ${count} items`);
    } else {
      console.log('   ❌ Products failed:', productsData.message);
    }
  } catch (error) {
    console.log('   ❌ Products error:', error.message);
  }

  // 4. Test Admin Orders
  console.log('\n4️⃣  Testing Admin Orders...');
  try {
    const ordersRes = await fetch(`${BASE_URL}/admin/orders?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const ordersData = await ordersRes.json();
    
    if (ordersData.success) {
      const count = ordersData.data.orders?.length || ordersData.data?.length || 0;
      console.log(`   ✅ Orders loaded: ${count} items`);
    } else {
      console.log('   ❌ Orders failed:', ordersData.message);
    }
  } catch (error) {
    console.log('   ❌ Orders error:', error.message);
  }

  // 5. Test Admin Users
  console.log('\n5️⃣  Testing Admin Users...');
  try {
    const usersRes = await fetch(`${BASE_URL}/admin/users?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    
    if (usersData.success) {
      const count = usersData.data.users?.length || usersData.data?.length || 0;
      console.log(`   ✅ Users loaded: ${count} items`);
    } else {
      console.log('   ❌ Users failed:', usersData.message);
    }
  } catch (error) {
    console.log('   ❌ Users error:', error.message);
  }

  // 6. Test Admin Categories
  console.log('\n6️⃣  Testing Admin Categories...');
  try {
    const categoriesRes = await fetch(`${BASE_URL}/admin/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categoriesData = await categoriesRes.json();
    
    if (categoriesData.success) {
      console.log(`   ✅ Categories loaded: ${categoriesData.data?.length || 0} items`);
    } else {
      console.log('   ❌ Categories failed:', categoriesData.message);
    }
  } catch (error) {
    console.log('   ❌ Categories error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ API Testing Complete!\n');
}

testAPIs();
