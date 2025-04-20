import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import { JobFilters as JobFiltersType, jobCategories, employmentTypes } from '../../types/job';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFilterChange: (filters: JobFiltersType) => void;
  onClearFilters: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value as any });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, type: e.target.value as any });
  };

  const handleSalaryChange = (min: number, max: number) => {
    onFilterChange({ ...filters, salaryRange: { min, max } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Clear all
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Search
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex flex-grow items-stretch focus-within:z-10">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-neutral-300 pl-10 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Category
          </label>
          <select
            className="mt-1 block w-full rounded-md border-neutral-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
            value={filters.category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {jobCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Employment Type
          </label>
          <select
            className="mt-1 block w-full rounded-md border-neutral-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
            value={filters.type}
            onChange={handleTypeChange}
          >
            <option value="">All Types</option>
            {employmentTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Salary Range
          </label>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="Min"
                value={filters.salaryRange?.min || ''}
                onChange={(e) =>
                  handleSalaryChange(
                    Number(e.target.value),
                    filters.salaryRange?.max || 0
                  )
                }
              />
            </div>
            <div>
              <input
                type="number"
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
                placeholder="Max"
                value={filters.salaryRange?.max || ''}
                onChange={(e) =>
                  handleSalaryChange(
                    filters.salaryRange?.min || 0,
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Posted Date
          </label>
          <select
            className="mt-1 block w-full rounded-md border-neutral-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white sm:text-sm"
            value={filters.datePosted?.toISOString() || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                datePosted: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          >
            <option value="">Any time</option>
            <option value={new Date(Date.now() - 86400000).toISOString()}>
              Last 24 hours
            </option>
            <option value={new Date(Date.now() - 604800000).toISOString()}>
              Last 7 days
            </option>
            <option value={new Date(Date.now() - 2592000000).toISOString()}>
              Last 30 days
            </option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-700"
            checked={filters.featured}
            onChange={(e) =>
              onFilterChange({ ...filters, featured: e.target.checked })
            }
          />
          <label className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
            Featured jobs only
          </label>
        </div>
      </div>
    </motion.div>
  );
};

export default JobFilters;