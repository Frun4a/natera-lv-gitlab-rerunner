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
    test_only: String | null,
    test_names: String | null,
    passed_tests: Array<String> | null,
    test_names_new: String | null,
    test_names_passed: String | null
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
    const trPlanIdValue = ([...log.matchAll(trPlanIdRegExp)][0][1].length > 0) ? ([...log.matchAll(trPlanIdRegExp)][0][1]) : null
    console.log(`TestRail Plan ID value is: ${trPlanIdValue}`)

    // LV verstion
    const lvVersionRegExp = /TESTRAIL_VERSION=([\s\S]*?)\n/gm
    const lvVersionValue = ([...log.matchAll(lvVersionRegExp)][0][1].length > 0) ? ([...log.matchAll(lvVersionRegExp)][0][1]) : null
    console.log(`LV version value is: ${lvVersionValue}`)

    // Test Results Aggregator
    const aggregatorRegExp = /RESULTS_AGGREGATOR_TURN_ON=([\s\S]*?)\n/gm
    const aggregatorValue = [...log.matchAll(aggregatorRegExp)][0][1]
    console.log(`Test Results Aggregator value is: ${aggregatorValue}`)

    // Failed tests
    const failedTestsRegExp = /\[31merror\[0m\] \[0m\[0m	([\s\S]+?[Test|TEST]_[\s\S]+?)/gm
    const failedTestsValue = [...log.matchAll(failedTestsRegExp)].map(el => el[1]).join(' ')
    console.log(`Failed tests value is: ${failedTestsValue}`)

    // Test name includes
    const testNamesRegExp = /TEST_NAMES_INCLUDE=([\s\S]*?)\n/gm
    const testNamesValue: string | null = ([...log.matchAll(testNamesRegExp)][0][1].length > 0) ? ([...log.matchAll(testNamesRegExp)][0][1]) : null
    console.log(`Test Name Include value is: ${testNamesValue}`)

    let testNamesNewValue: String | null = null
    let testNamesPassedValue: String | null = null
    let passedTestsValue: String[] | null = null
    if (testNamesValue) {
      // Passed tests
      const passedTestsRegExp = /\[34m\[INFO \]\[0;39m \[36mTestResultLogging\[0;39m - \[32mTEST PASSED: \[0m([\s\S]*?)\n/gm
      const passedTestsValue = ([...log.matchAll(passedTestsRegExp)].length > 0) ? ([...log.matchAll(passedTestsRegExp)].map(el => el[1])) : null
      console.log(`Passed test(s) is/are: ${passedTestsValue?.join("\n")}`)

      const testNamesValueAsArray = testNamesValue.split(";")
      testNamesNewValue = testNamesValueAsArray.filter((testNamesEl) => !passedTestsValue?.find(el => el.includes(testNamesEl))).join(";")
      testNamesPassedValue = testNamesValueAsArray.filter((testNamesEl) => passedTestsValue?.find(el => el.includes(testNamesEl))).join(";")
      console.log(`Test Name Include NEW value is: ${testNamesNewValue}`)
    }

    let link = `https://gitlab.natera.com/eng/qa/labvantage/lv-testrunner/-/pipelines/new?` + 
    `ref=${branchValue}` + 
    `&var[ENVIRONMENT]=${envValue}` +
    `&var[RESULTS_AGGREGATOR_TURN_ON]=${aggregatorValue}` +
    `&var[ACTION]=${actionValue}`

    if (trPlanIdValue != null) { link = link.concat(`&var[TESTRAIL_PLAN_ID]=${trPlanIdValue}`) }
    if (lvVersionValue != null) { link = link.concat(`&var[TESTRAIL_VERSION]=${lvVersionValue}`) }
    if (failedTestsValue != "") { link = link.concat(`&var[TEST_ONLY]=${failedTestsValue}`) }
    if (testNamesValue != null && testNamesNewValue != "") { link = link.concat(`&var[TEST_NAMES_INCLUDE]=${testNamesNewValue}`) }
    
    setLink(link)
    setExtractedVariables(
      {
        branch: branchValue,
        env: envValue,
        action: actionValue,
        trPlanId: trPlanIdValue,
        trVersion: lvVersionValue,
        aggregator: aggregatorValue,
        test_only: failedTestsValue,
        test_names: testNamesValue,
        passed_tests: passedTestsValue,
        test_names_new: testNamesNewValue,
        test_names_passed: testNamesPassedValue
      }
    )

    setDisplayVariables(true)
  }

  return (
    <>
      <main className={styles.main}>
        <p>
          <a href='/natera-lv-gitlab-rerunner/lops/'>This is a link to the LOPS page</a>
        </p>
        <br/>
        <div className={styles.description}>
          <p>
            LV: Paste FULL GitLab job log by clicking a button to start:
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
          <div>
            <br></br>
            <b>Extracted values: </b><br></br><br></br>
            Branch: {extractedVariables?.branch} <br></br><br></br>
            ENVIRONMENT: {extractedVariables?.env} <br></br><br></br>
            ACTION: {
              extractedVariables?.action === "Regression" ? 
                <span style={{color: "#FF0000", fontWeight: "bold"}}>{extractedVariables?.action + " <- You most likely will need to update this"}</span> :
                extractedVariables?.action
            } <br></br><br></br>
            TESTRAIL_PLAN_ID: {extractedVariables?.trPlanId} <br></br><br></br>
            TESTRAIL_VERSION: {extractedVariables?.trVersion}<br></br><br></br>
            RESULTS_AGGREGATOR_TURN_ON: {extractedVariables?.aggregator}<br></br><br></br>
            TEST_NAMES_INCLUDE:
              <span className={styles.test_names_passed}>{extractedVariables?.test_names_passed}</span>
              <span className={styles.test_names_failed}>{extractedVariables?.test_names_new}</span>
            <br></br><br></br>
            TEST_ONLY: {extractedVariables?.test_only}
          </div>

            : null
          }

        </div>
        <div className={styles.version}>
          <p>ver. 0.3 (LOPS support)</p>
        </div>
      </main>
      {/* <div className={styles.snowflakes} aria-hidden="true">
        {
          [...Array(10)].map((value: undefined, index: number) => (<div className={styles.snowflake} key={index}>❅</div>))
        }
      </div> */}
    </>
  )
}
