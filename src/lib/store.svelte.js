import { writable } from 'svelte/store';

// Webpage stores.
export const lightMode = writable(false);
export const htmlPlayground = writable('');

// Component stores.
export const selectedItemStore = writable(0);
