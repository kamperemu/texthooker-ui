export enum Theme {
	LIGHT = 'light',
	DARK = 'dark',
	CUPCAKE = 'cupcake',
	BUMBLEBEE = 'bumblebee',
	EMERALD = 'emerald',
	CORPORATE = 'corporate',
	SYNTHWAVE = 'synthwave',
	RETRO = 'retro',
	CYBERPUNK = 'cyberpunk',
	VALENTINE = 'valentine',
	HALLOWEEN = 'halloween',
	GARDEN = 'garden',
	FOREST = 'forest',
	AQUA = 'aqua',
	LOFI = 'lofi',
	PASTEL = 'pastel',
	FANTASY = 'fantasy',
	WIREFRAME = 'wireframe',
	BLACK = 'black',
	LUXURY = 'luxury',
	DRACULA = 'dracula',
	CMYK = 'cmyk',
	AUTUMN = 'autumn',
	BUSINESS = 'business',
	ACID = 'acid',
	LEMONADE = 'lemonade',
	NIGHT = 'night',
	COFFEE = 'coffee',
	WINTER = 'winter',
}

export enum OnlineFont {
	OFF = 'Off',
	NOTO = 'Noto Serif JP',
	KLEE = 'Klee One',
	SHIPPORI = 'Shippori Mincho',
	ACKAISYO = 'Ackaisyo',
	CINECAPTION226 = 'CineCaption226',
}

export interface Settings {
	theme$: string;
	replacements$: ReplacementItem[];
	windowTitle$: string;
	websocketUrl$: string;
	secondaryWebsocketUrl$: string;
	fontSize$: number;
	onlineFont$: string;
	preventLastDuplicate$: number;
	maxLines$: number;
	maxPipLines$: number;
	enableExternalClipboardMonitor$: boolean;
	skipResetConfirmations$: boolean;
	persistLines$: boolean;
	enablePaste$: boolean;
	blockCopyOnPage$: boolean;
	preventGlobalDuplicate$: boolean;
	mergeEqualLineStarts$: boolean;
	filterNonCJKLines: boolean;
	displayVertical$: boolean;
	reverseLineOrder$: boolean;
	preserveWhitespace$: boolean;
	removeAllWhitespace$: boolean;
	enableLineAnimation$: boolean;
	continuousReconnect$: boolean;
	showConnectionErrors$: boolean;
	showConnectionIcon$: boolean;
	customCSS$: string;
}

export interface ReplacementItem {
	pattern: string;
	replaces: string;
	flags: string[];
	enabled: boolean;
}

export interface DialogResult<T = undefined> {
	canceled: boolean;
	data: T;
}

export enum LineType {
	SOCKET = 'socket',
	PASTE = 'paste',
	EXTERNAL = 'external',
	EDIT = 'edit',
	UNDO = 'undo',
}

export interface LineItem {
	id: string;
	text: string;
	index?: number;
}

export interface LineItemEditEvent {
	inEdit: boolean;
	data?: LineItemEditData;
}

export interface LineItemEditData {
	originalText: string;
	newText: string;
	lineIndex: number;
	line: LineItem;
}
