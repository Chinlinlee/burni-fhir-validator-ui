/**
 * 
 * @param {HTMLElement} node 
 * @param {()=> void} callback 
 * @returns 
 */
export const clickOutside = (node, callback) => {
    /**
     * 
     * @param {MouseEvent} event 
     * @returns 
     */
    const handleClick = (event) => {
        if (!event?.target) return;
        if (node && !node.contains(/**@type {Node}*/(event.target)) && !event.defaultPrevented) {
            callback();
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
};