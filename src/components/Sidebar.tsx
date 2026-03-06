import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Sparkles, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pessoas', icon: Users, label: 'Médiuns/Consulentes' },
    { to: '/cargos', icon: UserCog, label: 'Cargos da Casa' },
    { to: '/orixas', icon: Sparkles, label: 'Orixás' },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-zinc-100 transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div className="flex items-center justify-center h-16 border-b border-zinc-800">
          <h1 className={cn("font-bold text-xl tracking-tight transition-opacity", !isOpen && "md:hidden")}>
            Terreiro<span className="text-amber-500">App</span>
          </h1>
          <Sparkles className={cn("text-amber-500 hidden", !isOpen && "md:block")} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
              <span className={cn("ml-3 font-medium transition-opacity", !isOpen && "md:hidden")}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex w-full items-center justify-center p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </>
  );
}
