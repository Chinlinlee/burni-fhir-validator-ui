<script>
    import { onMount } from "svelte";
    import "../app.postcss";
    import { validatorApiConfig } from "../stores/validator-api.config";
    import urlJoin from "url-join";
    import axios from "axios";
    import { igsFromRegistry } from "../stores/registry-ig";

    let isLoading = true;

    onMount(async () => {
        const configModules = import.meta.glob("../configs/*.config*.js");
        let config = await configModules["../configs/validator-api.config.example.js"]();
        if (configModules["../config/validator-api.config.js"]) {
            config = await configModules["../configs/validator-api.config.js"]();
        } 
        //@ts-ignore
        validatorApiConfig.set(config.config);
        isLoading = false;

        await getIgsFromRegistry();
    });


    /**
     * @return {Promise<import("../models/igInfo.d").Ig[]>}
     */
     async function getIgsFromRegistry() {
        try {
            let { data } = await axios.get(
                urlJoin($validatorApiConfig.endpoint, "/igs/from-registry")
            );
            igsFromRegistry.set(data);
            return data;
        } catch (e) {
            throw e;
        }
    }
</script>

<main class="flex-auto w-full min-w-0 lg:static lg:max-h-full lg:overflow-visible">
    {#if isLoading}
        <span>Loading...</span>
    {:else}
        <slot />
    {/if}
    
</main>
