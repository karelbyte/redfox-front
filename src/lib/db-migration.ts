/**
 * Utilidad para migrar la base de datos IndexedDB
 * 
 * En desarrollo, si hay cualquier problema, simplemente borra y recrea la base de datos.
 */

import { db } from './db';

export async function migrateDatabase() {
  try {
    console.log('🔄 Checking database version...');
    
    // Dexie maneja automáticamente las migraciones
    await db.open();
    
    console.log('✅ Database ready');
    console.log(`Current version: ${db.verno}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database error:', error);
    
    // En desarrollo, simplemente borramos y recreamos
    console.log('🗑️ Deleting old database...');
    try {
      await db.delete();
      console.log('✅ Database deleted, will be recreated automatically');
      
      // Recargar la página para que se recree limpia
      window.location.reload();
    } catch (deleteError) {
      console.error('Failed to delete database:', deleteError);
    }
    
    return false;
  }
}

/**
 * Forzar recreación de la base de datos (útil en desarrollo)
 */
export async function resetDatabase() {
  try {
    console.log('🗑️ Resetting database...');
    await db.delete();
    console.log('✅ Database reset complete');
    window.location.reload();
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
}

// Exponer función global para desarrollo
if (typeof window !== 'undefined') {
  (window as any).resetDB = resetDatabase;
  console.log('💡 Tip: Run resetDB() in console to reset the database');
}
