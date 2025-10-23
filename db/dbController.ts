import { SQLiteDatabase } from 'expo-sqlite';


export const createTables = async (db: SQLiteDatabase) => {
    try {
      await db.execAsync(`
          PRAGMA foreign_keys = ON;
          PRAGMA journal_mode = WAL;
  
        CREATE TABLE IF NOT EXISTS kategorije_njiva (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          naziv TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS njive (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          naziv TEXT NOT NULL,
          opis TEXT,
          slika TEXT,
          kategorija_id INTEGER NOT NULL,
          FOREIGN KEY (kategorija_id) REFERENCES kategorije_njiva(id)
        );

   
      `);
    } catch (error) {
      console.log("Creating tables error: " + error)
    }
  };

export const rollbackTables = async (db: SQLiteDatabase) => {
    console.log("Rollback tables...");
    await db.execAsync(`
        DROP TABLE IF EXISTS kategorije_njiva;
        DROP TABLE IF EXISTS njive;
    `);
  };

export const addFarmingFieldCategory = async (db: SQLiteDatabase) => {
  try {
    console.log("Adding Farming Fields Categories...");

    // lista kategorija
    const fields = ['Farma', 'Kanal', 'Padina', 'Pustara', 'Vojska', 'Stadion'];

    // proveri da li tabela postoji i ima svih 6 kategorija
    const result = await db.getAllAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM kategorije_njiva WHERE naziv IN (${fields.map(() => '?').join(',')});`,
      fields
    );

    const existingCount = result[0]?.count ?? 0;

    if (existingCount === fields.length) {
      console.log("Sve kategorije već postoje.");
      return;
    }

    for (const field of fields) {
      await db.execAsync(`
        INSERT INTO kategorije_njiva (naziv)
        SELECT '${field}'
        WHERE NOT EXISTS (
          SELECT 1 FROM kategorije_njiva WHERE naziv = '${field}'
        );
      `);
    }

    console.log("Kategorije uspešno dodate (ako su nedostajale).");
  } catch (error) {
    console.error("Greška pri dodavanju kategorija njiva:", error);
  }
};

// export const addFramingField1 = async  (db: SQLiteDatabase) => {
//   try{
//     console.log("Adding Farming Fields...")
//     await db.execAsync(`
//       INSERT INTO njive (naziv, opis, slika, kategorija_id) 
//       VALUES ('Njiva 1', 'Opis prve njive', 'slika1.png', 1);
//     `);

//   } catch (error){
//     console.error("Greska pri dodavanju njiva.")
//   }
// }
