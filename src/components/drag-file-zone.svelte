<script>
    import { getAllFileEntries } from "$lib";

    let isDragEnter = false;

    export let title = "";
    /** @type {File[]} */
    export let droppedFiles = [];

    $: dragEnterStyleClass = isDragEnter
        ? "p-4 border-2 border-sky-500 border-solid rounded-lg bg-sky-100 dark:bg-blue-dark-400"
        : "p-4 border-2 border-gray-200 border-solid rounded-lg";

    /**
     *
     * @param {DragEvent} event
     */
    function onDragOver(event) {
        event.preventDefault();
        isDragEnter = true;
    }

    function onDragLeave() {
        isDragEnter = false;
    }

    /**
     *
     * @param {DragEvent} event
     */
    async function onDragDrop(event) {
        event.preventDefault();
        isDragEnter = false;

        if (event.dataTransfer?.items) {
            if (event.dataTransfer?.items) {
                /** @type { FileSystemFileEntry[] } */
                let fileEntries = await getAllFileEntries(event.dataTransfer.items);
                for (let fileEntry of fileEntries) {
                    await appendFileEntry(fileEntry);
                }
            }
        }
    }

    /**
     *
     * @param { FileSystemFileEntry }  fileEntry
     */
    function appendFileEntry(fileEntry) {
        return new Promise((resolve) => {
            fileEntry.file(async (file) => {
                droppedFiles = [...droppedFiles, file];
                resolve(true);
            });
        });
    }

    /**
     *
     * @param {FileList} files
     */
    function appendFiles(files) {
        for (let file of files) {
            droppedFiles = [...droppedFiles, file];
        }
    }
</script>

<div
    class={dragEnterStyleClass}
    aria-grabbed={false}
    aria-label="上傳區塊"
    draggable="true"
    on:dragover={onDragOver}
    on:dragleave={onDragLeave}
    on:drop={onDragDrop}
    on:click={() => /** @type { HTMLElement } */ (document.querySelector('#inputFile'))?.click()}
    role={"region"}
>
    <div>
        <h2 class="text-2xl text-center dark:text-indigo-100">{title}</h2>
        <div class="flex items-center justify-center max-w-full mt-5 text-xl text-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-10 h-10"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                fill="#38bdf8"
            >
                <path
                    d="m.5 3 .04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2Zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672Z"
                />
                <path
                    d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5Z"
                />
            </svg>
        </div>
    </div>
</div>

<input
    id="inputFile"
    type="file"
    class="hidden"
    multiple
    on:change={() => {
        let files = /** @type { HTMLInputElement } */ (document.querySelector("#inputFile"))?.files;

        if (files) appendFiles(files);
    }}
/>
