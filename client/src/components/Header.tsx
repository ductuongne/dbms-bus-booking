import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    Bus,
    Ticket,
    Globe,
    HelpCircle,
    User,
    LogOut,
    LogIn,
    ShieldCheck,
    CalendarClock,
    Navigation,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Badge } from './ui/Badge'

export const Header: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const currentPath = location.pathname
    const { user, isAuthenticated, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
                {/* Logo RedBus */}
                <Link
                    to="/"
                    className="flex items-center gap-2 text-left cursor-pointer transition-transform hover:scale-102 shrink-0"
                    aria-label="Về trang chủ RedBus"
                >
                    <div className="w-10 h-10 rounded-xl bg-[#FF385C] flex items-center justify-center text-white shadow-sm">
                        <Bus className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tight text-[#FF385C]">
                            red<span className="text-gray-900">Bus</span>
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-2 sm:gap-3 text-sm text-gray-700">
                    {/* Tuyến đường */}
                    <Link
                        to="/routes"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            currentPath.startsWith('/routes')
                                ? 'bg-rose-50 text-[#FF385C]'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <Navigation className="w-4 h-4 text-gray-500" />
                        <span>Tuyến đường</span>
                    </Link>

                    {/* Tìm chuyến */}
                    <Link
                        to="/search?from=Hà Nội&to=Ninh Bình&date=2026-10-18"
                        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            currentPath === '/search'
                                ? 'bg-rose-50 text-[#FF385C]'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <Ticket className="w-4 h-4 text-gray-500" />
                        <span>Tìm chuyến</span>
                    </Link>

                    {/* Mã đặt vé */}
                    <Link
                        to="/payment"
                        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            currentPath === '/payment'
                                ? 'bg-rose-50 text-[#FF385C]'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <Ticket className="w-4 h-4 text-gray-500" />
                        <span>Mã đặt vé</span>
                    </Link>

                    {/* Quản trị Admin (Chỉ hiển thị khi role === 'ADMIN') */}
                    {isAuthenticated && user?.role === 'ADMIN' && (
                        <Link
                            to="/admin"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                currentPath.startsWith('/admin')
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                            title="Trang quản trị hệ thống"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Quản trị Admin</span>
                        </Link>
                    )}

                    {/* Lịch chạy Tài xế (Chỉ hiển thị khi role === 'DRIVER') */}
                    {isAuthenticated && user?.role === 'DRIVER' && (
                        <Link
                            to="/driver/schedules"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                currentPath.startsWith('/driver')
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                            title="Lịch trình phân công tài xế"
                        >
                            <CalendarClock className="w-4 h-4" />
                            <span>Lịch chạy</span>
                        </Link>
                    )}

                    {/* Language & Support */}
                    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 cursor-pointer text-gray-600">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span>VN</span>
                    </div>

                    <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-gray-100 cursor-pointer text-gray-600">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        <span>Hỗ trợ</span>
                    </div>

                    {/* User Auth Section */}
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-gray-200">
                            {/* User Identity Chip */}
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                    {user.fullName ? (
                                        user.fullName.charAt(0).toUpperCase()
                                    ) : (
                                        <User className="w-3.5 h-3.5" />
                                    )}
                                </div>
                                <div className="hidden sm:flex flex-col text-left leading-tight">
                                    <span className="text-xs font-bold text-slate-800 max-w-[120px] lg:max-w-[160px] truncate">
                                        {user.fullName || user.userId}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {user.phone}
                                    </span>
                                </div>
                                <Badge
                                    variant="role"
                                    role={user.role}
                                    className="text-[11px] py-0 px-2"
                                />
                            </div>

                            {/* Nút Đăng xuất */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-1 p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Đăng xuất khỏi hệ thống"
                                aria-label="Đăng xuất"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline text-xs font-semibold">
                                    Đăng xuất
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 pl-1 sm:pl-2">
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-gray-100 transition-colors"
                            >
                                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                                <span>Đăng nhập</span>
                            </Link>

                            <Link
                                to="/register"
                                className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF385C] hover:bg-[#e0314f] text-white shadow-xs transition-colors"
                            >
                                <span>Đăng ký</span>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Header