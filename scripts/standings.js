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

const groups = [...new Set(db.read('team').map(team => parseInt(team.group)))];
const sessions = [...new Set(db.read('match').map(match => parseInt(match.session)))];

// Fonction pour calculer le classement d'un groupe
function calculateStandings(group) {
  const matches = db.read('result').filter(match => parseInt(match.group) === group);
  const teams = db.read('team').filter(team => parseInt(team.group) === group);
  
  // Initialiser les statistiques des équipes
  const teamStats = {};
  teams.forEach(team => {
    teamStats[team.teamName] = {
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      
    };
  });

  // Calculer les statistiques pour chaque match
  matches.forEach(match => {
    const team1Stats = teamStats[match.team1];
    const team2Stats = teamStats[match.team2];
    
    if (team1Stats && team2Stats) {
      team1Stats.played++;
      team2Stats.played++;
      
    team1Stats.points+= parseInt(match.team1Score)
    team2Stats.points+=parseInt(match.team2Score)
      if (match.team1Score > match.team2Score) {
        team1Stats.won++;
        team2Stats.lost++;
      
      } else if (match.team1Score < match.team2Score) {
        team2Stats.won++;
        team1Stats.lost++;
     
      } else {
     
      }
    }
  });

  // Calculer la différence de buts
  Object.values(teamStats).forEach(stats => {
    stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
  });

  // Trier les équipes selon les critères de classement
  return Object.entries(teamStats)
    .map(([teamName, stats]) => ({
      teamName,
      ...stats
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
  
      return a.teamName.localeCompare(b.teamName);
    });
}
module.exports=calculateStandings
// Générer les fichiers de classement pour chaque groupe
