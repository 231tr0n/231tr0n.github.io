import { writable } from 'svelte/store';

export const lightMode = writable(false);
export const htmlPlayground = writable('');
export const pageSelectStore = writable(0);
