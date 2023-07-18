<script>
    import { getSizeString } from "$lib";
    import { onDestroy, onMount } from "svelte";
    import { Progressbar } from "flowbite-svelte";
    import axios from "axios";

    let isError = false;
    let isSuccess = false;
    let cardColor =
        "bg-white border-gray-200 dark:bg-blue-dark-400 dark:border-blue-dark-600 dark:text-indigo-100";
    /** @type {File} */
    export let inputProfile;
    export let uploadEndpoint = "";

    let profileJson = {
        id: "",
        version: ""
    };

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
        let profileText = await inputProfile.text();
        profileJson = JSON.parse(profileText);
        await uploadProfile();
    });

    async function uploadProfile() {
        isSuccess = false;
        isError = false;
        try {
             await axios.post(uploadEndpoint, profileJson);
             isSuccess = true;
        } catch(e) {
            isError = true;
            throw e;
        }
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
            <p>Profile: {profileJson.id}-{profileJson.version}</p>
            {#if isSuccess}
                <p class="text-green-500">Uploaded - Success!</p>
            {:else if isError}
                <p class="text-red-500">Upload - Failed!</p>
            {/if}
        </div>
        <slot />
    </div>
</div>
