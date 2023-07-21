<script lang="ts">
    import { twMerge } from "tailwind-merge";

    export let name: string = "Close";
    export let size: "xs" | "sm" | "md" | "lg" = "md";
    export let ariaLabel: string | undefined = undefined;

    const svgSizes = {
        xs: "w-3 h-3",
        sm: "w-3.5 h-3.5",
        md: "w-5 h-5",
        lg: "w-5 h-5"
    };

    const sizing = {
        xs: "m-0.5 rounded-sm p-0.5",
        sm: "m-0.5 rounded p-0.5",
        md: "m-0.5 rounded-lg p-1.5",
        lg: "m-0.5 rounded-lg p-2.5"
    };

    let buttonClass: string;
    $: buttonClass = twMerge(
        "focus:outline-none whitespace-normal text-red-500",
        sizing[size],
        $$props.class
    );
</script>

<button on:click type="button" {...$$restProps} class={buttonClass} aria-label={ariaLabel ?? name}>
    {#if name}<span class="sr-only">{name}</span>{/if}
    <svg
        class={svgSizes[size]}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
        />
    </svg>
</button>
