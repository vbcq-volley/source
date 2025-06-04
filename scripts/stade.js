const fs = require('fs');
const path = require('path');

class DB {
    constructor(options, filename) {
        if (!options || typeof options !== 'object') {
            throw new Error('Options must be an object');
        }
        this.options = options;
        this.data = {};
        this.filename = filename||this.options.filename||'./db.json';
        
        try {
            this.loadFromFile(this.filename);
        } catch (error) {
            console.error(`Error loading database: ${error.message}`);
            this.data = {};
        }
    }

    model(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Model name must be a non-empty string');
        }

        if (!this.data[name]) {
            this.data[name] = {
                entries: [],
                metadata: {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            };
        }

        return this.data[name];
    }

    read(modelName) {
        try {
            const model = this.model(modelName);
            return model.entries.map((entry, index) => ({...entry, index})) || [];
        } catch (error) {
            console.error(`Error reading entries: ${error.message}`);
            throw error;
        }
    }

    loadFromFile(filename) {
        try {
            if (fs.existsSync(filename)) {
                const fileData = fs.readFileSync(filename, 'utf8');
                this.data = JSON.parse(fileData);
            }
        } catch (error) {
            console.error(`Error loading from file: ${error.message}`);
            throw error;
        }
    }
}

const db = new DB({ 
  filename: "./source/_data/db.json"
});

// Récupérer tous les stades
const stades = db.read('stade');

// Créer le dossier pour les stades s'il n'existe pas
const stadesDir = 'source/stades';
if (!fs.existsSync(stadesDir)) {
  fs.mkdirSync(stadesDir, { recursive: true });
}

// Fonction pour parser une date française du type "31 mars 2025 à 20:30"
function parseFrenchDate(dateStr) {
  if (!dateStr) return new Date(0);
  // Remplacer les mois français par les mois anglais pour que Date les comprenne
  const mois = {
    janvier: 'January',
    février: 'February',
    mars: 'March',
    avril: 'April',
    mai: 'May',
    juin: 'June',
    juillet: 'July',
    août: 'August',
    septembre: 'September',
    octobre: 'October',
    novembre: 'November',
    décembre: 'December'
  };
  let d = dateStr.toLowerCase();
  d = d.replace(/à/, '').replace(/h/, ':');
  Object.entries(mois).forEach(([fr, en]) => {
    d = d.replace(fr, en);
  });
  // Enlever les accents éventuels
  d = d.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  return new Date(d);
}

// Générer une page pour chaque stade
stades.forEach(stade => {
  const stadeContent = `---
title: ${stade.stadeName}
date: ${new Date().toISOString()}
layout: stade
---



## Informations
- **Adresse**: ${stade.address}
- **Map**: __map__
## Matchs à venir
${db.read('match')
  .filter(match => 
    (match.homeLocation === stade.stadeName || match.awayLocation === stade.stadeName) &&
    parseFrenchDate(match.homeDate) > new Date()
  )
  .map(match => `
### ${match.title}
- Date: ${match.homeDate}
- Groupe: ${match.group}
- Session: ${match.session}
`).join('\n')}

## Matchs passés
${db.read('match')
  .filter(match => 
    (match.homeLocation === stade.stadeName || match.awayLocation === stade.stadeName) &&
    parseFrenchDate(match.homeDate) <= new Date()
  )
  .map(match => `
### ${match.title}
- Date: ${match.homeDate}
- Groupe: ${match.group}
- Session: ${match.session}
`).join('\n')}
`;

  const stadeFilename = `${stadesDir}/${stade.stadeName.toLowerCase().replace(/\s+/g, '-')}/index.md`;
  if (!fs.existsSync(path.dirname(stadeFilename))) {
    fs.mkdirSync(path.dirname(stadeFilename), { recursive: true });
  }
  fs.writeFileSync(stadeFilename, stadeContent);
});

// Créer la page d'index des stades
const indexContent = `---
title: Stades
date: ${new Date().toISOString()}
layout: page
---

# Liste des stades

${stades.map(stade => `
## [${stade.stadeName}](/stades/${stade.stadeName.toLowerCase().replace(/\s+/g, '-')}/)
- Adresse: ${stade.address}
`).join('\n')}
`;

const indexFilename = `${stadesDir}/index.md`;
fs.writeFileSync(indexFilename, indexContent);
