import React, { useState } from "react";

const teamsByLeague = {
  "Premier League": [
    "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Burnley",
    "Chelsea", "Crystal Palace", "Everton", "Fulham", "Liverpool", "Luton Town",
    "Manchester City", "Manchester Utd", "Newcastle Utd", "Nott'ham Forest",
    "Sheffield Utd", "Tottenham", "West Ham", "Wolves"
  ],
  "La Liga": [
    "Alavés", "Almería", "Athletic Club", "Atlético Madrid", "Barcelona", "Betis",
    "Cádiz", "Celta Vigo", "Getafe", "Girona", "Granada", "Las Palmas",
    "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad",
    "Sevilla", "Valencia", "Villarreal"
  ],
  "Bundesliga": [
    "Augsburg", "Bayern Munich", "Bochum", "Darmstadt 98", "Dortmund",
    "Eint Frankfurt", "Freiburg", "Gladbach", "Heidenheim", "Hoffenheim",
    "Köln", "Leverkusen", "Mainz 05", "RB Leipzig", "Stuttgart", "Union Berlin",
    "Werder Bremen", "Wolfsburg"
  ],
  "Serie A": [
    "Atalanta", "Bologna", "Cagliari", "Empoli", "Fiorentina", "Frosinone",
    "Genoa", "Hellas Verona", "Inter", "Juventus", "Lazio", "Lecce", "Milan",
    "Monza", "Napoli", "Roma", "Salernitana", "Sassuolo", "Torino", "Udinese"
  ],
  "Ligue 1": [
    "Brest", "Clermont Foot", "Le Havre", "Lens", "Lille", "Lorient", "Lyon",
    "Marseille", "Metz", "Monaco", "Montpellier", "Nantes", "Nice", "Paris S-G",
    "Reims", "Rennes", "Strasbourg", "Toulouse"
  ]
};

const attributeMap = {
  "Goals": "Gls",
  "Shots on Target": "SoT",
  "Shots On Target Per 90": "SoT/90",
  "Goals/Shots on target": "G/SoT",
  "Penalty Kicks Made": "PK",
  "xG (Expected Goals)": "xG",
  "Shot-creating actions": "SCA",
  "Shots from Freekick": "FK",
  "Assists": "Ast",
  "xA (Expected Assists)": "xA",
  "Key Passes": "KP",
  "Crosses into Penalty Area": "CrsPA",
  "Progressive Passes": "PrgP",
  "Completed Passes Total": "Cmp%",
  "Passes into Penalty Area": "PPA",
  "Successful Take-On%": "Succ%",
  "Carries": "Carries",
  "Tackles Won": "TklW",
  "% of Dribblers Tackled": "Tkl%",
  "Blocks": "Blocks",
  "Passes Block": "Pass",
  "Interceptions": "Int",
  "Clearances": "Clr",
  "Ball Recoveries": "Recov",
  "% of Aerial Duels Won": "Won%",
  "Goals Against /90": "GA90",
  "Save Percentage": "Save%",
  "Clean Sheet Percentage": "CS%",
  "Penalty Kicks Saved %": "Save%2",
  "Passes Completed (Launched)": "Cmp%",
  "Crosses Stopped": "Stp%",
  "% of Passes that were Launched": "Launch%",
};

const roles = {
  Forward: ["Goals", "Shots on Target", "Shots On Target Per 90", "Goals/Shots on target", "Penalty Kicks Made", "xG (Expected Goals)", "Shot-creating actions"],
  Winger: ["Goals", "Shots on Target", "Shots On Target Per 90", "Goals/Shots on target", "Penalty Kicks Made", "xG (Expected Goals)", "Shots from Freekick", "Assists", "xA (Expected Assists)", "Key Passes", "Crosses into Penalty Area"],
  "Attacking Mid": ["Goals", "Shots on Target", "Shots On Target Per 90", "Goals/Shots on target", "Penalty Kicks Made", "xG (Expected Goals)", "Shots from Freekick", "Assists", "xA (Expected Assists)", "Key Passes", "Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Passes into Penalty Area"],
  "Centre Mid": ["Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Assists", "xA (Expected Assists)", "Successful Take-On%", "Carries", "Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances"],
  "Fullback": ["Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances", "Successful Take-On%", "Crosses into Penalty Area", "Progressive Passes", "Completed Passes Total", "Assists", "xA (Expected Assists)", "Carries", "Passes into Penalty Area", "Key Passes"],
  "Centre Defense": ["Tackles Won", "% of Dribblers Tackled", "Blocks", "Passes Block", "Interceptions", "Clearances", "Carries", "Successful Take-On%", "Ball Recoveries", "% of Aerial Duels Won"],
  Goalkeeping: ["Goals Against /90", "Save Percentage", "Clean Sheet Percentage", "Penalty Kicks Saved %", "Passes Completed (Launched)", "Crosses Stopped", "% of Passes that were Launched", "Assists", "xA (Expected Assists)"]
};


const App = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setSelectedAttributes([]);
  };

  const handleLeagueChange = (event) => {
    setSelectedLeague(event.target.value);
    setSelectedTeam("");
  };

  const handleCheckboxChange = (attribute) => {
    setSelectedAttributes((prev) =>
      prev.includes(attribute)
        ? prev.filter((item) => item !== attribute)
        : [...prev, attribute]
    );
  };

  const handleSubmit = async () => {
    if (!selectedRole || !selectedTeam || !selectedLeague) {
      setError("Please select a role, league, team");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:8000/analyze-players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          position: selectedRole,
          team: selectedTeam,
          league: selectedLeague,
          specific_role_cols: selectedAttributes.map(attr => attributeMap[attr] || attr)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError("Failed to fetch analysis results. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            TalentVision AI
          </h1>
          <p className="text-gray-600">
            Advanced analytics for player performance evaluation
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selection Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              Player Selection Criteria
            </h2>

            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Role
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  onChange={handleRoleChange}
                  value={selectedRole}
                >
                  <option value="">Select a role</option>
                  {Object.keys(roles).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attributes */}
              {selectedRole && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Select Attributes
                  </h3>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-1">
                    {roles[selectedRole].map((attribute) => (
                      <label
                        key={attribute}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${
                          selectedAttributes.includes(attribute)
                            ? "bg-blue-50"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedAttributes.includes(attribute)}
                          onChange={() => handleCheckboxChange(attribute)}
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {attribute}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* League & Team Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    League
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    onChange={handleLeagueChange}
                    value={selectedLeague}
                  >
                    <option value="">Select a league</option>
                    {Object.keys(teamsByLeague).map((league) => (
                      <option key={league} value={league}>
                        {league}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLeague && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      value={selectedTeam}
                    >
                      <option value="">Select a team</option>
                      {teamsByLeague[selectedLeague].map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Generate Scouting Report"
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              Scouting Report
            </h2>

            {analysisResult ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    Selected Criteria:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">
                      {analysisResult.position}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded">
                      {selectedLeague}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded">
                      {analysisResult.team}
                    </span>
                    {selectedAttributes.map((attr) => (
                      <span
                        key={attr}
                        className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-2">
                    Team Players:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.team_players?.map((player) => (
                      <span
                        key={player}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Similar Players Analysis
                  </h3>
                  <div className="space-y-4">
                  {analysisResult.similar_players?.map((player, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {player.player}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {player.position} • {player.team}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Similarity Distance: {player.distance.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(player.stats || {}).map(([statName, statValue]) => (
                            <div key={statName} className="text-sm">
                              <span className="text-gray-500 capitalize">{statName.replace(/_/g, ' ')}:</span>
                              <span className="ml-2 font-medium text-gray-800">
                                {typeof statValue === 'number' ? statValue.toFixed(2) : statValue || "N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No report generated
                </h3>
                <p className="text-gray-500 max-w-md">
                  Select player role, attributes, league and team to generate a
                  scouting report.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;