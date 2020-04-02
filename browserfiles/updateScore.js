const fs = require('fs')

const filePath = __dirname + '/streamcontrol.json'
const [ _, __, team, scoreChange ] = process.argv
const streamcontrolJson = JSON.parse(fs.readFileSync(filePath, 'utf8'))

function updateScore(team, updateFunction) {
  const teamScoreKey = 'pScore' + team
  const teamScore = parseInt(streamcontrolJson[teamScoreKey])
  streamcontrolJson[teamScoreKey] = updateFunction(teamScore)
}

(() => {
  const updateFunction = scoreChange === '0'
    ? () => '0'
    : (score) => eval(score + scoreChange).toString()

  if (team !== '2') updateScore('1', updateFunction)
  if (team !== '1') updateScore('2', updateFunction)

  streamcontrolJson.timestamp = new Date().getTime().toString()
  fs.writeFileSync(filePath, JSON.stringify(streamcontrolJson, null, 2))
})()
