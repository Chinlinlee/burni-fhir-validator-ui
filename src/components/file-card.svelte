<script>
    import { getSizeString } from "$lib";
    import { onDestroy, onMount } from "svelte";
    import { Progressbar } from "flowbite-svelte";

    let isError = false;
    let isSuccess = false;
    let cardColor =
        "bg-white border-gray-200 dark:bg-blue-dark-400 dark:border-blue-dark-600 dark:text-indigo-100";
    /** @type {File} */
    export let inputFile;
    export let uploadEndpoint = "";

    export let isAllowFile = true;
    export let isAutoUpload = true;
    let fileTotalSize = "";
    let fileUploadedSize = "0";
    let filename = "";
    let uploadProgress = 0;

    $: {
        if (isError) {
            cardColor = "bg-red-100 dark:bg-blue-dark-400 dark:border-red-600";
        }
        if (isSuccess) {
            cardColor = "bg-green-100 dark:bg-blue-dark-200 dark:border-green-200";
        }
    }

    onDestroy(() => {
        document.querySelectorAll(".close-file-card-button").forEach((btn) => {
            if (btn === document.activeElement) {
                /** @type {HTMLElement} */
                (btn).blur();
            }
        });
    });

    onMount(async () => {
        filename = inputFile.webkitRelativePath ? inputFile.webkitRelativePath : inputFile.name;
        fileTotalSize = getSizeString(inputFile.size);
        if (isAutoUpload) await uploadFile();
    });

    async function uploadFile() {

        if (!isAllowFile) {
            return;
        }

        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", uploadEndpoint);

            xhr.onload = function () {
                uploadProgress = 0;

                if (xhr.status.toString().startsWith("2")) {
                    isSuccess = true;
                } else {
                    isError = true;
                }
            };

            xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    uploadProgress = ((event.loaded / event.total) * 100) | 0;
                    fileUploadedSize = getSizeString(event.loaded);
                }
            };

            xhr.onerror = function () {
                isError = true;
                resolve(true);
            };

            let formData = new FormData();
            formData.append("files", inputFile);

            xhr.send(formData);
        });
    }
</script>

<div class="w-full border rounded-lg shadow sm:p-4 p-8 mb-4 {cardColor}">
    <div class="flex space-x-4">
        <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5"
                ><path
                    d="M3 3a2 2 0 0 1 2-2h9.982a2 2 0 0 1 1.414.586l4.018 4.018A2 2 0 0 1 21 7.018V21a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm2-.5a.5.5 0 0 0-.5.5v18a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V8.5h-4a2 2 0 0 1-2-2v-4Zm10 0v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 0-.146-.336l-4.018-4.018A.5.5 0 0 0 15 2.5Z"
                /></svg
            >
        </div>

        <div class="w-full">
            <p class="mb-3 break-words dark:text-indigo-100">{filename}</p>
            <p>File Size: {fileTotalSize}</p>
            {#if !isSuccess && !isError}
                <p>{fileUploadedSize} / {fileTotalSize}</p>
                <p><Progressbar progress={uploadProgress.toLocaleString()} /></p>
            {/if}
            {#if isSuccess}
                <p class="text-green-500">{fileTotalSize} - Uploaded - Success!</p>
            {:else if isError}
                <p class="text-red-500">Upload - Failed!</p>
            {/if}
        </div>
        <slot />
    </div>
</div>
