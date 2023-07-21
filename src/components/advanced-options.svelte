<script>
    import { Accordion, AccordionItem, Tabs, TabItem, List } from "flowbite-svelte";
    import CloseButton from "./common/close-button.svelte";
    import { fade } from "svelte/transition";
    import DragFileZone from "./drag-file-zone.svelte";
    import FileCard from "./file-card.svelte";
    import ProfileFileCard from "./profile-file-card.svelte";
    import RegistryIg from "./registry-ig.svelte";
    
    import { validatorApiConfig } from "../stores/validator-api.config";

    /** @type {File[]} */
    let igFiles = [];
    /** @type {File[]} */
    let profileFiles = [];

    let selectedTabIndex = 0;

    $: {
        let allowFiles = [];
        for (let i = 0; i < igFiles.length; i++) {
            let igFile = igFiles[i];
            if (isIgFile(igFile)) {
                allowFiles.push(igFile);
            }
        }
        igFiles = allowFiles;
    }

    $: {
        /** @type {File[]} */
        let allowFiles = [];
        for (let i = 0; i < profileFiles.length; i++) {
            let profileFile = profileFiles[i];
            if (isProfileFile(profileFile)) {
                allowFiles.push(profileFile);
            }
        }
        profileFiles = allowFiles;
    }

    /**
     *
     * @param {number} index
     */
    function dismissIgFiles(index) {
        igFiles.splice(index, 1);
        igFiles = [...igFiles];
    }

    /**
     *
     * @param {number} index
     */
    function dismissProfileFiles(index) {
        profileFiles.splice(index, 1);
        profileFiles = [...profileFiles];
    }

    /**
     *
     * @param {File} file
     */
    function isIgFile(file) {
        console.log(file.type);
        return file.type === "application/x-compressed";
    }

    /**
     *
     * @param {File} file
     */
    function isProfileFile(file) {
        return file.type === "application/json";
    }
</script>

<Accordion flush>
    <AccordionItem>
        <span slot="header" class="underline">進階選項</span>
        <List class="pb-3 text-slate-900">
            <li>
                預設情況下，Validator 會使用 <span class="md-code-text">meta.profile</span> 當中的網址來進行驗證
            </li>
            <li>
                若 <span class="md-code-text">meta.profile</span> 為空，則使用基本的 FHIR profile 驗證
            </li>
            <li>
                你可以選擇上傳自訂的 IG 或 Profile，讓 Validator 讀取並支援驗證自訂的 IG/Profile
            </li>
            <li>你也可以讓 Validator 讀取來自 Registry 的 IG</li>
        </List>
        <Tabs>
            <TabItem
                open={selectedTabIndex === 0}
                title="Upload IG"
                on:click={() => {
                    selectedTabIndex = 0;
                }}
            >
                {#if selectedTabIndex === 0}
                    <div transition:fade>
                        <div class="mb-2">
                            <DragFileZone
                                title="Drop IG file(s) here to upload ('.tgz')"
                                bind:droppedFiles={igFiles}
                            />
                        </div>

                        {#each igFiles as igFile, index (index)}
                            <FileCard
                                inputFile={igFile}
                                uploadEndpoint={`${$validatorApiConfig.endpoint}/igs`}
                                isAllowFile={isIgFile(igFile)}
                            >
                                <CloseButton
                                    on:click={() => dismissIgFiles(index)}
                                    class="close-file-card-button"
                                />
                            </FileCard>
                        {/each}
                    </div>
                {/if}
            </TabItem>

            <TabItem
                title="Upload Profile"
                open={selectedTabIndex === 1}
                on:click={() => {
                    selectedTabIndex = 1;
                }}
            >
                {#if selectedTabIndex === 1}
                    <div transition:fade>
                        <div class="mb-2">
                            <DragFileZone
                                title="Drop Profile (StructureDefinition) file(s) here to upload ('.json')"
                                bind:droppedFiles={profileFiles}
                            />
                        </div>

                        {#each profileFiles as profile, index (index)}
                            <ProfileFileCard
                                inputProfile={profile}
                                uploadEndpoint={`${$validatorApiConfig.endpoint}/profile`}
                            >
                                <CloseButton
                                    on:click={() => dismissProfileFiles(index)}
                                    class="close-file-card-button"
                                />
                            </ProfileFileCard>
                        {/each}
                    </div>
                {/if}
            </TabItem>

            <TabItem
                title="Load From Registry"
                open={selectedTabIndex === 2}
                on:click={() => {
                    selectedTabIndex = 2;
                }}
            >
                {#if selectedTabIndex === 2}
                    <RegistryIg>
                        
                    </RegistryIg>
                {/if}
            </TabItem>
        </Tabs>
    </AccordionItem>
</Accordion>
