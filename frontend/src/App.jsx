import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Root from '../utils/Root';
import Login from './pages/login';
import ProtectedRoutes from '../utils/ProtectedRoutes.jsx';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './components/Categories.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoutes requireRole={["admin"]}>
               <Dashboard />
              </ProtectedRoutes>
            }
          > 
             <Route 
                index
                element={<h1>Summary of dashboard</h1>}
                /> 

             <Route 
                path="categories"
                element={<Categories />}
                />
                <Route 
                path="products"
                element={<h1>Products</h1>}
                />
                <Route 
                path="suppliers"
                element={<h1>Suppliers</h1>}
                />
                <Route 
                path="orders"
                element={<h1>Orders</h1>}
                />
                <Route 
                path="users"
                element={<h1>Users</h1>}
                />
              </Route>

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoutes requireRole={["customer"]}>
                <div className="p-4 md:p-10">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left">
                    Customer Dashboard
                  </h1>
                  {/* Dashboard content here */}
                </div>
              </ProtectedRoutes>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route
            path="/unauthorized"
            element={
              <p className="text-red-600 font-bold text-xl sm:text-2xl md:text-3xl mt-10 text-center">
                Unauthorized Access
              </p>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
