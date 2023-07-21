<script>
    import { clickOutside } from "$lib/clickOutside";
    import { Label, Search } from "flowbite-svelte";
    import { uid } from "uid/secure";
    import { computePosition, autoPlacement, offset } from "@floating-ui/dom";
    import { onMount } from "svelte";

    export let labelText = "";
    export let selectText = "";
    export let initSelectText = "";
    /** @type {unknown}*/
    export let selectValue;
    /** @type {ArrayLike<unknown>}*/
    export let data = [];
    let selectId = `select-${uid()}`;
    let selectDropdownId = `select-dropdown-${uid()}`;
    let searchInputId = `search-input-${uid()}`;
    /** @type {string}*/
    export let searchInputValue;
    /** @type {() => void} */
    export let onSearchInputKeydown;
    /** @type {(item: any) => void} */
    export let onSelectItem;
    /** @type {(item: any) => void} */
    export let getSelectShowText;
    /** @type {() => void} */
    export let resetSelectCallback = () => {};

    /**
     *
     * @param {number} n
     */
    const px = (n) => (n != null ? `${n}px` : "");

    function openSelectDropdown() {
        /** @type {HTMLElement | null} */
        let dropdown = document.querySelector(`#${selectDropdownId}`);

        dropdown?.classList.toggle("hidden");
        updateDropdownPosition();

        setTimeout(() => {
            /** @type {HTMLElement} */ (document.querySelector(`#${searchInputId}`)).focus();
        }, 5);
    }

    function updateDropdownPosition() {
        let dropdown = document.querySelector(`#${selectDropdownId}`);
        let select = document.querySelector(`#${selectId}`);

        /** @type { HTMLElement }*/ (dropdown).style.removeProperty("position");
        /** @type { HTMLElement }*/ (dropdown).style.removeProperty("left");
        /** @type { HTMLElement }*/ (dropdown).style.removeProperty("top");
        /** @type { HTMLElement }*/ (dropdown).style.removeProperty("width");

        computePosition(
            /** @type {HTMLElement}*/ (select),
            /** @type { HTMLElement }*/ (dropdown),
            { middleware: [autoPlacement(), offset(+8)] }
        ).then(({ x, y, strategy }) => {
            /** @type { HTMLElement }*/ (dropdown).style.position = strategy;
            /** @type { HTMLElement }*/ (dropdown).style.left = px(x);
            /** @type { HTMLElement }*/ (dropdown).style.top = px(y);
            /** @type { HTMLElement }*/ (dropdown).style.width = px(
                /** @type {HTMLElement}*/ (select).offsetWidth
            );
        });
    }

    function resetSelect() {
        selectText = initSelectText;
        selectValue = undefined;
        hideDropdown();
        resetSelectCallback();
    }

    function hideDropdown() {
        let dropdown = document.querySelector(`#${selectDropdownId}`);
        /** @type { HTMLElement }*/ (dropdown).classList.add("hidden");
    }
</script>

<div
    class="wrapper-select"
    use:clickOutside={() => {
        document.querySelector(`#${selectDropdownId}`)?.classList.add("hidden");
    }}
>
    <Label>
        {labelText}
    </Label>
    <div
        class="w-full border p-2 rounded flex mb-2"
        on:click={() => {
            openSelectDropdown();
        }}
        on:keydown
        on:keyup
        on:keypress
        role="button"
        tabindex="-1"
        id={selectId}
    >
        <span>
            {#if selectValue}
                {selectText}
            {:else}
                {initSelectText}
            {/if}
        </span>
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
    <div class="flex wrapper-select-dropdown">
        <div
            id={selectDropdownId}
            class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full dark:bg-gray-700 hidden max-h-96 overflow-y-auto"
        >
            <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdown-button"
            >
                <div class="p-3">
                    <Search
                        size="md"
                        id={searchInputId}
                        bind:value={searchInputValue}
                        on:keyup={() => {
                            onSearchInputKeydown();
                            updateDropdownPosition();
                        }}
                    />
                </div>

                <li>
                    <a
                        href={undefined}
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                        on:click={() => resetSelect()}
                    >
                        {initSelectText}
                    </a>
                </li>

                {#each data as item}
                    <li>
                        <a
                            href={undefined}
                            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                            on:click={() => {
                                onSelectItem(item);
                                hideDropdown();
                            }}>{getSelectShowText(item)}</a
                        >
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</div>
