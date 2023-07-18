// place files you want to import through the `$lib` alias in this folder.

/**
 * @param {number} bytes
 */
export function getSizeString(bytes) {
    if (bytes < 1024) {
        return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
        const sizeInKB = (bytes / 1024).toFixed(2);
        return sizeInKB + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
        const sizeInMB = (bytes / (1024 * 1024)).toFixed(2);
        return sizeInMB + ' MB';
    } else {
        const sizeInGB = (bytes / (1024 * 1024 * 1024)).toFixed(2);
        return sizeInGB + ' GB';
    }
}

/**
 * From {@link https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree/53058574#53058574}
 * Drop handler function to get all files
 * @param { DataTransferItemList } dataTransferItemList
 */
export async function getAllFileEntries(dataTransferItemList) {
    let fileEntries = [];
    // Use BFS to traverse entire directory/file structure
    let queue = [];
    // Unfortunately dataTransferItemList is not iterable i.e. no forEach
    for (let i = 0; i < dataTransferItemList.length; i++) {
        // Note webkitGetAsEntry a non-standard feature and may change
        // Usage is necessary for handling directories
        queue.push(dataTransferItemList[i].webkitGetAsEntry());
    }
    while (queue.length > 0) {
        let entry = queue.shift();
        if (entry?.isFile) {
            fileEntries.push(entry);
        } else if (entry?.isDirectory) {
            let reader = /** @type { FileSystemDirectoryEntry } */(entry).createReader();
            queue.push(...(await readAllDirectoryEntries(reader)));
        }
    }
    return fileEntries;
}


/**
 * Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
 * @param { FileSystemDirectoryReader  } directoryReader 
 * @returns 
 */
async function readAllDirectoryEntries(directoryReader) {
    let entries = [];
    let readEntries = await readEntriesPromise(directoryReader);
    while (readEntries.length > 0) {
        entries.push(...readEntries);
        readEntries = await readEntriesPromise(directoryReader);
    }
    return entries;
}

/**
 * Wrap readEntries in a promise to make working with readEntries easier
 * @param {FileSystemDirectoryReader } directoryReader 
 * @returns 
 */
async function readEntriesPromise(directoryReader) {
    try {
        return await new Promise((resolve, reject) => {
            directoryReader.readEntries(resolve, reject);
        });
    } catch (err) {
        console.log(err);
    }
}