// components/CollectionManager.js
'use client';
import { useState, useEffect } from 'react';
import { useSecureAxios } from '@/utils/Axios';
import Swal from 'sweetalert2';

const CollectionManager = ({ shotId, shotData, userId }) => {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [existingCollections, setExistingCollections] = useState([]);
  const axiosInstance = useSecureAxios();

  // Fetch user's collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axiosInstance.get(`/shot/collection/user/${userId}`);
        setExistingCollections(response.data);
        
        // Check which collections already contain this shot
        const shotCollections = response.data.filter(c => c.shotId === shotId);
        setCollections(shotCollections.map(c => c.collectionName));
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };
    
    if (userId && showModal) {
      fetchCollections();
    }
  }, [userId, showModal, shotId]);

  const handleAddToCollection = async (collectionName) => {
    try {
      const response = await axiosInstance.post('/shot/collection/', {
        userId,
        shotId,
        data: shotData,
        collectionName
      });

      if (response.status === 201) {
        setCollections(prev => [...prev, collectionName]);
        Swal.fire({
          title: 'Success',
          text: 'Shot added to collection',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to add to collection',
        icon: 'error',
      });
    }
  };

  const handleRemoveFromCollection = async (collectionName) => {
    try {
      const response = await axiosInstance.delete(`/shot/collection/`, {
        data: {
          userId,
          shotId,
          collectionName
        }
      });

      if (response.status === 200) {
        setCollections(prev => prev.filter(name => name !== collectionName));
        Swal.fire({
          title: 'Removed',
          text: 'Shot removed from collection',
          icon: 'success',
        });
      }
    } catch (error) {
      console.error('Error removing from collection:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to remove from collection',
        icon: 'error',
      });
    }
  };

  const createNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      await handleAddToCollection(newCollectionName);
      setNewCollectionName('');
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <div className="relative">
      {/* Collection Flag */}
      <button 
        onClick={() => setShowModal(true)}
        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100 transition-all"
      >
        {collections.length > 0 ? '⭐' : '✚'}
      </button>

      {/* Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="bg-[#1a1a1a] p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manage Collections</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-red-500"
              >
                ×
              </button>
            </div>

            {/* New Collection Input */}
            <div className="flex mb-6">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New collection name"
                className="flex-1 px-3 py-2 text-sm text-white bg-[#333333] border border-gray-600 rounded-l focus:outline-none"
              />
              <button
                onClick={createNewCollection}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r"
              >
                Create
              </button>
            </div>

            {/* Existing Collections */}
            <div className="space-y-4">
              <h4 className="font-medium">Your Collections:</h4>
              {existingCollections.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from(new Set(existingCollections.map(c => c.collectionName))).map((name, idx) => (
                    <div 
                      key={idx}
                      className={`border rounded p-3 cursor-pointer transition-colors ${
                        collections.includes(name) 
                          ? 'border-yellow-400 bg-yellow-400 bg-opacity-10' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      onClick={() => 
                        collections.includes(name)
                          ? handleRemoveFromCollection(name)
                          : handleAddToCollection(name)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span>{name}</span>
                        {collections.includes(name) && (
                          <span className="text-yellow-400">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {existingCollections.filter(c => c.collectionName === name).length} items
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No collections yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionManager;