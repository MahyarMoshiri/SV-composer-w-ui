import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Search,
  FileEdit,
  Sparkles,
  Blend,
  CheckCircle,
  Settings,
  Award,
  Film,
  Database,
  Activity,
} from 'lucide-react';

const navSections = [
  { path: '/bible', label: 'Bible', icon: BookOpen },
  { path: '/retrieval', label: 'Retrieval', icon: Search },
  { path: '/compose', label: 'Compose', icon: FileEdit, comingSoon: true },
  { path: '/generate', label: 'Generate', icon: Sparkles },
  { path: '/blend', label: 'Blend', icon: Blend, comingSoon: true },
  { path: '/evaluate', label: 'Evaluate', icon: CheckCircle, comingSoon: true },
  { path: '/control', label: 'Control', icon: Settings, comingSoon: true },
  { path: '/gold', label: 'Gold', icon: Award, comingSoon: true },
  { path: '/filmplan', label: 'Film Plan', icon: Film, beta: true },
  { path: '/banks', label: 'Banks', icon: Database, comingSoon: true },
  { path: '/status', label: 'Status', icon: Activity },
];

const LeftNav = () => {
  return (
    <nav className="w-64 border-r bg-card h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 space-y-1">
        {navSections.map((section) => {
          const Icon = section.icon;
          return (
            <NavLink
              key={section.path}
              to={section.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex items-center gap-2">
                {section.label}
                {section.comingSoon && (
                  <em className="text-red-600 italic">(Coming soon!)</em>
                )}
                {section.beta && (
                  <span className="text-blue-600">Beta</span>
                )}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default LeftNav;
