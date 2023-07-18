<script>
    import { onMount } from "svelte";
    import "../app.postcss";
    import { validatorApiConfig } from "../stores/validator-api.config";

    onMount(async () => {
        const configModules = import.meta.glob("../configs/*.config*.js");
        console.log(configModules);
        let config = await configModules["../configs/validator-api.config.example.js"]();
        if (configModules["../config/validator-api.config.js"]) {
            config = await configModules["../configs/validator-api.config.js"]();
        } 
        //@ts-ignore
        validatorApiConfig.set(config.config);
    });

</script>

<main class="flex-auto w-full min-w-0 lg:static lg:max-h-full lg:overflow-visible">
    <slot />
</main>
