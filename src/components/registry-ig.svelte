<script>
    import { Dropdown, Search, Button, Chevron, Modal, Spinner } from "flowbite-svelte";
    import axios from "axios";
    import { onMount } from "svelte";
    import { validatorApiConfig } from "../stores/validator-api.config";
    import { igsFromRegistry } from "../stores/registry-ig";
    import urlJoin from "url-join";
    import { fade } from "svelte/transition";
    import CustomSelect from "./common/custom-select.svelte";

    let selectedIgName = "Click to Select IG";
    /** @type {import("../models/igInfo").Ig | undefined} */
    let selectIg = undefined;
    let searchInputValue = "";

    /** @type {import("../models/igInfo.d").Ig[] } */
    let filteredIgs;

    /** @type {import("../models/igInfo.d").Ig[] } */
    let igVersion = [];
    /** @type {import("../models/igInfo.d").Ig[] } */
    let filteredIgVersion = [];
    /** @type {import("../models/igInfo.d").Ig | undefined } */
    let selectedIgVersion;
    let selectedIgVersionText = "";
    let igVersionSearch = "";
    /** @type {Promise<any> | undefined}*/
    let getIgVersionPromise;

    let openLoadingModal = false;
    let openSuccessLoadedModal = false;

    onMount(() => {
        filteredIgs = $igsFromRegistry;
    });

    /**
     *
     * @param {import("../models/igInfo.d").Ig } ig
     */
    async function clickIgInDropdown(ig) {
        selectIg = ig;
        selectedIgName = selectIg.id;
        getIgVersionPromise = getIgVersion();
    }

    /**
     *
     * @param {import("../models/igInfo.d").Ig } item
     */
    function getIgShowText(item) {
        return item.id;
    }

    async function getIgVersion() {
        try {
            let { data } = await axios.get(
                urlJoin($validatorApiConfig.endpoint, `/igs/${selectIg?.id}`)
            );
            igVersion = data;
            filteredIgVersion = igVersion;

            if (igVersion.length === 0) {
                console.log(igVersion);
                selectedIgVersion = {
                    id: "",
                    version: "",
                    fhirVersion: "",
                    url: ""
                };
            }
            return data;
        } catch (e) {
            throw e;
        }
    }

    function onSearchInputKeydown() {
        filteredIgs = $igsFromRegistry.filter((v) =>
            searchInputValue ? v.id.includes(searchInputValue) : true
        );
    }

    function onIgVersionSearchKeydown() {
        filteredIgVersion = igVersion.filter((v) =>
            igVersionSearch
                ? v.version.includes(igVersionSearch) || v.fhirVersion.includes(igVersionSearch)
                : true
        );
    }

    /**
     *
     * @param {import("../models/igInfo").Ig} item
     */
    function onSelectIgVersion(item) {
        selectedIgVersion = item;
        selectedIgVersionText = `${item.fhirVersion} - ${item.version}`;
    }

    /**
     *
     * @param {import("../models/igInfo").Ig} item
     */
    function igVersionSelectShowText(item) {
        return `${item.fhirVersion} - ${item.version}`;
    }

    async function doLoadIgFromRegistry() {
        openLoadingModal = true;
        try {
            await axios.post(urlJoin($validatorApiConfig.endpoint, `/igs/from-registry`), {
                id: selectedIgVersion?.id,
                version: selectedIgVersion?.version
            });
            openLoadingModal = false;
            openSuccessLoadedModal = true;
        } catch (e) {
            throw e;
        }
    }
</script>

<div transition:fade>
    <CustomSelect
        labelText="選擇你想讀取的 IG (Implementation Guide)"
        initSelectText="Click to Select IG"
        bind:data={filteredIgs}
        bind:selectValue={selectIg}
        bind:selectText={selectedIgName}
        bind:searchInputValue
        {onSearchInputKeydown}
        onSelectItem={clickIgInDropdown}
        getSelectShowText={getIgShowText}
        resetSelectCallback={() => (selectedIgVersion = undefined)}
    />

    {#if selectIg}
        {#await getIgVersionPromise}
            <span>Loading...</span>
        {:then rValue}
            {#if igVersion.length}
                <CustomSelect
                    labelText="選擇版本"
                    initSelectText="Click to Select Version"
                    bind:data={filteredIgVersion}
                    bind:selectValue={selectedIgVersion}
                    bind:selectText={selectedIgVersionText}
                    bind:searchInputValue={igVersionSearch}
                    onSearchInputKeydown={onIgVersionSearchKeydown}
                    onSelectItem={onSelectIgVersion}
                    getSelectShowText={igVersionSelectShowText}
                />
            {:else}
                <span>No Version Found</span>
            {/if}
        {/await}
    {/if}

    {#if selectedIgVersion}
        <Button on:click={() => doLoadIgFromRegistry()}>讀取</Button>
    {/if}
</div>

<Modal open={openLoadingModal} permanent={true}>
    <div class="text-center">
        <Spinner size={"16"} />
        <span class="block">Loading...</span>
    </div>
</Modal>

<Modal open={openSuccessLoadedModal}>
    <div class="flex flex-wrap text-center justify-center align-middle">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-20 h-20"
        >
            <path
                id="check-path"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
        <span class="m-2 block w-full">讀取 IG {selectedIgName}-{selectedIgVersionText} 成功</span>
        <Button on:click={() => openSuccessLoadedModal = false}>OK</Button>

    </div>
</Modal>

<style>
    @keyframes draw-check {
        from {
            stroke-dashoffset: 30; /* The length of the checkmark path */
            stroke-dasharray: 30;
        }
        to {
            stroke-dashoffset: 0;
            stroke-dasharray: 0;
        }
    }
    /* Set the stroke-dasharray and stroke-dashoffset to create the animation effect */
    #check-path {
        stroke-dasharray: 30; /* The length of the checkmark path */
        stroke-dashoffset: 30; /* The length of the checkmark path */
        animation: draw-check 0.5s ease forwards; /* Adjust the animation duration as needed */
    }
</style>
