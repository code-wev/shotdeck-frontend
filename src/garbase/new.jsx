// 1. First, update your sort options to match your API's expected values
const sortOptions = [
  { label: 'Most Popular', value: 'mostPopular' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Random', value: 'random' },
  { label: 'A-Z', value: 'a-z' },
];

// 2. Modify your buildQuery function to properly handle sorting
const buildQuery = useCallback((page = 1) => {
  const query = {};
  
  // Apply filters
  for (const key in selectedFilters) {
    if (selectedFilters[key].length > 0) {
      query[key] = selectedFilters[key];
    }
  }
  
  // Apply search
  if (searchTag.length > 0) {
    query.search = searchTag;
  } else if (submittedSearch && submittedSearch.trim() !== '') {
    query.search = submittedSearch;
  }
  
  // Apply sorting
  if (sortBy) {
    query.sortBy = sortBy;
    
    // Reset to page 1 when sorting changes
    query.page = 1;
  } else {
    query.page = page;
  }
  
  return query;
}, [selectedFilters, searchTag, submittedSearch, sortBy]);

// 3. Update your useEffect for handling sort changes
useEffect(() => {
  // Reset to first page and clear existing shots when sort changes
  setCurrentPage(1);
  setShots([]);
  setHasMore(true);
  loadingRef.current = false;
}, [sortBy]);

// 4. Modify your shot rendering to handle loading states
{isLoading && currentPage === 1 ? (
  // Show loading skeleton for initial load
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="aspect-video bg-gray-800 rounded-md animate-pulse" />
    ))}
  </div>
) : (
  // Show actual shots
  Array.from(new Map(shots?.map(shot => [shot._id, shot])).values()).map((data, idx, dedupedShots) => {
    // ... keep your existing image source logic ...

    return (
      <motion.div
        key={`${data._id}-${idx}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: idx * 0.03 }}
        ref={isLastElement ? lastShotElementRef : null}
        // ... rest of your shot rendering ...
      >
        {/* ... your shot content ... */}
      </motion.div>
    );
  }
)}

// 5. Add this to handle loading more shots
{(isLoading || isFetching) && currentPage > 1 && (
  <div className="col-span-full flex justify-center my-8">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
  </div>
)}