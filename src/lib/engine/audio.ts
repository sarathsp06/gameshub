/**
 * Audio engine using Web Speech Synthesis API.
 * Speaks phonemes, words, and short phrases for the phonics game.
 */

const PHONEME_PRONUNCIATIONS: Record<string, string> = {
	a: 'ah',
	b: 'buh',
	c: 'kuh',
	d: 'duh',
	e: 'eh',
	f: 'fuh',
	g: 'guh',
	h: 'huh',
	i: 'ih',
	j: 'juh',
	k: 'kuh',
	l: 'luh',
	m: 'muh',
	n: 'nuh',
	o: 'oh',
	p: 'puh',
	q: 'kwuh',
	r: 'ruh',
	s: 'suh',
	t: 'tuh',
	u: 'uh',
	v: 'vuh',
	w: 'wuh',
	x: 'eks',
	y: 'yuh',
	z: 'zuh',
	sh: 'shh',
	ch: 'chuh',
	th: 'thuh',
	ck: 'kuh',
	ng: 'nng',
	wh: 'wuh',
	qu: 'kwuh'
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

function speak(text: string, rate = 0.8, pitch = 1.2): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window === 'undefined' || !window.speechSynthesis) {
			resolve();
			return;
		}

		// Cancel any ongoing speech
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = rate;
		utterance.pitch = pitch;
		utterance.onend = () => resolve();
		utterance.onerror = () => resolve();
		currentUtterance = utterance;

		window.speechSynthesis.speak(utterance);
	});
}

/** Speak a single phoneme sound (e.g., 'c' → "kuh") */
export function speakPhoneme(phoneme: string): Promise<void> {
	const pronunciation = PHONEME_PRONUNCIATIONS[phoneme.toLowerCase()] ?? phoneme;
	return speak(pronunciation, 0.6, 1.3);
}

/** Speak a whole word clearly */
export function speakWord(word: string): Promise<void> {
	return speak(word, 0.7, 1.1);
}

/** Speak a short phrase or sentence */
export function speakPhrase(phrase: string): Promise<void> {
	return speak(phrase, 0.85, 1.0);
}

/** Stop any current speech */
export function stopSpeech() {
	if (typeof window !== 'undefined' && window.speechSynthesis) {
		window.speechSynthesis.cancel();
	}
	currentUtterance = null;
}
