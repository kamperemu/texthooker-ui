import {
	LineType,
	OnlineFont,
	Theme,
	type LineItem,
	type ReplacementItem,
	type Settings,
} from './../types';

import { Subject } from 'rxjs';
import { writable } from 'svelte/store';
import { writableBooleanSubject } from './transformer/writeable-boolean-subject';
import { writableNumberSubject } from './transformer/writeable-number-subject';
import { writeableArraySubject } from './transformer/writeable-object-sibject';
import { writableStringSubject } from './transformer/writeable-string-subject';
import { writableSubject } from './transformer/writeable-subject';

export const defaultSettings: Settings = {
	theme$: Theme.BUSINESS,
	replacements$: [],
	windowTitle$: '',
	websocketUrl$: 'ws://localhost:6677',
	secondaryWebsocketUrl$: '',
	fontSize$: 24,
	onlineFont$: OnlineFont.OFF,
	preventLastDuplicate$: 0,
	maxLines$: 0,
	maxPipLines$: 1,
	enableExternalClipboardMonitor$: false,
	skipResetConfirmations$: false,
	persistLines$: true,
	enablePaste$: false,
	blockCopyOnPage$: false,
	preventGlobalDuplicate$: false,
	mergeEqualLineStarts$: false,
	filterNonCJKLines: false,
	displayVertical$: false,
	reverseLineOrder$: false,
	preserveWhitespace$: true,
	removeAllWhitespace$: false,
	enableLineAnimation$: false,
	continuousReconnect$: false,
	showConnectionErrors$: true,
	showConnectionIcon$: true,
	customCSS$: '',
};

export const theme$ = writableStringSubject()('bannou-texthooker-theme', defaultSettings.theme$);

export const replacements$ = writeableArraySubject<ReplacementItem>()('bannou-texthooker-replacements', []);

export const windowTitle$ = writableStringSubject()('bannou-texthooker-windowTitle', defaultSettings.windowTitle$);

export const websocketUrl$ = writableStringSubject()('bannou-texthooker-websocketUrl', defaultSettings.websocketUrl$);

export const secondaryWebsocketUrl$ = writableStringSubject()(
	'bannou-texthooker-secondary-websocketUrl',
	defaultSettings.secondaryWebsocketUrl$
);

export const fontSize$ = writableNumberSubject()('bannou-texthooker-fontSize', defaultSettings.fontSize$);

export const onlineFont$ = writableStringSubject()('bannou-texthooker-onlineFont', defaultSettings.onlineFont$);

export const preventLastDuplicate$ = writableNumberSubject()(
	'bannou-texthooker-preventLastDuplicate',
	defaultSettings.preventLastDuplicate$
);

export const maxLines$ = writableNumberSubject()('bannou-texthooker-maxLines', defaultSettings.maxLines$);

export const maxPipLines$ = writableNumberSubject()('bannou-texthooker-maxPipLines', defaultSettings.maxPipLines$);

export const enableExternalClipboardMonitor$ = writableBooleanSubject()(
	'bannou-texthooker-enableExternalClipboardMonitor',
	defaultSettings.enableExternalClipboardMonitor$
);

export const skipResetConfirmations$ = writableBooleanSubject()(
	'bannou-texthooker-skipResetConfirmations',
	defaultSettings.skipResetConfirmations$
);


export const persistLines$ = writableBooleanSubject()('bannou-texthooker-persistLines', defaultSettings.persistLines$);

export const enablePaste$ = writableBooleanSubject()('bannou-texthooker-enablePaste', defaultSettings.enablePaste$);

export const blockCopyOnPage$ = writableBooleanSubject()(
	'bannou-texthooker-blockCopyOnPage',
	defaultSettings.blockCopyOnPage$
);

export const preventGlobalDuplicate$ = writableBooleanSubject()(
	'bannou-texthooker-preventGlobalDuplicate',
	defaultSettings.preventGlobalDuplicate$
);

export const mergeEqualLineStarts$ = writableBooleanSubject()(
	'bannou-texthooker-mergeEqualLineStarts',
	defaultSettings.mergeEqualLineStarts$
);

export const filterNonCJKLines$ = writableBooleanSubject()(
	'bannou-texthooker-filterNonCJKLines',
	defaultSettings.mergeEqualLineStarts$
);

export const displayVertical$ = writableBooleanSubject()(
	'bannou-texthooker-displayVertical',
	defaultSettings.displayVertical$
);

export const reverseLineOrder$ = writableBooleanSubject()(
	'bannou-texthooker-reverseLineOrder',
	defaultSettings.reverseLineOrder$
);

export const preserveWhitespace$ = writableBooleanSubject()(
	'bannou-texthooker-preserveWhitespace',
	defaultSettings.preserveWhitespace$
);

export const removeAllWhitespace$ = writableBooleanSubject()(
	'bannou-texthooker-removeAllWhitespace',
	defaultSettings.removeAllWhitespace$
);

export const enableLineAnimation$ = writableBooleanSubject()(
	'bannou-texthooker-enableLineAnimation',
	defaultSettings.enableLineAnimation$
);

export const continuousReconnect$ = writableBooleanSubject()(
	'bannou-texthooker-continuousReconnect',
	defaultSettings.continuousReconnect$
);

export const showConnectionErrors$ = writableBooleanSubject()(
	'bannou-texthooker-showConnectionErrors',
	defaultSettings.showConnectionErrors$
);

export const showConnectionIcon$ = writableBooleanSubject()(
	'bannou-texthooker-showConnectionIcon',
	defaultSettings.showConnectionIcon$
);

export const customCSS$ = writableStringSubject()('bannou-texthooker-customCSS', defaultSettings.customCSS$);

export const socketState$ = writableSubject<number>(-1);

export const secondarySocketState$ = writableSubject<number>(-1);

export const openDialog$ = writableSubject<Record<string, any>>(undefined);

export const dialogOpen$ = writableSubject<boolean>(false);

export const lineData$ = writeableArraySubject<LineItem>()('bannou-texthooker-lineData', [], persistLines$);

export const newLine$ = new Subject<[string, LineType]>();

export const reconnectSocket$ = new Subject<void>();

export const reconnectSecondarySocket$ = new Subject<void>();

export const showSpinner$ = writable<boolean>(false);

export const enabledReplacements$ = writable<ReplacementItem[]>([]);

export const lastPipHeight$ = writableNumberSubject()('bannou-texthooker-lastPipHeight', 0);

export const lastPipWidth$ = writableNumberSubject()('bannou-texthooker-lastPipWidth', 0);

