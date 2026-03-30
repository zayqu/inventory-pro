
import React from 'react'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'
import { Outlet } from 'react-router'

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main content area */}
            <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
                <Outlet />
            </main>

            {/* Bottom navigation for mobile */}
            <BottomNav />
        </div>
    )
}

export default Dashboard