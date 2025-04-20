import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  
  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    // Map of path segments to readable labels
    const pathLabels: Record<string, string> = {
      dashboard: 'Dashboard',
      jobs: 'Job Management',
      'new-job': 'Create Job',
      'edit-job': 'Edit Job',
      community: 'Community',
      counselors: 'Counselors',
      calendar: 'Calendar',
      settings: 'Settings',
      login: 'Login',
    };
    
    // If on home page, just show Dashboard
    if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
      return [{ label: 'Dashboard', path: '/dashboard', isLast: true }];
    }
    
    // Build breadcrumb items
    return pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      // Check if we have a job ID or other dynamic segment
      const label = pathLabels[name] || (name.match(/^[0-9a-fA-F-]{36}$/) ? 'Details' : name);
      
      return { label, path, isLast };
    });
  }, [location.pathname]);

  return (
    <div className="flex items-center text-sm">
      {location.pathname !== '/dashboard' && (
        <>
          <Link 
            to="/dashboard" 
            className="flex items-center text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="mx-2 h-3 w-3 text-neutral-400 dark:text-neutral-600" />
        </>
      )}
      
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {breadcrumb.isLast ? (
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {breadcrumb.label}
            </span>
          ) : (
            <>
              <Link
                to={breadcrumb.path}
                className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                {breadcrumb.label}
              </Link>
              <ChevronRight className="mx-2 h-3 w-3 text-neutral-400 dark:text-neutral-600" />
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;