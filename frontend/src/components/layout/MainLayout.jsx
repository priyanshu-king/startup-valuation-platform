/**
 * MainLayout
 * ==========
 * Wraps all authenticated/app pages with Navbar + Footer.
 * The <Outlet /> renders the active child route.
 */

import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
