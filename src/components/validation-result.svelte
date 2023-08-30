<script>
    import { onMount } from "svelte";
    import { LineNumbers, Highlight } from "svelte-highlight";
    import json from "svelte-highlight/languages/json";
    import edgeLight from "svelte-highlight/styles/edge-light";
    import { List } from "flowbite-svelte";

    /** @type {import("../models/fhir-r4").OperationOutcome} */
    export let operationOutcome;
    /** @type {string} */
    export let resource;
    /** @type {import("../models/fhir-r4").OperationOutcomeIssue[]} */
    let infoIssues = [];
    /** @type {import("../models/fhir-r4").OperationOutcomeIssue[]} */
    let fatalIssues = [];
    /** @type {import("../models/fhir-r4").OperationOutcomeIssue[]} */
    let errorIssues = [];
    /** @type {import("../models/fhir-r4").OperationOutcomeIssue[]} */
    let warningIssues = [];

    onMount(() => {
        fatalIssues = operationOutcome.issue.filter((v) => v.severity === "fatal");
        errorIssues = operationOutcome.issue.filter((v) => v.severity === "error");
        warningIssues = operationOutcome.issue.filter((v) => v.severity === "warning");
        infoIssues = operationOutcome.issue.filter((v) => v.severity === "information");

        insertCodeLineIdOfHighlightTr();
        highlightSeverityCodeLineNumber();
    });

    /**
     *
     * @param {import("../models/fhir-r4").OperationOutcomeIssue} item
     */
    function isHaveCodeLineNumber(item) {
        if (item.extension)
            return item.extension?.findIndex((v) => v.url.includes("operationoutcome-issue-line"));
        else return -1;
    }

    function highlightSeverityCodeLineNumber() {
        let hljsElement = document.querySelector("tbody.hljs");
        if (hljsElement) {
            let tr = hljsElement.querySelectorAll("tr");
            if (tr.length > 0) {
                for (let i = 0; i < operationOutcome.issue.length; i++) {
                    let issue = operationOutcome.issue[i];
                    let codeLine = getIssueCodeLine(issue);

                    if (codeLine >= 0) {
                        if (!tr[codeLine - 1]) {
                            console.error("Can not found tr code line" + codeLine);
                            continue;
                        };
                        let tds = tr[codeLine - 1].querySelectorAll("td");

                        tds.forEach((td) => {
                            if (issue.severity === "error") {
                                td?.classList.add("bg-red-200");
                            } else if (issue.severity === "warning") {
                                td?.classList.add("bg-orange-200");
                            }
                        });
                    }
                }
            }
        }
    }

    function insertCodeLineIdOfHighlightTr() {
        let hljsElement = document.querySelector("tbody.hljs");
        if (hljsElement) {
            let tr = hljsElement.querySelectorAll("tr");
            tr.forEach((v, index) => {
                v.id = `code-line-${index + 1}`;
            });
        }
    }

    /**
     *
     * @param {import("../models/fhir-r4").OperationOutcomeIssue} issue
     */
    function getIssueCodeLine(issue) {
        let codeLineExtensionIndex = isHaveCodeLineNumber(issue);
        if (codeLineExtensionIndex >= 0) {
            return /**@type {number}*/ (
                /** @type { import("../models/fhir-r4").Extension[]} */ (issue.extension)[
                    codeLineExtensionIndex
                ].valueInteger
            );
        }
        return -1;
    }
</script>

<svelte:head>
    {@html edgeLight}
</svelte:head>

<div>
    <h1 class="text-5xl font-extrabold dark:text-white pb-2">Validation Result</h1>

    {#if errorIssues.length > 0}
        <div class="validation-error">
            <h2 class="text-3xl font-extrabold dark:text-white pb-2">Error:</h2>
            <List list="decimal">
                {#each errorIssues as errorIssue}
                    <li class="mb-2">
                        {errorIssue.details?.text}
                        {#if isHaveCodeLineNumber(errorIssue) >= 0}
                            <span> on line number: {getIssueCodeLine(errorIssue)}.</span>
                            <a
                                href={`#code-line-${getIssueCodeLine(errorIssue)}`}
                                class="text-primary-500 hover:underline">Jump to error</a
                            >
                        {/if}
                    </li>
                {/each}
            </List>
        </div>
    {/if}

    {#if warningIssues.length > 0}
        <div class="valdation-warning">
            <h2 class="text-3xl font-extrabold dark:text-white pb-2">Warning:</h2>
            <List list="decimal">
                {#each warningIssues as warningIssue}
                    <li class="mb-2">
                        {warningIssue.details?.text}
                        {#if isHaveCodeLineNumber(warningIssue) >= 0}
                            <span> on line number: {getIssueCodeLine(warningIssue)}.</span>
                            <a
                                href={`#code-line-${getIssueCodeLine(warningIssue)}`}
                                class="text-primary-400 underline">Jump to error</a
                            >
                        {/if}
                    </li>
                {/each}
            </List>
        </div>
    {/if}

    {#if infoIssues.length > 0}
        <div class="validation-infomation">
            <h2 class="text-3xl font-extrabold dark:text-white pb-2">Information:</h2>
            <List list="decimal">
                {#each infoIssues as infoIssue}
                    <li class="mb-2">
                        {infoIssue.details?.text}
                        {#if isHaveCodeLineNumber(infoIssue) >= 0}
                            <span> on line number: {getIssueCodeLine(infoIssue)}.</span>
                            <a
                                href={`#code-line-${getIssueCodeLine(infoIssue)}`}
                                class="text-primary-400 underline"
                            >
                                Jump to error
                            </a>
                        {/if}
                    </li>
                {/each}
            </List>
        </div>
    {/if}

    <div class="resource">
        <h2 class="text-3xl font-extrabold dark:text-white pb-2">Resource:</h2>
        <Highlight language={json} code={resource} let:highlighted>
            <LineNumbers {highlighted} />
        </Highlight>
    </div>
</div>
