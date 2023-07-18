<script>
    import { Dropdown, Search, Button, Chevron } from "flowbite-svelte";
    import axios from "axios";
    import { onMount } from "svelte";
    import { validatorApiConfig } from "../stores/validator-api.config";
    import urlJoin from "url-join";
    import { fade } from "svelte/transition";
    import { computePosition, autoPlacement, autoUpdate } from "@floating-ui/dom";
    import { clickOutside } from "$lib/clickOutside";

    const px = (n) => (n != null ? `${n}px` : "");

    onMount(async () => {
        await getIgsFromRegistry();
    });

    async function getIgsFromRegistry() {
        try {
            let { data } = await axios.get(
                urlJoin($validatorApiConfig.endpoint, "/igs/from-registry")
            );
            console.log(data);
            return data;
        } catch (e) {
            throw e;
        }
    }

    function openIgsDropdown() {
        let dropdownIgs = document.querySelector("#dropdown-registry-igs");
        let selectIgs = document.querySelector("#select-igs");

        dropdownIgs?.classList.toggle("hidden");

        computePosition(selectIgs, dropdownIgs, { middleware: [autoPlacement()] }).then(
            ({ x, y, strategy }) => {
                console.log(x);
                dropdownIgs.style.position = strategy;
                dropdownIgs.style.left = px(x);
                dropdownIgs.style.top = px(y);
                dropdownIgs.style.width = px(selectIgs.offsetWidth);
            }
        );
    }
</script>

<div
    transition:fade
    use:clickOutside={() => {
        document.querySelector("#dropdown-registry-igs")?.classList.add("hidden");
    }}
>
    <span>TODO: IG Registry Select</span>
    <div
        class="w-full border p-2 rounded flex"
        on:click={() => {
            openIgsDropdown();
        }}
        on:keydown
        on:keyup
        on:keypress
        role="button"
        tabindex="-1"
        id="select-igs"
    >
        <span>click</span>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            class="h-4 w-4 ml-auto"
            aria-label="chevron down"
            fill="none"
            viewBox="0 0 20 20"
            role="img"
            stroke-width="2"
            ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
                stroke="currentColor"
            /></svg
        >
    </div>
    <div class="flex">
        <div
            id="dropdown-registry-igs"
            class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700 hidden"
        >
            <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdown-button"
            >
                <div class="p-3">
                    <Search size="md" />
                </div>

                <li>
                    <a
                        href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >Shopping</a
                    >
                </li>
                <li>
                    <a
                        href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >Images</a
                    >
                </li>
                <li>
                    <a
                        href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >News</a
                    >
                </li>
                <li>
                    <a
                        href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >Finance</a
                    >
                </li>
            </ul>
        </div>
    </div>
</div>
