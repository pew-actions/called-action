import * as core from '@actions/core'
import { getOctokit } from '@actions/github'

///
/// Action entry point
//
async function run() {
  const token = core.getInput('token')
  if (!token) {
    throw new Error('No github token provied')
  }

  const runId = core.getInput('run-id')
  if (!runId) {
    throw new Error('No run-id provided')
  }

  const github = getOctokit(token)
  const repo = process.env.GITHUB_REPOSITORY!.toLowerCase()
  const { data } = await github.request(`GET /repos/${repo}/actions/runs/{runId}`, {
    runId: runId,
  })

  const shortPath = data.path!

  // find the referenced workflow
  const fullPath = data.referenced_workflows[0]!.path
  const actionRef = data.referenced_workflows[0]!.sha

  if (!fullPath) {
    throw new Error(`Failed to find full path for action ${shortPath}`)
  }
  if (!actionRef) {
    throw new Error(`Failed to find ref for action ${shortPath}`)
  }

  core.setOutput('path', fullPath)
  core.setOutput('ref', actionRef)
}

run()
