<script>
    import { JSONEditor, Mode, createAjvValidator } from "svelte-jsoneditor";
    import { Button, Alert, Fileupload, Modal, Spinner } from "flowbite-svelte";
    import axios from "axios";
    import { validatorApiConfig } from "../stores/validator-api.config";
    import { pageState } from "../stores";
    import urlJoin from "url-join";
    import { fade, slide } from "svelte/transition";
    import AdvancedOptions from "../components/advanced-options.svelte";
    import ValidationResult from "../components/validation-result.svelte";
    import * as R from "remeda";

    let content = {
        text: ""
    };
    /** @type {import("../models/fhir-r4").OperationOutcome}*/
    let operationOutcome;
    let validatedResourceText = "";

    let isDisabledValidateBtn = true;
    let openLoadingModal = false;

    const jsonSchema = {
        type: "object",
        properties: {
            resourceType: {
                type: "string"
            }
        },
        required: ["resourceType"]
    };

    const jsonValidator = createAjvValidator({
        schema: jsonSchema
    });

    $: validationErrorMessage = "";

    /**
     *
     * @param {import("svelte-jsoneditor").Content} updatedContent
     * @param {import("svelte-jsoneditor").Content} previousContent
     * @param {import("svelte-jsoneditor").OnChangeStatus} param2
     */
    function onJsonEditorContentChange(
        updatedContent,
        previousContent,
        { contentErrors, patchResult }
    ) {
        isDisabledValidateBtn = contentErrors || !content.text ? true : false;
    }

    /**
     *
     * @param {Event} event
     */
    function loadResourceFromFile(event) {
        if (event.target instanceof HTMLInputElement) {
            if (event.target.files) {
                let file = event.target.files[0];
                if (file.type === "application/json") {
                    file.text().then(
                        (v) =>
                            (content = {
                                ...content,
                                text: v
                            })
                    );
                }
            }
        }
    }

    async function doValidate() {
        validationErrorMessage = "";
        validatedResourceText = R.clone(content.text);
        if ($validatorApiConfig.endpoint) {
            try {
                openLoadingModal = true;
                let { data } = await axios.post(
                    urlJoin($validatorApiConfig.endpoint, "validate"),
                    JSON.parse(content.text)
                );
                operationOutcome = data;
                pageState.set("result");
                openLoadingModal = false;
            } catch (e) {
                if (e instanceof axios.AxiosError) {
                    console.error(e.message);
                    validationErrorMessage = e.message;
                } else {
                    console.error(e);
                    validationErrorMessage = String(e);
                }
            }
        }
    }

    async function reset() {
        content = {
            text: ""
        };
        validationErrorMessage = "";
    }
</script>

<div class="flex w-full">
    <div
        class="flex flex-col flex-grow-1 max-w-7xl mx-auto px-4 min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16"
    >
        {#if $pageState === "result"}
            <div class="flex items-start justify-start col-span-2 mb-2">
                <div
                    class="flex items-center justify-between w-full text-gray-600 dark:text-gray-400 bg-gray-100 rounded-lg dark:bg-gray-600 max-w-[128px] mx-2"
                >
                    <button
                        type="button"
                        class="inline-flex items-center justify-center h-8 px-1 bg-gray-100 rounded-lg dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 w-full"
                        on:click={() => pageState.set("prepare")}
                        id="back-to-previous"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                clip-rule="evenodd"
                                fill-rule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            />
                        </svg>

                        <span class="sr-only">Previous page</span>
                        <span class="flex-shrink-0 mx-1 text-sm font-medium">返回 Validator</span>
                    </button>
                </div>
            </div>
        {:else if $pageState === "prepare" && operationOutcome}
            <div class="flex items-start justify-start col-span-2 mb-2">
                <div
                    class="flex items-center justify-between w-full text-gray-600 dark:text-gray-400 bg-gray-100 rounded-lg dark:bg-gray-600 max-w-[128px] mx-2"
                >
                    <button
                        type="button"
                        class="inline-flex items-center justify-center h-8 px-1 bg-gray-100 rounded-lg dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 w-full"
                        on:click={() => pageState.set("result")}
                        id="back-to-previous"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path
                                clip-rule="evenodd"
                                fill-rule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            />
                        </svg>

                        <span class="sr-only">Previous page</span>
                        <span class="flex-shrink-0 mx-1 text-sm font-medium">返回 Result</span>
                    </button>
                </div>
            </div>
        {/if}
        {#if $pageState === "prepare"}
            <h1 class="text-5xl font-extrabold dark:text-white pb-2">Burni FHIR Validator</h1>
            <div class="border p-2 lg:p-4 xl:p-8 mb-4">
                <div class="json-editor mb-3">
                    <JSONEditor
                        bind:content
                        mode={Mode.text}
                        validator={jsonValidator}
                        onChange={onJsonEditorContentChange}
                    />
                </div>

                <label
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    for="file-upload-resource">或者上傳你的 resource 檔案</label
                >
                <Fileupload
                    class="mb-3 file:bg-primary-600"
                    id="file-upload-resource"
                    on:change={loadResourceFromFile}
                />

                <div class="op-buttons mb-3">
                    <Button
                        class="btn-base bg-primary-600 hover:bg-primary-700 focus:ring-primary-300"
                        on:click={doValidate}
                        disabled={isDisabledValidateBtn}>驗證</Button
                    >
                    <Button
                        class="btn-base bg-primary-600 hover:bg-primary-700 focus:ring-primary-300"
                        on:click={reset}>重置</Button
                    >
                </div>

                {#if validationErrorMessage}
                    <div transition:slide>
                        <Alert color="red" rounded={false} class="border-t-4">
                            <svg
                                slot="icon"
                                aria-hidden="true"
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                ><path
                                    fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="font-medium">Validation Error!</span>
                            {validationErrorMessage}
                        </Alert>
                    </div>
                {/if}
            </div>

            <div class="border p-2 lg:p-8 xl:p-12">
                <AdvancedOptions />
            </div>
        {:else if $pageState === "result"}
            <ValidationResult {operationOutcome} resource={validatedResourceText} />
        {/if}
    </div>
</div>

<Modal open={openLoadingModal} permanent={true}>
    <div class="text-center">
        <Spinner size={"16"} />
        <span class="block">Loading...</span>
    </div>
</Modal>

<style>
    .json-editor {
        --jse-theme-color: #a855f7;
        --jse-theme-color-highlight: #9333ea;
    }
</style>
