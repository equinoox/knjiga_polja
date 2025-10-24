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
      {
        naziv: 'Brdo Donji Deo',
        opis: 'Brdo',
        slika: 'brdo_donji_deo',
        kategorija_id: 1
      },
      {
        naziv: 'Brdo Gornji Deo',
        opis: 'Brdo',
        slika: 'brdo_gornji_deo',
        kategorija_id: 1
      },
      {
        naziv: 'Dupla Duž 1',
        opis: 'Duž',
        slika: 'dupla_duz_1',
        kategorija_id: 1
      },
      {
        naziv: 'Dupla Duž 2',
        opis: 'Duž',
        slika: 'dupla_duz_2',
        kategorija_id: 1
      },
      {
        naziv: 'Džep',
        opis: 'Džep',
        slika: 'dzep',
        kategorija_id: 1
      },
      {
        naziv: 'Iza Farme 1',
        opis: 'Iza Farme',
        slika: 'iza_farme_1',
        kategorija_id: 1
      },
      {
        naziv: 'Iza Farme 2',
        opis: 'Iza Farme',
        slika: 'iza_farme_2',
        kategorija_id: 1
      },
      {
        naziv: 'Iza Farme 3',
        opis: 'Iza Farme',
        slika: 'iza_farme_3',
        kategorija_id: 1
      },
      {
        naziv: 'Između Kanala',
        opis: 'Iza Farme',
        slika: 'izmedju_kanala',
        kategorija_id: 1
      },
      {
        naziv: 'Iznad Smilja',
        opis: 'Smilje',
        slika: 'iznad_smilja',
        kategorija_id: 1
      },
      {
        naziv: 'Kudeljara',
        opis: 'Kudeljara',
        slika: 'kudeljara',
        kategorija_id: 1
      },
      {
        naziv: 'Špic kod Kudeljare',
        opis: 'Smilje',
        slika: 'spic_kod_kudeljare',
        kategorija_id: 1
      },
      {
        naziv: 'Preko puta Smilja',
        opis: 'Smilja',
        slika: 'preko_puta_smilja',
        kategorija_id: 1
      },
      {
        naziv: 'Prizme',
        opis: 'Prizme',
        slika: 'prizme',
        kategorija_id: 1
      },
      {
        naziv: 'Smilje',
        opis: 'Smilje',
        slika: 'smilje',
        kategorija_id: 1
      },
      {
        naziv: 'Špic na Brdu 1',
        opis: 'Špic na Brdu',
        slika: 'spic_na_brdu_1',
        kategorija_id: 1
      },
      {
        naziv: 'Špic na Brdu 2',
        opis: 'Špic na Brdu',
        slika: 'spic_na_brdu_2',
        kategorija_id: 1
      },
      {
        naziv: 'Vaga',
        opis: 'Vaga',
        slika: 'vaga',
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
          'INSERT INTO njive (naziv, opis, slika, kategorija_id) VALUES (?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.kategorija_id]
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
        naziv: 'Kanal Donji Deo',
        opis: 'Kanal',
        slika: 'kanal_donji_deo',
        kategorija_id: 2
      },
      {
        naziv: 'Kanal Gornji Deo',
        opis: 'Kanal',
        slika: 'kanal_gornji_deo',
        kategorija_id: 2
      }
    ];

    for (const field of fields) {
      const exists = await db.getAllAsync(
        'SELECT id FROM njive WHERE naziv = ?',
        [field.naziv]
      );

      if (exists.length === 0) {
        await db.runAsync(
          'INSERT INTO njive (naziv, opis, slika, kategorija_id) VALUES (?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.kategorija_id]
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
        naziv: 'Padina',
        opis: 'Padina',
        slika: 'padina',
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
          'INSERT INTO njive (naziv, opis, slika, kategorija_id) VALUES (?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.kategorija_id]
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
        opis: 'Pustara',
        slika: 'pustara_donji_deo',
        kategorija_id: 4
      },
      {
        naziv: 'Pustara Gornji Deo',
        opis: 'Pustara',
        slika: 'pustara_gornji_deo',
        kategorija_id: 4
      },
      {
        naziv: 'Pustara Špic',
        opis: 'Pustara',
        slika: 'pustara_spic',
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
          'INSERT INTO njive (naziv, opis, slika, kategorija_id) VALUES (?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.kategorija_id]
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
        opis: 'Donji deo parcele Vojska',
        slika: 'vojska_donji_deo',
        kategorija_id: 5
      },
      {
        naziv: 'Vojska Gornji Deo',
        opis: 'Gornji deo parcele Vojska',
        slika: 'vojska_gornji_deo',
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
          'INSERT INTO njive (naziv, opis, slika, kategorija_id) VALUES (?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.kategorija_id]
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
        opis: 'Stadion',
        slika: 'stadion_1',
        kategorija_id: 6
      },
      {
        naziv: 'Stadion 2',
        opis: 'Stadion',
        slika: 'stadion_2',
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
          'INSERT INTO njive (naziv, opis, slika, kategorija_id) VALUES (?, ?, ?, ?)',
          [field.naziv, field.opis, field.slika, field.kategorija_id]
        );
      }
    }
  } catch (error) {
    console.error('Greška pri dodavanju njiva:', error);
    throw error;
  }
};