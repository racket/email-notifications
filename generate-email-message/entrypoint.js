const fs = require('fs')
const strftime = require('strftime')
const tmp = require('tmp')
const payload = require(process.env.GITHUB_EVENT_PATH || './fixture')

const generateMessage = (payload) => {
  let nameWithOwner = payload.repository.full_name
  let firstCommitSha = payload.commits[0].id.slice(0, 8)
  let firstCommitTitle = payload.commits[0].message
  let subject = `[${nameWithOwner}] ${firstCommitSha}: ${firstCommitTitle}`

  let body = `Branch: ${payload.ref}
  Home:   ${payload.repository.html_url}
  `

  payload.commits.forEach((commit) => {
    body += commitText(commit)
  })

  if (payload.commits[0].id !== payload.commits[payload.length - 1]) {
    body += `Compare: ${payload.compare}\n`
  }

  // Strip leading whitespaces from body
  body = body.replace(/^ {2}/gm, '')

  return { subject, body }
}

const commitText = (commit) => {
  let added = commit.added.map(f => ['A', f])
  let removed = commit.removed.map(f => ['R', f])
  let modified = commit.modified.map(f => ['M', f])

  let changedPaths = [...added, ...removed, ...modified].sort(function (_char, file) {
    return file
  }).map(entry => `${entry[0]} ${entry[1]}`).join('\n    ')

  let commitAuthor = `${commit.author.name} <${commit.author.email}>`
  let text = `Commit: ${commit.id}
      ${commit.url}
  Author: ${commitAuthor}
  Date:   ${commit.timestamp} (${strftime('%a, %d %b %Y', new Date(commit.timestamp))})`

  if (changedPaths.length > 0) {
    text += `

  Changed paths:
    ${changedPaths}`
  }

  text += `

  Log Message:
  -----------
  ${commit.message}

  `

  return text
}

const getWriteStream = (identifier) => {
  if (process.env.GITHUB_ACTION) {
    return fs.createWriteStream(`${process.env.HOME}/${process.env.GITHUB_ACTION}.${identifier}.txt`);
  } else {
    return fs.createWriteStream(tmp.fileSync().name)
  }
}

// generate message
const { subject, body } = generateMessage(payload)

// write subject
let writeStream = getWriteStream('Subject')
writeStream.write(subject)
writeStream.end()

// write body
writeStream = getWriteStream('Body')
writeStream.write(body)
writeStream.end()

// write body to STDOUT
console.log(JSON.stringify({ subject, body }, null, 4))
