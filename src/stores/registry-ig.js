import { writable } from "svelte/store";


export const igsFromRegistry = writable(/** @type { import("../models/igInfo").Ig[] } */([]));