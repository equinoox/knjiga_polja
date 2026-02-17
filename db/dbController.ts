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
          velicina REAL,
          pripadnost TEXT,
          kategorija_id INTEGER NOT NULL,
          FOREIGN KEY (kategorija_id) REFERENCES kategorije_njiva(id)
        );

        CREATE TABLE IF NOT EXISTS operacije_njive (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          datum TEXT,
          vrsta TEXT NOT NULL,
          traktor TEXT,
          prik_masina TEXT,
          potrosnja REAL,
          radnik TEXT,
          kolicina REAL,
          cena REAL,
          opis TEXT,
          hemija_id INTEGER,
          njiva_id INTEGER NOT NULL,
          FOREIGN KEY (hemija_id) REFERENCES hemije(id),
          FOREIGN KEY (njiva_id) REFERENCES njive(id)
        );

        CREATE TABLE IF NOT EXISTS hemije (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          naziv TEXT NOT NULL,
          kolicina_litara REAL NOT NULL DEFAULT 0,
          cena_po_litri REAL NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS prihodi_njive (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          datum TEXT NOT NULL,
          izvor TEXT,
          iznos REAL,
          njiva_id INTEGER NOT NULL,
          FOREIGN KEY (njiva_id) REFERENCES njive(id)
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
        DROP TABLE IF EXISTS operacije_njive;
        DROP TABLE IF EXISTS hemije;
        DROP TABLE IF EXISTS prihodi_njive;
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

    console.log("Kategorije uspešno dodate.");
    addFarmingFieldFarma(db);
    addFarmingFieldKanal(db);
    addFarmingFieldPadina(db);
    addFarmingFieldPustara(db);
    addFarmingFieldVojska(db);
    addFarmingFieldStadion(db);

  } catch (error) {
    console.error("Greška pri dodavanju kategorija njiva:", error);
  }
};

export const addFarmingFieldFarma = async (db: SQLiteDatabase) => {
  try {
    const fields = [
    // 1
      {
        naziv: 'Vaga',
        opis: '5502/2 KLAS',
        slika: 'vaga',
        velicina: 2.4,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 2 
      {
        naziv: 'Kudeljara',
        opis: '5502/2 KLAS',
        slika: 'kudeljara',
        velicina: 9.2,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 3
      {
        naziv: 'Prizme',
        opis: '5502/2 KLAS',
        slika: 'prizme',
        velicina: 1.23,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 4
      {
        naziv: 'Špic kod Kudeljare',
        opis: '5715 KLAS',
        slika: 'spic_kod_kudeljare',
        velicina: 3.1,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 5
      {
        naziv: 'Smilje',
        opis: '3556 Finagro',
        slika: 'smilje',
        velicina: 9.9,
        pripadnost: "Finagro",
        kategorija_id: 1
      },
      // 6
      {
        naziv: 'Preko puta Smilja',
        opis: '3608 KLAS',
        slika: 'preko_puta_smilja',
        velicina: 10.9,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 7
      {
        naziv: 'Iznad Smilja',
        opis: '3556 Finagro',
        slika: 'iznad_smilja',
        velicina: 31.1,
        pripadnost: "Finagro",
        kategorija_id: 1
      },
      // 8
      {
        naziv: 'Između Kanala',
        opis: '3608 KLAS',
        slika: 'izmedju_kanala',
        velicina: 22.9,
        pripadnost: "KLAS",
        kategorija_id: 1
      },

      // 9
      {
        naziv: 'Brdo 1',
        opis: '3556 Finagro',
        slika: 'brdo_2',
        velicina: 25.7,
        pripadnost: "Finagro",
        kategorija_id: 1
      },
      // 10
      {
        naziv: 'Brdo 2',
        opis: '3608 KLAS',
        slika: 'brdo_1',
        velicina: 41.7,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 11
      {
        naziv: 'Špic na Brdu 1',
        opis: '3537 Savo',
        slika: 'spic_brdo_1',
        velicina: 11,
        pripadnost: "Savo",
        kategorija_id: 1
      },
      // 12
      {
        naziv: 'Špic na Brdu 2',
        opis: '3538 Nikola',
        slika: 'spic_brdo_2',
        velicina: 11.9,
        pripadnost: "Nikola",
        kategorija_id: 1
      },
      // 13
      {
        naziv: 'Špic na Brdu 3',
        opis: '3675 KLAS',
        slika: 'spic_brdo_3',
        velicina: 12,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 14
      {
        naziv: 'Iza Farme 1',
        opis: '3467 KLAS',
        slika: 'iza_farme_1',
        velicina: 10,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 15
      {
        naziv: 'Iza Farme 2',
        opis: '3467 KLAS',
        slika: 'iza_farme_2',
        velicina: 20,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
      // 16
      {
        naziv: 'Iza Farme 3',
        opis: '3467 KLAS',
        slika: 'iza_farme_3',
        velicina: 25,
        pripadnost: "KLAS",
        kategorija_id: 1
      },
    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, velicina, pripadnost, kategorija_id) VALUES (?, ?, ?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.velicina ?? null, field.pripadnost ?? null, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};

export const addFarmingFieldKanal = async (db: SQLiteDatabase) => {
  try {
    const fields = [
      {
        naziv: 'Kanal',
        opis: '2606 KLAS',
        slika: 'kanal_donji_deo',
        velicina: 18.5,
        pripadnost: "KLAS",
        kategorija_id: 2
      },

    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, velicina, pripadnost, kategorija_id) VALUES (?, ?, ?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.velicina ?? null, field.pripadnost ?? null, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};

export const addFarmingFieldPadina = async (db: SQLiteDatabase) => {
  try {
    const fields = [
      {
        naziv: 'Padina Finagro',
        opis: '4999 - 5502 Finagro',
        slika: 'padina',
        velicina: 4.19,
        pripadnost: "Finagro",
        kategorija_id: 3
      },
      {
        naziv: 'Padina Dusan',
        opis: '5003 - 5015 Dusan',
        slika: 'padina',
        velicina: 35.81,
        pripadnost: "Dusan",
        kategorija_id: 3
      },
    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, velicina, pripadnost, kategorija_id) VALUES (?, ?, ?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.velicina ?? null, field.pripadnost ?? null, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};

export const addFarmingFieldPustara = async (db: SQLiteDatabase) => {
  try {
    const fields = [
      {
        naziv: 'Pustara Donji Deo',
        opis: '4598 Finagro',
        slika: 'pustara_donji_deo',
        velicina: 36.6,
        pripadnost: "Finagro",
        kategorija_id: 4
      },
      {
        naziv: 'Pustara Gornji Deo',
        opis: '4628 Finagro',
        slika: 'pustara_gornji_deo',
        velicina: 16.9,
        pripadnost: "Finagro",
        kategorija_id: 4
      },
      {
        naziv: 'Pustara Špic',
        opis: '4588 KLAS',
        slika: 'pustara_spic',
        velicina: 10.8,
        pripadnost: "KLAS",
        kategorija_id: 4
      }
    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, velicina, pripadnost, kategorija_id) VALUES (?, ?, ?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.velicina ?? null, field.pripadnost ?? null, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};

export const addFarmingFieldVojska = async (db: SQLiteDatabase) => {
  try {
    const fields = [
      {
        naziv: 'Vojska Donji Deo',
        opis: '1600, 1674/2 KLAS',
        slika: 'vojska_donji_deo',
        velicina: 1.92,
        pripadnost: "KLAS",
        kategorija_id: 5
      },
      {
        naziv: 'Vojska Gornji Deo',
        opis: '1698 KLAS',
        slika: 'vojska_gornji_deo',
        velicina: 3,
        pripadnost: "KLAS",
        kategorija_id: 5
      }
    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, velicina, pripadnost, kategorija_id) VALUES (?, ?, ?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.velicina ?? null, field.pripadnost ?? null, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};

export const addFarmingFieldStadion = async (db: SQLiteDatabase) => {
  try {
    const fields = [
      {
        naziv: 'Stadion 1',
        opis: '5412 KLAS',
        slika: 'stadion_1',
        velicina: 13.7,
        pripadnost: "KLAS",
        kategorija_id: 6
      },
      {
        naziv: 'Stadion 2',
        opis: '5404 KLAS',
        slika: 'stadion_2',
        velicina: 16.6,
        pripadnost: "KLAS",
        kategorija_id: 6
      }
    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, velicina, pripadnost, kategorija_id) VALUES (?, ?, ?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.velicina ?? null, field.pripadnost ?? null, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};

/**
 * Migration: add cena_po_litri column to hemije table if it doesn't exist.
 */
export const migrateHemijeCena = async (db: SQLiteDatabase) => {
  try {
    const columns = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(hemije)`
    );
    const hasCena = columns.some(c => c.name === 'cena_po_litri');
    if (!hasCena) {
      await db.execAsync(`ALTER TABLE hemije ADD COLUMN cena_po_litri REAL NOT NULL DEFAULT 0`);
      console.log('Migration: cena_po_litri column added to hemije.');
    }
  } catch (error) {
    console.error('Error migrating hemije cena:', error);
  }
};

/**
 * Backfill pripadnost for existing rows that have NULL pripadnost.
 * Maps each field name to its correct pripadnost value.
 */
export const backfillPripadnost = async (db: SQLiteDatabase) => {
  const mapping: Record<string, string> = {
    'Vaga': 'KLAS',
    'Kudeljara': 'KLAS',
    'Prizme': 'KLAS',
    'Špic kod Kudeljare': 'KLAS',
    'Smilje': 'Finagro',
    'Preko puta Smilja': 'KLAS',
    'Iznad Smilja': 'Finagro',
    'Između Kanala': 'KLAS',
    'Brdo 1': 'Finagro',
    'Brdo 2': 'KLAS',
    'Špic na Brdu 1': 'Savo',
    'Špic na Brdu 2': 'Nikola',
    'Špic na Brdu 3': 'KLAS',
    'Iza Farme 1': 'KLAS',
    'Iza Farme 2': 'KLAS',
    'Iza Farme 3': 'KLAS',
    'Kanal': 'KLAS',
    'Padina Finagro': 'Finagro',
    'Padina Dusan': 'Dusan',
    'Pustara Donji Deo': 'Finagro',
    'Pustara Gornji Deo': 'Finagro',
    'Pustara Špic': 'KLAS',
    'Vojska Donji Deo': 'KLAS',
    'Vojska Gornji Deo': 'KLAS',
    'Stadion 1': 'KLAS',
    'Stadion 2': 'KLAS',
  };

  try {
    for (const [naziv, pripadnost] of Object.entries(mapping)) {
      await db.runAsync(
        'UPDATE njive SET pripadnost = ? WHERE naziv = ? AND (pripadnost IS NULL OR pripadnost = ?)',
        [pripadnost, naziv, '']
      );
    }
    console.log('Pripadnost backfill complete.');
  } catch (error) {
    console.error('Error backfilling pripadnost:', error);
  }
};