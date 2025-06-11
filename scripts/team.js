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
  console.log(dateStr)
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

const db = new DB({
  filename: "./source/_data/db.json"
});

const teams = db.read('team');
const matches = db.read('match');

const teamsDir = 'source/teams';

// Créer le dossier des équipes si il n'existe pas
if (!fs.existsSync(teamsDir)) {
  fs.mkdirSync(teamsDir, { recursive: true });
}

teams.forEach(team => {
  const teamFilename = path.join(teamsDir, `${team.teamName.replace(/ /g, '-')}/index.md`);
  if (!fs.existsSync(teamFilename)) {
    fs.mkdirSync(path.dirname(teamFilename), { recursive: true });
  }

  // Trouver toutes les sessions où l'équipe a joué
  const teamSessions = matches
    .filter(match => match.team1 === team.teamName || match.team2 === team.teamName)
    .map(match => match.session)
    .filter((session, index, self) => self.indexOf(session) === index)
    .sort();

  // Vérifier si le fichier existe avant de le créer
  
    let teamContent = `---\ntitle: Équipe ${team.teamName}\ndate: ${new Date().toISOString()}\nlayout: team\n---\n\n# ${team.teamName}\n\n`;
    teamContent+=`## contact \n\n${team.coach}\n\n${team.coachContact}\n\n${team.coachEmail}\n\n`
    // Ajouter la section des sessions
    if (teamSessions.length > 0) {
      teamContent += `## Sessions\n\n`;
      teamSessions.forEach(session => {
        teamContent += `### Session ${session}\n`;
        teamContent += `- [résultats aller ](/scores/session-${session}/groupe-${team.group}/aller/)\n`;
        teamContent += `- [résultats retour](/scores/session-${session}/groupe-${team.group}/retour/)\n\n`;

        const sessionMatches = matches.filter(match => 
          match.session === session && 
          (match.team1 === team.teamName || match.team2 === team.teamName)
        );

        if (sessionMatches.length > 0) {
          const now = new Date();
          
          // Fonction pour parser la date en français
       

          // Matchs Aller (home)
          teamContent += `#### Matchs Aller\n\n`;
          const allerMatches = sessionMatches.filter(match => 
            match.team1 === team.teamName || match.team2 === team.teamName
          );
          
          // Matchs passés
          const pastAllerMatches = allerMatches.filter(match => parseFrenchDate(match.homeDate) < now);
          if (pastAllerMatches.length > 0) {
            teamContent += `##### Matchs passés\n\n`;
            pastAllerMatches.forEach(match => {
              teamContent += `- [${match.team1.replace(/ /g, '-')}](/teams/${match.team1.replace(/ /g, '-')}) vs [${match.team2.replace(/ /g, '-')}](/teams/${match.team2.replace(/ /g, '-')}) [${match.homeLocation.replace(/ /g, '-')}](/stades/${match.homeLocation.replace(/ /g, '-')}) - ${match.homeDate}\n`;
            });
            teamContent += `\n`;
          }

          // Matchs à venir
          const futureAllerMatches = allerMatches.filter(match => parseFrenchDate(match.homeDate) >= now);
          if (futureAllerMatches.length > 0) {
            teamContent += `##### Matchs à venir\n\n`;
            futureAllerMatches.forEach(match => {
              teamContent += `- [${match.team1.replace(/ /g, '-')}](/teams/${match.team1.replace(/ /g, '-')}) vs [${match.team2.replace(/ /g, '-')}](/teams/${match.team2.replace(/ /g, '-')}) [${match.homeLocation.replace(/ /g, '-')}](/stades/${match.homeLocation.replace(/ /g, '-')}) - ${match.homeDate}\n`;
            });
            teamContent += `\n`;
          }

          // Matchs Retour (away)
          teamContent += `#### Matchs Retour\n\n`;
          
          // Matchs passés
          const pastRetourMatches = allerMatches.filter(match => parseFrenchDate(match.awayDate) < now);
          if (pastRetourMatches.length > 0) {
            teamContent += `##### Matchs passés\n\n`;
            pastRetourMatches.forEach(match => {
              teamContent += `- [${match.team2.replace(/ /g, '-')}](/teams/${match.team2.replace(/ /g, '-')}) vs [${match.team1.replace(/ /g, '-')}](/teams/${match.team1.replace(/ /g, '-')}) [${match.awayLocation.replace(/ /g, '-')}](/stades/${match.awayLocation.replace(/ /g, '-')}) - ${match.awayDate}\n`;
            });
            teamContent += `\n`;
          }

          // Matchs à venir
          const futureRetourMatches = allerMatches.filter(match => parseFrenchDate(match.awayDate) >= now);
          if (futureRetourMatches.length > 0) {
            teamContent += `##### Matchs à venir\n\n`;
            futureRetourMatches.forEach(match => {
              teamContent += `- [${match.team2.replace(/ /g, '-')}](/teams/${match.team2.replace(/ /g, '-')}) vs [${match.team1.replace(/ /g, '-')}](/teams/${match.team1.replace(/ /g, '-')}) [${match.awayLocation.replace(/ /g, '-')}](/stades/${match.awayLocation.replace(/ /g, '-')}) - ${match.awayDate}\n`;
            });
            teamContent += `\n`;
          }
        }
      });
    }

    fs.writeFileSync(teamFilename, teamContent);
    console.log(`Page créée pour l'équipe ${team.teamName} (${team._id})`);

});

// Pour que la classe DB soit accessible depuis d'autres fichiers, ajoutez export { DB }; dans match.js
