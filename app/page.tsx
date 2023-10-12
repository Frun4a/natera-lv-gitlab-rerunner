'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function Home() {

  interface ExtractedVariables {
    branch: String | null,
    env: String | null,
    action: String | null,
    trPlanId: String | null,
    trVersion: String | null,
    aggregator: String | null,
    test_only: String | null
  }

  const [link, setLink] = useState("")
  const [displayVariables, setDisplayVariables] = useState<Boolean>(false)
  const [extractedVariables, setExtractedVariables] = useState<ExtractedVariables | null>(null)

  const readClipboard = async (): Promise<string> => {
    return await navigator.clipboard.readText()
  }

  const handlePasteButtonClick = async () => {
    const clipboard = await readClipboard()

    if (clipboard != undefined) {
      parseLog(clipboard)
    }
  }

  const parseLog = async (log: string) => {
    // Branch
    const branchRegExp = /^CI_COMMIT_BRANCH=([\s\S]+?)\n/gm
    const branchValue = [...log.matchAll(branchRegExp)][0][1]
    console.log(`Branch value is: ${branchValue}`)

    // Env
    const envRegExp = /^ENVIRONMENT=([\s\S]+?)\n/gm
    const envValue = [...log.matchAll(envRegExp)][0][1]
    console.log(`Env value is: ${envValue}`)

    // Action
    const actionRegExp = /^ACTION=([\s\S]+?)\n/gm
    const actionValue = [...log.matchAll(actionRegExp)][0][1]
    console.log(`Action value is: ${actionValue}`)

    // TR Plan ID
    const trPlanIdRegExp = /TESTRAIL_PLAN_ID=([\s\S]*?)\n/gm
    const trPlanIdValue = ([...log.matchAll(trPlanIdRegExp)][0].length > 0) ? ([...log.matchAll(trPlanIdRegExp)][0][1]) : null
    console.log(`TestRail Plan ID value is: ${trPlanIdValue}`)

    // LV verstion
    const lvVersionRegExp = /TESTRAIL_VERSION=([\s\S]*?)\n/gm
    const lvVersionValue = ([...log.matchAll(lvVersionRegExp)][0].length > 0) ? ([...log.matchAll(lvVersionRegExp)][0][1]) : null
    console.log(`LV version value is: ${lvVersionValue}`)

    // Test Results Aggregator
    const aggregatorRegExp = /RESULTS_AGGREGATOR_TURN_ON=([\s\S]*?)\n/gm
    const aggregatorValue = [...log.matchAll(aggregatorRegExp)][0][1]
    console.log(`Test Results Aggregator value is: ${aggregatorValue}`)

    // Failed tests
    const failedTestsRegExp = /\[31merror\[0m\] \[0m\[0m	([\s\S]+?Test_[\s\S]+?)/gm
    const failedTestsValue = [...log.matchAll(failedTestsRegExp)].map(el => el[1]).join(' ')
    console.log(`Failed tests value is: ${failedTestsValue}`)

    let link = `https://gitlab.natera.com/eng/qa/labvantage/lv-testrunner/-/pipelines/new?` + 
    `ref=${branchValue}` + 
    `&var[ENVIRONMENT]=${envValue}` +
    `&var[RESULTS_AGGREGATOR_TURN_ON]=${aggregatorValue}` +
    `&var[ACTION]=${actionValue}`

    if (trPlanIdValue != null) { link = link.concat(`&var[TESTRAIL_PLAN_ID]=${trPlanIdValue}`) }
    if (lvVersionValue != null) { link = link.concat(`&var[TESTRAIL_VERSION]=${lvVersionValue}`) }
    if (failedTestsValue != "") { link = link.concat(`&var[TEST_ONLY]=${failedTestsValue}`) }
    
    setLink(link)
    setExtractedVariables(
      {
        branch: branchValue,
        env: envValue,
        action: actionValue,
        trPlanId: trPlanIdValue,
        trVersion: lvVersionValue,
        aggregator: aggregatorValue,
        test_only: failedTestsValue
      }
    )

    setDisplayVariables(true)
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Paste FULL GitLab job log by clicking a button to start (NEW PIPELINE):
          <button
          className={styles.paste_button}
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

        {displayVariables ?
        <>
          <br></br>
          <b>Extracted values: </b><br></br><br></br>
          Branch: {extractedVariables?.branch} <br></br><br></br>
          ENVIRONMENT: {extractedVariables?.env} <br></br><br></br>
          ACTION: {extractedVariables?.action} <br></br><br></br>
          TESTRAIL_PLAN_ID: {extractedVariables?.trPlanId} <br></br><br></br>
          TESTRAIL_VERSION: {extractedVariables?.trVersion}<br></br><br></br>
          RESULTS_AGGREGATOR_TURN_ON: {extractedVariables?.aggregator}<br></br><br></br>
          TEST_ONLY: {extractedVariables?.test_only}
        </>

          : null
        }

      </div>
      <div className={styles.version}>
        <p>ver. 0.2 (new pipeline)</p>
      </div>
    </main>
  )
}
