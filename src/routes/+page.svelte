<script>
    import { JSONEditor, Mode } from "svelte-jsoneditor";
    import { Button, Alert, Fileupload } from "flowbite-svelte";
    import axios from "axios";
    import { validatorApiConfig } from "../stores/validator-api.config";
    import { onMount } from "svelte";
    import urlJoin from "url-join";
    import { fade, slide } from "svelte/transition";
    import AdvancedOptions from "../components/advanced-options.svelte";

    let content = {
        text: ""
    };
    /** @type {FileList | undefined}*/
    let resourceFileList;

    $: validationErrorMessage = "";

    $: if (resourceFileList?.length) {
        loadResourceFromFile();
    }

    async function loadResourceFromFile() {
        let resourceFile = resourceFileList?.item(0);
        if (resourceFile?.type === "application/json") {
            resourceFile?.text().then(
                (v) =>
                    (content = {
                        ...content,
                        text: v
                    })
            );
        }
    }

    async function doValidate() {
        validationErrorMessage = "";
        if ($validatorApiConfig.endpoint) {
            try {
                let { data } = await axios.post(
                    urlJoin($validatorApiConfig.endpoint, "validate"),
                    JSON.parse(content.text)
                );
                console.log(data);
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
        resourceFileList = undefined;
    }

    onMount(() => {
        console.log("config", $validatorApiConfig);
    });
</script>

<div class="flex w-full">
    <div
        class="flex flex-col flex-grow-1 max-w-7xl mx-auto px-4 min-w-0 pt-6 lg:px-8 lg:pt-8 pb:12 xl:pb-24 lg:pb-16"
    >
        <h1 class="text-5xl font-extrabold dark:text-white pb-2">Burni FHIR Validator</h1>
        <div class="border p-2 lg:p-8 xl:p-12 mb-4">
            <div class="json-editor mb-3">
                <JSONEditor bind:content mode={Mode.text} />
            </div>

            <label
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                for="file-upload-resource">或者上傳你的 resource 檔案</label
            >
            <Fileupload class="mb-3" id="file-upload-resource" bind:files={resourceFileList} />

            <div class="op-buttons mb-3">
                <Button
                    class="btn-base bg-primary-600 hover:bg-primary-700 focus:ring-primary-300"
                    on:click={doValidate}>驗證</Button
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
    </div>
</div>

<style>
    .json-editor {
        --jse-theme-color: #a855f7;
        --jse-theme-color-highlight: #9333ea;
    }
</style>
