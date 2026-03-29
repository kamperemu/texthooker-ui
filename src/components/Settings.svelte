<script lang="ts">
	import {
		mdiHelpCircle,
		mdiWeatherNight,
		mdiWhiteBalanceSunny,
	} from '@mdi/js';
	import { createEventDispatcher, tick } from 'svelte';
	import {
		blockCopyOnPage$,
		continuousReconnect$,
		customCSS$,
		dialogOpen$,
		displayVertical$,
		enableExternalClipboardMonitor$,
		enableLineAnimation$,
		enablePaste$,
		filterNonCJKLines$,
		fontSize$,
		lineData$,
		maxLines$,
		maxPipLines$,
		mergeEqualLineStarts$,
		newLine$,
		onlineFont$,
		openDialog$,
		persistLines$,
		preserveWhitespace$,
		preventGlobalDuplicate$,
		preventLastDuplicate$,
		reconnectSecondarySocket$,
		reconnectSocket$,
		removeAllWhitespace$,
		reverseLineOrder$,
		secondaryWebsocketUrl$,
		showConnectionErrors$,
		showConnectionIcon$,
		showSpinner$,
		skipResetConfirmations$,
		theme$,
		websocketUrl$,
		windowTitle$,
	} from '../stores/stores';
	import {
		LineType,
		OnlineFont,
		Theme,
		type DialogResult,
		type LineItem,
	} from '../types';
	import { clickOutside } from '../use-click-outside';
	import { applyCustomCSS, dummyFn } from '../util';
	import Icon from './Icon.svelte';
	import ReplacementSettings from './ReplacementSettings.svelte';

	export let selectedLineIds: string[];
	export let settingsOpen: boolean;
	export let settingsElement: SVGElement;
	export let pipAvailable: boolean;

	export async function handleReset(linesOnly: boolean) {
		if (!$skipResetConfirmations$) {
			const { canceled } = await new Promise<DialogResult>((resolve) => {
				$openDialog$ = {
					icon: mdiHelpCircle,
					message: linesOnly
						? 'All displayed and stored Lines will be cleared'
						: 'Clear stored Lines',
					callback: resolve,
				};
			});

			if (canceled) {
				return;
			}
		}

		$lineData$ = [];
		selectedLineIds = [];
		window.localStorage.removeItem('bannou-texthooker-lineData');
	}

	const dispatch = createEventDispatcher<{ layoutChange: void; maxLinesChange: void }>();
	const onlineFonts = [
		OnlineFont.OFF,
		OnlineFont.NOTO,
		OnlineFont.KLEE,
		OnlineFont.SHIPPORI,
		OnlineFont.ACKAISYO,
		OnlineFont.CINECAPTION226,
	];

	let clipboardMutationObserver: MutationObserver | undefined;

	$: websocketUrl = $websocketUrl$;

	$: secondaryWebsocketUrl = $secondaryWebsocketUrl$;

	$: document.body.dataset.theme = $theme$;

	$: updateExternalClipboardMonitor($enableExternalClipboardMonitor$);

	$: applyCustomCSS(document, $customCSS$);

	function handleSecondaryWebsocketChange(event: Event) {
		const target = event.target as HTMLInputElement;

		target.setCustomValidity('');

		if (secondaryWebsocketUrl === websocketUrl) {
			target.setCustomValidity('Duplicate Websocket');
			secondaryWebsocketUrl = '';
			$secondaryWebsocketUrl$ = '';
		} else {
			$secondaryWebsocketUrl$ = target.value;
		}

		target.reportValidity();
	}

	function updateExternalClipboardMonitor(enableExternalClipboardMonitor: boolean) {
		if (enableExternalClipboardMonitor && !clipboardMutationObserver) {
			tick().then(() => {
				clipboardMutationObserver = new MutationObserver(clipboardMutationObserverCallback);
				clipboardMutationObserver.observe(document.body, { childList: true });
			});
		} else if (!enableExternalClipboardMonitor && clipboardMutationObserver) {
			clipboardMutationObserver.disconnect();
			clipboardMutationObserver = undefined;
		}
	}

	function clipboardMutationObserverCallback(mutations: MutationRecord[]) {
		for (let index = 0, { length } = mutations; index < length; index += 1) {
			const { addedNodes } = mutations[index];

			for (let index2 = 0, { length: length2 } = addedNodes; index2 < length2; index2 += 1) {
				const addedNode = addedNodes[index] as HTMLElement;

				if (addedNode?.tagName === 'P') {
					newLine$.next([addedNode.textContent, LineType.EXTERNAL]);
					addedNode.remove();
				}
			}
		}
	}

	function updateCustomCSS(customCSS: string) {
		const textNode = document.createTextNode(customCSS);

		let styleElement = document.getElementById('user-css');

		if (styleElement) {
			styleElement.replaceChild(textNode, styleElement.firstChild);
		} else {
			styleElement = document.createElement('style');
			styleElement.id = 'user-css';

			styleElement.appendChild(textNode);
			document.head.append(styleElement);
		}
	}

	function handleSettingsClick(event: MouseEvent) {
		const target = event.target as any;

		if (
			!$showSpinner$ &&
			target !== settingsElement &&
			target.parentElement !== settingsElement &&
			!$dialogOpen$
		) {
			settingsOpen = false;
		}
	}

	async function handlePersistenceChange(settingEnabled: boolean, message: String, storageKey: string) {
		if (settingEnabled) {
			return;
		}

		const { canceled } = await new Promise<DialogResult>((resolve) => {
			$openDialog$ = {
				icon: mdiHelpCircle,
				message,
				callback: resolve,
			};
		});

		if (!canceled) {
			window.localStorage.removeItem(storageKey);
		}
	}

	function handlePreventLastDuplicateBlur(event) {
		const target = event.target as HTMLInputElement;
		const value = Number.parseInt(target.value || '0');
		const wasChange = value !== $preventLastDuplicate$;

		if (!value || value < 0) {
			$preventLastDuplicate$ = 0;
		} else {
			$preventLastDuplicate$ = value;
		}

		target.value = `${$preventLastDuplicate$}`;

		if (wasChange) {
			handlePreventLastDuplicateChange();
		}
	}

	async function handlePreventLastDuplicateChange() {
		if (!$preventLastDuplicate$ || $lineData$.length < 2) {
			return;
		}

		const { canceled } = await new Promise<DialogResult>((resolve) => {
			$openDialog$ = {
				icon: mdiHelpCircle,
				message: 'Apply to current lines',
				callback: resolve,
			};
		});

		if (canceled) {
			return;
		}

		const nonDuplicateLines: LineItem[] = [];
		const nonDuplicateLineText = new Set<string>();
		const removedIds = new Set<string>();
		const lines = $lineData$.splice(-($preventLastDuplicate$ + 1));

		for (let index = 0, { length } = lines; index < length; index += 1) {
			const line = lines[index];

			if (nonDuplicateLineText.has(line.text)) {
				removedIds.add(line.id);
			} else {
				nonDuplicateLines.push(line);
				nonDuplicateLineText.add(line.text);
			}
		}

		$lineData$ = [...$lineData$, ...nonDuplicateLines];
		selectedLineIds = selectedLineIds.filter((selectedLineId) => !removedIds.has(selectedLineId));
	}

	function handleMaxLinesBlur(event) {
		const target = event.target as HTMLInputElement;
		const value = Number.parseInt(target.value || '0');
		const wasChange = value !== $maxLines$;

		if (!value || value < 0) {
			$maxLines$ = 0;
		} else {
			$maxLines$ = value;
		}

		target.value = `${$maxLines$}`;

		if (wasChange) {
			handleMaxLinesChange();
		}
	}

	function handleMaxPipLinesBlur(event) {
		const target = event.target as HTMLInputElement;
		const value = Number.parseInt(target.value || '0');

		if (!value || value < 0) {
			$maxPipLines$ = 1;
		} else {
			$maxPipLines$ = value;
		}

		target.value = `${$maxPipLines$}`;
	}

	async function handleMaxLinesChange() {
		const lineDiff = $lineData$.length - $maxLines$;

		if (!$maxLines$ || lineDiff < 1) {
			return;
		}

		const { canceled } = await new Promise<DialogResult>((resolve) => {
			$openDialog$ = {
				icon: mdiHelpCircle,
				message: `This will remove the first ${lineDiff} line(s)`,
				callback: resolve,
			};
		});

		if (canceled) {
			$maxLines$ = 0;
		} else {
			dispatch('maxLinesChange');
		}
	}

	async function handlePreventGlobalDuplicateChange() {
		if (!$preventGlobalDuplicate$ || $lineData$.length < 2) {
			return;
		}

		const { canceled } = await new Promise<DialogResult>((resolve) => {
			$openDialog$ = {
				icon: mdiHelpCircle,
				message: 'Apply to current lines',
				callback: resolve,
			};
		});

		if (!canceled) {
			const uniqueLines = new Set<string>();
			const removedLineIds = new Set<string>();

			$lineData$ = $lineData$.filter((line) => {
				if (uniqueLines.has(line.text)) {
					removedLineIds.add(line.id);
					return false;
				}

				uniqueLines.add(line.text);
				return true;
			});
			selectedLineIds = selectedLineIds.filter((selectedLineId) => !removedLineIds.has(selectedLineId));
		}
	}

	async function handleRemoveAllWhiteSpaceChange() {
		if ($removeAllWhitespace$) {
			const { canceled } = await new Promise<DialogResult>((resolve) => {
				$openDialog$ = {
					icon: mdiHelpCircle,
					message: 'Apply to current Lines',
					callback: resolve,
				};
			});

			if (!canceled) {
				$lineData$ = $lineData$.map((oldLine) => {
					oldLine.text = oldLine.text.replace(/\s/g, '').trim();
					return oldLine;
				});
			}
		}
	}

	function handleCustomCSSBlur(event: FocusEvent) {
		$customCSS$ = (event.target as HTMLTextAreaElement).value;
	}

</script>

<svelte:head>
	<title>{$windowTitle$ || 'Texthooker UI'}</title>
</svelte:head>

{#if settingsOpen}
	<div
		class="flex flex-col max-[800px]:w-[90vw] min-[800px]:grid grid-cols-[max-content,auto,max-content,auto] gap-3 absolute overflow-auto h-[90vh] top-11 z-10 py-4 pr-8 pl-4 border bg-base-200 overscroll-contain"
		use:clickOutside={handleSettingsClick}
	>
		<div class="mb-2" style="grid-column: 1/5;">
			<div class="flex text-sm gap-x-5 min-[600px]:justify-between max-[600px]:flex-wrap max-[600px]:gap-y-5">
				<div
					role="button"
					class="flex flex-col items-center hover:text-primary"
					on:click={() => ($theme$ = $theme$ === Theme.BUSINESS ? Theme.GARDEN : Theme.BUSINESS)}
					on:keyup={dummyFn}
				>
					<label class="swap swap-rotate">
						<input
							type="checkbox"
							checked={$theme$ === Theme.BUSINESS}
							on:change={() => ($theme$ = $theme$ === Theme.BUSINESS ? Theme.GARDEN : Theme.BUSINESS)}
						/>
						<Icon class="swap-on" path={mdiWeatherNight} />
						<Icon class="swap-off" path={mdiWhiteBalanceSunny} />
					</label>
					<span class="label-text">Theme</span>
				</div>
			</div>
		</div>
		<ReplacementSettings on:applyReplacements />
		<span class="label-text col-span-2">Window Title</span>
		<input class="input input-bordered h-8 col-span-2" bind:value={$windowTitle$} />
		<span class="label-text col-span-2">Primary Websocket</span>
		<input
			class="input input-bordered h-8 col-span-2"
			bind:value={websocketUrl}
			on:change={() => ($websocketUrl$ = websocketUrl)}
		/>
		<span class="label-text col-span-2">Secondary Websocket</span>
		<input
			class="input input-bordered h-8 col-span-2"
			bind:value={secondaryWebsocketUrl}
			on:change={handleSecondaryWebsocketChange}
		/>
		<span class="label-text col-span-2">Font Size</span>
		<input
			type="number"
			class="input input-bordered h-8 col-span-2"
			min="1"
			bind:value={$fontSize$}
			on:blur={() => {
				if (!$fontSize$ || $fontSize$ < 1) {
					$fontSize$ = 24;
				}
			}}
		/>
		<span class="label-text mr-4 col-span-2">Online Font</span>
		<select class="select col-span-2" bind:value={$onlineFont$}>
			{#each onlineFonts as font (font)}
				<option value={font}>
					{font}
				</option>
			{/each}
		</select>
		<span class="label-text col-span-2">Prevent Last Line Duplicate</span>
		<input
			type="number"
			class="input input-bordered h-8 col-span-2"
			min="0"
			value={$preventLastDuplicate$}
			on:blur={handlePreventLastDuplicateBlur}
		/>
		<span class="label-text col-span-2">Max lines</span>
		<input
			type="number"
			class="input input-bordered h-8 mb-2 col-span-2"
			min="0"
			value={$maxLines$}
			on:blur={handleMaxLinesBlur}
		/>
		{#if pipAvailable}
			<span class="label-text col-span-2">Max lines (floating window)</span>
			<input
				type="number"
				class="input input-bordered h-8 mb-2 col-span-2"
				min="0"
				value={$maxPipLines$}
				on:blur={handleMaxPipLinesBlur}
			/>
		{/if}
		<span class="label-text">Enable external Clipboard Monitor</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$enableExternalClipboardMonitor$} />
		<span class="label-text">Skip Reset Confirmations</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$skipResetConfirmations$} />
		<span class="label-text">Store Lines persistently</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary ml-2"
			bind:checked={$persistLines$}
			on:change={() =>
				handlePersistenceChange($persistLines$, 'Clear stored lines', 'bannou-texthooker-lineData')}
		/>
		<span class="label-text">Enable Paste</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$enablePaste$} />
		<span class="label-text">Block Copy from Page</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$blockCopyOnPage$} />
		<span class="label-text">Prevent Global Duplicate</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary ml-2"
			bind:checked={$preventGlobalDuplicate$}
			on:change={handlePreventGlobalDuplicateChange}
		/>
		<span class="label-text">Merge equal Line Starts</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$mergeEqualLineStarts$} />
		<span class="label-text">Filter lines without jp content</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$filterNonCJKLines$} />
		<span class="label-text">Display Text vertically</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary ml-2"
			bind:checked={$displayVertical$}
			on:change={() => dispatch('layoutChange')}
		/>
		<span class="label-text">Reverse Line Order</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary ml-2"
			bind:checked={$reverseLineOrder$}
			on:change={() => dispatch('layoutChange')}
		/>
		<span class="label-text">Preserve Whitespace</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$preserveWhitespace$} />
		<span class="label-text">Remove all Whitespace</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary ml-2"
			bind:checked={$removeAllWhitespace$}
			on:change={handleRemoveAllWhiteSpaceChange}
		/>
		<span class="label-text">Enable Line Animation</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$enableLineAnimation$} />
		<span class="label-text">Continuous Reconnect</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary ml-2"
			bind:checked={$continuousReconnect$}
			on:change={() => {
				reconnectSocket$.next();
				reconnectSecondarySocket$.next();
			}}
		/>
		<span class="label-text">Show Connection Errors</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$showConnectionErrors$} />
		<span class="label-text">Show Connection Icon</span>
		<input type="checkbox" class="checkbox checkbox-primary ml-2" bind:checked={$showConnectionIcon$} />
		<span class="label-text" style="grid-column: 1/5;">Custom CSS</span>
		<textarea
			class="p-1 min-h-[10rem] font-mono"
			style="grid-column: 1/5;"
			rows="5"
			value={$customCSS$}
			on:blur={handleCustomCSSBlur}
		/>
	</div>
{/if}
