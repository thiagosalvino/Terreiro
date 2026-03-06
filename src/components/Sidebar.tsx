import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Sparkles, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pessoas', icon: Users, label: 'Médiuns/Consulentes' },
    { to: '/cargos', icon: UserCog, label: 'Cargos da Casa' },
    { to: '/orixas', icon: Sparkles, label: 'Orixás' },
  ];

  return (
    <>
      {/* Overlay for all screen sizes when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating toggle button for all screen sizes */}
      <button
        className="fixed bottom-6 right-6 z-50 p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-zinc-100 transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-16 border-b border-zinc-800">
          <h1 className="font-bold text-xl tracking-tight transition-opacity">
            Terreiro<span className="text-amber-500">App</span>
          </h1>
          <Sparkles className="text-amber-500 hidden" />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 rounded-xl transition-colors",
                  isActive
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                )
              }
            >
              <item.icon size={20} className="min-w-[20px]" />
              <span className="ml-3 font-medium transition-opacity">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
