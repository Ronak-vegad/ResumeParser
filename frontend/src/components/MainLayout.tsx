import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function initialOf(name: string) {
  const t = name.trim();
  if (!t) return '?';
  return t[0].toUpperCase();
}

export default function MainLayout() {
  const { user, isLoading, logout } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-otp';

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-white">
      <header className="sticky top-0 z-[200] border-b border-white/10 bg-[#080808]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-3 px-5 sm:px-8 lg:px-14">
          <Link
            to="/"
            className="shrink-0 text-sm font-medium uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white"
          >
            Persona
          </Link>
          <span className="hidden flex-1 text-center text-xs uppercase tracking-[0.22em] text-white/40 sm:block">
            Resume Intelligence
          </span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {isLoading ? (
              <span className="h-8 w-20 rounded-md bg-white/5 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-[#3a4a64] to-[#2c3a52] text-sm font-semibold text-white shadow-[0_0_20px_rgba(106,167,255,0.2)] outline-none transition hover:border-white/40 focus-visible:ring-2 focus-visible:ring-[#6aa7ff]"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-9 w-9 border-0">
                      <AvatarFallback className="bg-transparent text-sm font-semibold text-white">
                        {initialOf(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[12rem] border border-white/10 bg-[#141414] text-white"
                >
                  <div className="px-2 py-1.5 text-xs text-white/50">Signed in as</div>
                  <div className="px-2 pb-2 text-sm font-medium text-white">{user.name}</div>
                  <div className="px-2 pb-2 text-xs text-white/50">{user.email}</div>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-200 focus:bg-white/5 focus:text-red-100"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isAuthPage ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `rounded-md border border-white/20 px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/90 transition hover:border-white/35 hover:bg-white/[0.04] ${
                      isActive ? 'border-white/40 bg-white/[0.06]' : ''
                    }`
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `rounded-md border border-[#7fb3ff]/40 bg-gradient-to-b from-[#3a4a64] to-[#2c3a52] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(106,167,255,0.2)] transition hover:border-[#a7c8ff] ${
                      isActive ? 'ring-1 ring-[#6aa7ff]' : ''
                    }`
                  }
                >
                  Sign up
                </NavLink>
              </>
            ) : null}
            {isAuthPage && !user && (
              <Link
                to="/"
                className="text-xs uppercase tracking-wider text-white/50 transition hover:text-white/80"
              >
                Home
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
