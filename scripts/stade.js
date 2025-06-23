const fs = require('fs');
const path = require('path');
const formatDate=(date)=>{
  if (!date) return '';
  if (typeof date === 'string' && date.includes('/')) {
    const [datePart, timePart] = date.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    date = new Date(year, month - 1, day, hours, minutes);
  }
  const d = new Date(date);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} à ${hours}:${minutes}`;
}
const parseFrenchDate = (dateSr) => {
  const dateStr=formatDate(dateSr)
  //console.log(dateStr)
  const months = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
  };
  
  const parts = dateStr.split(' ');
  const day = parseInt(parts[0]);
  const month = months[parts[1].toLowerCase()];
  const year = parseInt(parts[2]);
  const time = parts[4].split(':');
  const hours = parseInt(time[0]);
  const minutes = parseInt(time[1]);
  
  return new Date(year, month, day, hours, minutes);
};
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


// Générer une page pour chaque stade
stades.forEach(stade => {
  const stadeContent = `---
title: ${stade.stadeName}
date: ${new Date().toISOString()}
layout: stade
categories:
  - stade
---



## Informations
- **Adresse**: ${stade.address}
- **Map**: map
${stade.description}
## Matchs à venir
${db.read('match')
  .filter(match => 
    (match.homeLocation === stade.stadeName || match.awayLocation === stade.stadeName) &&
    parseFrenchDate(match.homeDate) > new Date()
  )
  .map(match => `
### ${match.title}
- Date: ${formatDate(match.homeDate)}
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
- Date: ${formatDate(match.homeDate)}
- Groupe: ${match.group}
- Session: ${match.session}
`).join('\n')}
`;

  const stadeFilename = `${stadesDir}/${stade.stadeName.replace(/ /g, '-')}/index.md`;
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
## [${stade.stadeName.replace(/ /g, '-')}](/stades/${stade.stadeName.replace(/ /g, '-')}/)
- Adresse: ${stade.address}
`).join('\n')}

`;

const indexFilename = `${stadesDir}/index.md`;
fs.writeFileSync(indexFilename, indexContent);
