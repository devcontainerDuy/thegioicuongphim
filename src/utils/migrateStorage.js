/**
 * Migration utility to consolidate favorites into watchlist
 * Run once on app initialization
 */

export const migrateFavoritesToWatchlist = () => {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem('favorites_migrated');
    if (migrated === 'true') {
      return { migrated: true, count: 0 };
    }

    // Get existing data
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

    // Merge unique items by ID
    const allItems = [...favorites, ...watchlist];
    const uniqueMap = new Map();
    
    allItems.forEach(item => {
      if (item && item.id) {
        uniqueMap.set(item.id, item);
      }
    });

    const merged = Array.from(uniqueMap.values());

    // Save merged data
    localStorage.setItem('watchlist', JSON.stringify(merged));
    localStorage.setItem('favorites_migrated', 'true');

    // Keep old favorites for 7 days as backup
    const backupExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('favorites_backup', JSON.stringify({
      data: favorites,
      expiry: backupExpiry
    }));

    console.log(`✅ Migrated ${favorites.length} favorites + ${watchlist.length} watchlist → ${merged.length} unified items`);

    return { 
      migrated: true, 
      count: merged.length,
      fromFavorites: favorites.length,
      fromWatchlist: watchlist.length
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { migrated: false, error: error.message };
  }
};

/**
 * Cleanup old backup after expiry
 */
export const cleanupOldBackup = () => {
  try {
    const backup = localStorage.getItem('favorites_backup');
    if (backup) {
      const { expiry } = JSON.parse(backup);
      if (Date.now() > expiry) {
        localStorage.removeItem('favorites_backup');
        console.log('🧹 Cleaned up expired favorites backup');
      }
    }
  } catch (error) {
    console.error('Failed to cleanup backup:', error);
  }
};

export default migrateFavoritesToWatchlist;
