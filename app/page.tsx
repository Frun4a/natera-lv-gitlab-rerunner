'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [link, setLink] = useState("")

  const readClipboard = async (): Promise<string> => {
    return await navigator.clipboard.readText()
  }

  const handlePasteButtonClick = async () => {
    const clipboard = await readClipboard()
    console.log(`HandlePasteButtonClick: Parselog: Clipboard text is ${clipboard.length} long`)

    if (clipboard != undefined) {
      parseLog(clipboard)
    }
  }

  const parseLog = async (log: string) => {

    console.log(`Parselog: Clipboard text is ${log.length} long`)
    
    // Branch
    const branchRegExp = /^CI_COMMIT_BRANCH=([\s\S]+?)\n/gm
    const branchValue = [...log.matchAll(branchRegExp)][0][1]
    console.log(`Branch value is: ${branchValue}`)

    // Env
    const envRegExp = /^ENVIRONMENT=([\s\S]+?)\n/gm
    const envValue = [...log.matchAll(envRegExp)][0][1]
    console.log(`Env value is: ${envValue}`)

    // TR Plan ID
    const trPlanIdRegExp = /testrailPlanId=([\s\S]*?)\n/gm
    const trPlanIdValue = ([...log.matchAll(trPlanIdRegExp)][0].length > 0) ? ([...log.matchAll(trPlanIdRegExp)][0][1]) : null
    console.log(`TestRail Plan ID value is: ${trPlanIdValue}`)

    // LV verstion
    const lvVersionRegExp = /testrailVersion=([\s\S]*?)\n/gm
    const lvVersionValue = ([...log.matchAll(lvVersionRegExp)][0].length > 0) ? ([...log.matchAll(lvVersionRegExp)][0][1]) : null
    console.log(`LV version value is: ${lvVersionValue}`)

    // Test Results Aggregator
    const aggregatorRegExp = /resultsAggregator=([\s\S]*?)\n/gm
    const aggregatorValue = [...log.matchAll(aggregatorRegExp)][0][1]
    console.log(`Test Results Aggregator value is: ${aggregatorValue}`)

    // Failed tests
    const failedTestsRegExp = /\[31merror\[0m\] \[0m\[0m	([\s\S]+?Test_[\s\S]+?)/gm
    const failedTestsValue = [...log.matchAll(failedTestsRegExp)].map(el => el[1]).join(' ')
    console.log(`Failed tests value is: ${failedTestsValue}`)

    let link = `https://gitlab.natera.com/eng/qa/labvantage/lv-testrunner/-/pipelines/new?` + 
    `ref=${branchValue}` + 
    `&var[ENVIRONMENT]=${envValue}` +
    `&var[resultsAggregator]=${aggregatorValue}`

    if (trPlanIdValue != null) { link = link.concat(`&var[testrailPlanId]=${trPlanIdValue}`) }
    if (lvVersionValue != null) { link = link.concat(`&var[testrailVersion]=${lvVersionValue}`) }
    if (failedTestsValue != "") { link = link.concat(`&var[testOnly]=${failedTestsValue}`) }
    
    setLink(link)
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Paste FULL GitLab job log by clicking a button to start:
          <button
            onClick={ async () => await handlePasteButtonClick() }
          >
            Paste
          </button>
        </p>

        {link != "" ?
        <p>
          <a href={link} target="_blank">
            {link}
          </a>
        </p>
        : null}
      </div>
    </main>
  )
}
