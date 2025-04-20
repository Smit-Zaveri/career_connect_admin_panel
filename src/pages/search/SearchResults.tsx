import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import { counselorService } from '../../services/counselorService';
import { jobService } from '../../services/jobService';
import { communityService } from '../../services/communityService';
import toast from 'react-hot-toast';

interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: 'job' | 'counselor' | 'community';
  url: string;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Searching for:', query);
        // Get results from different services in parallel
        const [jobResults, counselorResults, communityResults] = await Promise.all([
          jobService.searchJobs(query).catch(err => {
            console.error('Error fetching job results:', err);
            return [];
          }),
          counselorService.searchCounselors(query).catch(err => {
            console.error('Error fetching counselor results:', err);
            return [];
          }),
          communityService.searchCommunities(query).catch(err => {
            console.error('Error fetching community results:', err);
            return [];
          }),
        ]);
        
        console.log('Search results:', { 
          jobResults: jobResults?.length || 0, 
          counselorResults: counselorResults?.length || 0, 
          communityResults: communityResults?.length || 0 
        });
        
        // Transform job results to common format
        const formattedJobResults: SearchResultItem[] = Array.isArray(jobResults) ? jobResults.map(job => ({
          id: job.job_id || job.id,
          title: job.job_title || job.title,
          description: (job.job_description || job.description)?.substring(0, 150) + 
            ((job.job_description || job.description)?.length > 150 ? '...' : ''),
          type: 'job',
          url: `/jobs/${job.job_id || job.id}`
        })) : [];
        
        // Transform counselor results to common format
        const formattedCounselorResults: SearchResultItem[] = Array.isArray(counselorResults) ? counselorResults.map(counselor => ({
          id: counselor.id,
          title: counselor.name,
          description: counselor.bio?.substring(0, 150) + 
            (counselor.bio && counselor.bio.length > 150 ? '...' : '') || 'No bio available',
          type: 'counselor',
          url: `/counselors/${counselor.id}`
        })) : [];
        
        // Transform community results to common format
        const formattedCommunityResults: SearchResultItem[] = Array.isArray(communityResults) ? communityResults.map(community => ({
          id: community.id,
          title: community.title,
          description: community.description?.substring(0, 150) + 
            (community.description && community.description.length > 150 ? '...' : '') || 'No description available',
          type: 'community',
          url: `/community/${community.id}`
        })) : [];
        
        // Combine all results
        const allResults = [
          ...formattedJobResults,
          ...formattedCounselorResults,
          ...formattedCommunityResults
        ];
        
        setResults(allResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to perform search. Please try again.');
        toast.error('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query, navigate]);
  
  // If there's no query parameter, show an error
  useEffect(() => {
    if (location.pathname === '/search' && !query && !isLoading) {
      // Don't redirect, just display a message
      setError('No search query provided');
    }
  }, [location, query, isLoading]);
  
  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab);
  
  const tabs = [
    { id: 'all', label: 'All Results', count: results.length },
    { id: 'job', label: 'Jobs', count: results.filter(r => r.type === 'job').length },
    { id: 'counselor', label: 'Counselors', count: results.filter(r => r.type === 'counselor').length },
    { id: 'community', label: 'Communities', count: results.filter(r => r.type === 'community').length }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          {query ? `Search Results for "${query}"` : 'Search Results'}
        </h1>
        {!error && query && (
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Found {results.length} results
          </p>
        )}
      </div>
      
      {/* Display error message if there's an error */}
      {error && (
        <div className="mb-6 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            <p className="ml-2 text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
          </div>
          <div className="mt-3">
            <Link 
              to="/"
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
      
      {/* Only show tabs if there are results */}
      {results.length > 0 && (
        <div className="mb-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-wrap -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                {tab.label} 
                <span className="ml-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
          <span className="ml-2 text-neutral-600 dark:text-neutral-400">Searching...</span>
        </div>
      ) : query && filteredResults.length === 0 && !error ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Search className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-800 dark:text-neutral-200">No results found</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            We couldn't find anything matching "{query}". Try different keywords.
          </p>
        </div>
      ) : !error ? (
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <Link
              key={`${result.type}-${result.id}`}
              to={result.url}
              className="block rounded-md border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
                      {result.title}
                    </h3>
                    <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                      result.type === 'job' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      result.type === 'counselor' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {result.type}
                    </span>
                  </div>
                  <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    {result.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchResults;