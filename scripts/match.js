const fs=require('fs')
const uuid=require('uuid')
const path=require('path')
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

    /**
     * Create or retrieve a model
     * @param {string} name - The name of the model
     * @returns {object} The model
     */
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

    /**
     * Create a new entry in the model
     * @param {string} modelName - The name of the model
     * @param {object} entry - The entry to create
     */
    create(modelName, entry) {
        try {
            const model = this.model(modelName);
            if (!entry) {
                throw new Error('Entry data is required');
            }
            
            entry._id = entry._id || uuid.v7();
            entry.created_at = new Date().toISOString();
            entry.updated_at = entry.created_at;
            
            model.entries.push(entry);
            model.metadata.updated_at = entry.updated_at;
            model.entries.map((entry, index) => ({...entry, index}))
            this.saveToFile(this.filename);
            return entry;
        } catch (error) {
            console.error(`Error creating entry: ${error.message}`);
            throw error;
        }
    }

    /**
     * Retrieve entries from the model
     * @param {string} modelName - The name of the model
     * @returns {array} The list of entries
     */
    read(modelName) {
        try {
            const model = this.model(modelName);
            console.log(model.entries)
            return model.entries.map((entry, index) => ({...entry, index})) || [];
        } catch (error) {
            console.error(`Error reading entries: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update an entry in the model
     * @param {string} modelName - The name of the model
     * @param {number} index - The index of the entry to update
     * @param {object} newEntry - The new entry data
     */
    update(modelName, index, newEntry) {
        try {
            const model = this.model(modelName);
            if (!model.entries || !model.entries[index]) {
                throw new Error('Entry not found');
            }
            
            newEntry.updated_at = new Date().toISOString();
            model.entries[index] = { ...model.entries[index], ...newEntry };
            if (model.metadata) {
                model.metadata.updated_at = newEntry.updated_at;
            } else {
                model.metadata = { updated_at: newEntry.updated_at };
            }
            
            this.saveToFile(this.filename);
            return model.entries[index];
        } catch (error) {
            console.error(`Error updating entry: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete an entry from the model
     * @param {string} modelName - The name of the model
     * @param {number} index - The index of the entry to delete
     */
    delete(modelName, index) {
        try {
            const model = this.model(modelName);
            if (!model.entries || !model.entries[index]) {
                throw new Error('Entry not found');
            }
            
            model.entries.splice(index, 1);
            model.metadata.updated_at = new Date().toISOString();
            
            this.saveToFile(this.filename);
        } catch (error) {
            console.error(`Error deleting entry: ${error.message}`);
            throw error;
        }
    }

    /**
     * Save the data to a file
     * @param {string} filename - The name of the file to save the data
     */
    saveToFile(filename) {
        try {
            fs.writeFileSync(filename, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error(`Error saving to file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load the data from a file
     * @param {string} filename - The name of the file to load the data from
     */
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

    /**
     * Set up automatic saving of data
     */
   
}
const db=new DB({ 
  filename:"./source/_data/db.json"
})
const groups = [...new Set(db.read('team').map(team => parseInt(team.group)))];
const sessions = [...new Set(db.read('match').map(match => parseInt(match.session)))];
console.log("les donnée sont ")
console.log(groups,sessions)
// Créer les dossiers pour chaque groupe si ils n'existent pas
for (const group of groups) {
  const groupDir = `source/groupe-${group}`;
  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
  }
  
  // Créer le fichier index.md pour chaque groupe avec les liens vers les sessions
  const groupContent = `---
title: groupe_${group}
date: ${new Date().toISOString()}
layout: championnat
group: ${group}
---

# Groupe ${group}

## Sessions

${sessions.map(session => `
### Session ${session}
- [Matchs Aller](/scores/session-${session}/groupe-${group}/aller/)
- [Matchs Retour](/scores/session-${session}/groupe-${group}/retour/)
`).join('\n')}
`;
  
  const groupIndexFile = `${groupDir}/index.md`;
  fs.writeFileSync(groupIndexFile, groupContent);
}



// Générer les scores pour chaque session et groupe
const generateScores = async () => {
  const scores = {};
  
  // Pour chaque session
  for (const session of sessions) {
    scores[session] = {};
    
    // Pour chaque groupe
    for (const group of groups) {
      // Récupérer les matchs de cette session et ce groupe
      const matches = db.read('result').filter(match => 
        parseInt(match.session) === session && parseInt(match.group)==group
      );
      
      // Calculer les scores
      const groupScores = matches.map(match => ({
        team1: match.team1,
        team2: match.team2,
        score1: match.team1Score,
        score2: match.team2Score,
        date: match.date,
        type: match.matchType || 'home' // Ajout du type de match (aller/retour)
      }));
      
      scores[session][group] = groupScores;
    }
  }
  
  // Générer les posts Hexo pour chaque session et groupe
  for (const session of sessions) {
    // Créer le fichier principal de la session
    const mainContent = `---
title: Scores Session ${session}
date: ${new Date().toISOString()}
layout: session
---

# Scores Session ${session}

${groups.map(group => `
## [Groupe ${group} - Aller](/scores/session-${session}/groupe-${group}/aller/)
## [Groupe ${group} - Retour](/scores/session-${session}/groupe-${group}/retour/)
`).join('\n')}
`;

    // Écrire le fichier principal
    const mainFilename = `source/scores-session-${session}/index.md`;
    if (!fs.existsSync(path.dirname(mainFilename))) {
        fs.mkdirSync(path.dirname(mainFilename), { recursive: true });
      }
    fs.writeFileSync(mainFilename, mainContent);

    // Créer un dossier pour les groupes de cette session
    const sessionDir = `source/scores/session-${session}`;
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Générer un fichier pour chaque groupe
    for (const group of groups) {
      // Créer le fichier pour les matchs aller
      const allerContent = `---
title: Scores Session ${session} - Groupe ${group} - Matchs Aller
date: ${new Date().toISOString()}
layout: aller
concern_group: ${group}
---



| Équipe 1 | Équipe 2 | Score | Date |
|----------|----------|-------|------|
${scores[session][group].filter(match => match.type === 'home').map(match => 
  `| ${match.team1} | ${match.team2} | ${match.score1}-${match.score2} | ${match.date} |`
).join('\n')}
`;
const retourContent = `---
title: Scores Session ${session} - Groupe ${group} - Matchs Retour
date: ${new Date().toISOString()}
layout: retour
concern_group: ${group}
---



| Équipe 1 | Équipe 2 | Score | Date |
|----------|----------|-------|------|
${scores[session][group].filter(match => match.type !== 'home').map(match => 
  `| ${match.team1} | ${match.team2} | ${match.score1}-${match.score2} | ${match.date} |`
).join('\n')}
`;
      // Créer le fichier pour les matchs retour
    
      console.log(allerContent)
      console.log(retourContent)
      // Écrire le fichier du groupe
      const allerFilename = `${sessionDir}/groupe-${group}/aller/index.md`;
      const retourFilename = `${sessionDir}/groupe-${group}/retour/index.md`;
        if (!fs.existsSync(path.dirname(allerFilename))) {
            fs.mkdirSync(path.dirname(allerFilename), { recursive: true });
        }
        if (!fs.existsSync(path.dirname(retourFilename))) {
            fs.mkdirSync(path.dirname(retourFilename), { recursive: true });
        }
      fs.writeFileSync(allerFilename, allerContent);
      fs.writeFileSync(retourFilename, retourContent);
    }
  }
};

// Exécuter la génération
generateScores();




