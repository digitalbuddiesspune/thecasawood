import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import MobileBottomNav from './components/MobileBottomNav'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const ProductList = lazy(() => import('./pages/ProductList'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Address = lazy(() => import('./pages/Address'))

const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Orders = lazy(() => import('./pages/Orders'))

// Admin pages
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'))
const AdminProducts = lazy(() => import('./admin/pages/Products'))
const AdminProductForm = lazy(() => import('./admin/pages/ProductForm'))
const AdminCategories = lazy(() => import('./admin/pages/Categories'))
const AdminOrders = lazy(() => import('./admin/pages/Orders'))
const AdminOrderDetail = lazy(() => import('./admin/pages/OrderDetail'))
const AdminUsers = lazy(() => import('./admin/pages/Users'))
const AdminPayments = lazy(() => import('./admin/pages/Payments'))
const AdminReports = lazy(() => import('./admin/pages/Reports'))
const AdminSettings = lazy(() => import('./admin/pages/Settings'))

// Loading component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5e3c]"></div>
  </div>
)

const AppContent = () => {
  const location = useLocation() // Now this hook works because it's inside Router
  const isAuthPage = ['/login', '/signup'].includes(location.pathname)
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${!isAuthPage && !isAdminPage ? 'pb-16 lg:pb-0' : ''}`}>
      <ScrollToTop />
      {!isAuthPage && !isAdminPage && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAuthPage && !isAdminPage && <MobileBottomNav />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
