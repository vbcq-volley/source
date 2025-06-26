const fs=require("fs")
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
            //console.log(model.entries)
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
// Fonction pour récupérer les tournois existants
function getTournaments() {
    // Les tournois sont déjà stockés dans db.json sous forme de matchs et classements
    const matches = db.read('tournament_matches');
    const rankings = db.read('tournament_ranking');
    const results = db.read('tournament_results');

    // Créer une structure de tournoi à partir des données existantes
    const tournaments = [];
    
    // Grouper les matchs par tournoi (on pourrait utiliser une date de début comme identifiant)
    const tournamentGroups = {};
    matches.forEach(match => {
        const tournamentId = match.round === 'poule' ? 'tournoi-ete-2025' : 'tournoi-finale';
        if (!tournamentGroups[tournamentId]) {
            tournamentGroups[tournamentId] = {
                name: tournamentId === 'tournoi-ete-2025' ? 'Tournoi d\'Été 2025' : 'Tournoi Final',
                startDate: Math.min(...matches.map(m => new Date(m.matchDate))),
                endDate: Math.max(...matches.map(m => new Date(m.matchDate))),
                status: 'in_progress',
                groups: [],
                matches: [],
                rankings: [],
                results: []
            };
        }
        tournamentGroups[tournamentId].matches.push(match);
    });

    // Ajouter les classements
    rankings.forEach((rankingGroup, groupIndex) => {
        const tournamentId = 'tournoi-ete-2025'; // Pour l'instant, on considère que tous les classements sont du tournoi d'été
        if (tournamentGroups[tournamentId]) {
            tournamentGroups[tournamentId].rankings.push({
                group: `Poule ${groupIndex + 1}`,
                teams: rankingGroup
            });
        }
    });

    // Ajouter les résultats
    results.forEach(result => {
        const tournamentId = result.round === 'poule' ? 'tournoi-ete-2025' : 'tournoi-finale';
        if (tournamentGroups[tournamentId]) {
            tournamentGroups[tournamentId].results.push(result);
        }
    });

    // Convertir l'objet en tableau
    Object.values(tournamentGroups).forEach(tournament => {
        tournaments.push(tournament);
    });

    return tournaments;
}

// Exporter la fonction de lecture
module.exports = {
    getTournaments
};