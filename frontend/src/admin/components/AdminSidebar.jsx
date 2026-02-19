import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: 'Products',
    path: '/admin/products',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    submenu: [
      { title: 'All Products', path: '/admin/products' },
      { title: 'Add Product', path: '/admin/products/add' },
    ],
  },
  {
    title: 'Categories',
    path: '/admin/categories',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: 'Orders',
    path: '/admin/orders',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Payments',
    path: '/admin/payments',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1zm7 4h.01" />
      </svg>
    ),
  },
  {
    title: 'Users',
    path: '/admin/users',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const AdminSidebar = ({ isOpen, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setExpandedMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isParentActive = (item) => {
    if (item.path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(item.path);
  };

  const hasActiveChild = (item) =>
    item.submenu?.some((s) => location.pathname === s.path);

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-[#1a1a2e] text-white z-50
    transition-all duration-300 overflow-y-auto
    ${isOpen ? 'w-64' : 'w-20'}
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-[#8b5e3c] rounded-lg flex items-center justify-center font-bold text-lg shrink-0">
            C
          </div>
          {isOpen && <span className="font-semibold text-lg truncate">CasaWood</span>}
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden text-gray-400 hover:text-white p-1 shrink-0"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="p-4 pb-24">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              {item.submenu ? (
                <>
                  {isOpen ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpandedMenu(expandedMenu === item.path ? null : item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                          isParentActive(item)
                            ? 'bg-[#8b5e3c] text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1 truncate">{item.title}</span>
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform ${expandedMenu === item.path ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {(expandedMenu === item.path || hasActiveChild(item)) && (
                        <ul className="mt-1 ml-4 pl-4 border-l border-gray-600 space-y-1">
                          {item.submenu.map((sub) => (
                            <li key={sub.path}>
                              <NavLink
                                to={sub.path}
                                end={sub.path === '/admin/products'}
                                onClick={() => {
                                  setExpandedMenu(null);
                                  onMobileClose?.();
                                }}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                      ? 'bg-[#8b5e3c]/80 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                  }`
                                }
                              >
                                {sub.title}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        `flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                          isActive ? 'bg-[#8b5e3c] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`
                      }
                    >
                      {item.icon}
                    </NavLink>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#8b5e3c] text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  {isOpen && <span className="truncate">{item.title}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg flex justify-center"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
