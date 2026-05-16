/**
 * Word-first phonics curriculum (v2).
 * Each world has 8 levels. Each level has a set of words.
 * Kids see whole words first, then break them apart to discover sounds.
 */

export interface LevelData {
	id: string;
	words: string[];
	distractors: string; // extra letters to add as wrong choices
	requireOrder: boolean; // must pop/place letters in order?
	hintDelay: number; // seconds before hint appears
	soundsDiscovered: string[];
	storyIntro?: string; // Foxy says this before the level starts
}

export interface WorldData {
	id: string;
	name: string;
	subtitle: string;
	emoji: string;
	color: number; // hex color for the world theme
	mechanic: string;
	mascot: string; // emoji for the world's helper animal
	worldStory: string; // narrative framing for the whole world
	levels: LevelData[];
}

export const worlds: WorldData[] = [
	{
		id: 'meadow',
		name: 'Sunny Meadow',
		subtitle: 'Bubble Pop',
		emoji: '🌻',
		color: 0x87ceeb,
		mechanic: 'Pop floating letter bubbles to spell words',
		mascot: '🦊',
		worldStory: "Foxy's magical word garden has lost all its letters! The wind blew them into bubbles. Can you pop the right bubbles to grow word flowers?",
		levels: [
			{
				id: '1-1',
				words: ['cat', 'sat', 'mat'],
				distractors: '',
				requireOrder: false,
				hintDelay: 999,
				soundsDiscovered: ['c', 'a', 't', 's', 'm'],
				storyIntro: "Oh no! Foxy's cat is hiding! Pop the bubbles to spell CAT and find her!"
			},
			{
				id: '1-2',
				words: ['pin', 'pan', 'tin'],
				distractors: 'x',
				requireOrder: false,
				hintDelay: 999,
				soundsDiscovered: ['p', 'i', 'n'],
				storyIntro: "Foxy needs a pin to fix her hat! Help her find the right letters!"
			},
			{
				id: '1-3',
				words: ['dog', 'log', 'fog'],
				distractors: 'rx',
				requireOrder: true,
				hintDelay: 3,
				soundsDiscovered: ['d', 'o', 'g', 'l', 'f'],
				storyIntro: "Foxy's dog friend is lost in the fog! Spell the words to clear the path!"
			},
			{
				id: '1-4',
				words: ['sun', 'run', 'bun'],
				distractors: 'px',
				requireOrder: true,
				hintDelay: 5,
				soundsDiscovered: ['u', 'r', 'b'],
				storyIntro: "The sun is hiding behind clouds! Pop bubbles to bring back the sunshine!"
			},
			{
				id: '1-5',
				words: ['hat', 'bat', 'rat'],
				distractors: 'dim',
				requireOrder: true,
				hintDelay: 5,
				soundsDiscovered: ['h'],
				storyIntro: "Foxy found a treasure chest of hats! Which words are inside?"
			},
			{
				id: '1-6',
				words: ['cup', 'bus', 'bug'],
				distractors: 'dnl',
				requireOrder: true,
				hintDelay: 5,
				soundsDiscovered: [],
				storyIntro: "Foxy is having a picnic! Help spell what she brought!"
			},
			{
				id: '1-7',
				words: ['jam', 'van', 'wax'],
				distractors: 'bpit',
				requireOrder: true,
				hintDelay: 4,
				soundsDiscovered: ['j', 'v', 'w', 'x'],
				storyIntro: "Foxy's friends are coming in a van! What treats did they bring?"
			},
			{
				id: '1-8',
				words: ['yes', 'zip', 'quiz', 'fox', 'web'],
				distractors: 'bcnl',
				requireOrder: true,
				hintDelay: 4,
				soundsDiscovered: ['y', 'z', 'qu', 'e'],
				storyIntro: "It's the big garden party! Foxy needs ALL the word flowers. You can do it!"
			}
		]
	},
	{
		id: 'workshop',
		name: 'Word Workshop',
		subtitle: 'Word Machine',
		emoji: '⚙️',
		color: 0xd4a574,
		mechanic: 'Drag letter balls into the machine to build words',
		mascot: '🐻',
		worldStory: "Bear's Word Machine is broken! The letters got all jumbled up. Drag the right letter balls into the machine to fix each word!",
		levels: [
			{ id: '2-1', words: ['cat', 'dog', 'sun', 'hat', 'bus'], distractors: 'fwz', requireOrder: true, hintDelay: 5, soundsDiscovered: [] },
			{ id: '2-2', words: ['bag', 'map', 'cap', 'tap', 'nap'], distractors: 'dol', requireOrder: true, hintDelay: 5, soundsDiscovered: [] },
			{ id: '2-3', words: ['big', 'pig', 'dig', 'sit', 'bit'], distractors: 'mof', requireOrder: true, hintDelay: 5, soundsDiscovered: [] },
			{ id: '2-4', words: ['hot', 'pot', 'box', 'fox', 'mop'], distractors: 'dng', requireOrder: true, hintDelay: 5, soundsDiscovered: [] },
			{ id: '2-5', words: ['cup', 'pup', 'tub', 'rug', 'hug'], distractors: 'saf', requireOrder: true, hintDelay: 5, soundsDiscovered: [] },
			{ id: '2-6', words: ['bed', 'red', 'pet', 'net', 'hen'], distractors: 'gam', requireOrder: true, hintDelay: 5, soundsDiscovered: [] },
			{ id: '2-7', words: ['bag', 'pig', 'hot', 'cup', 'bed'], distractors: 'zwxy', requireOrder: true, hintDelay: 4, soundsDiscovered: [] },
			{ id: '2-8', words: ['stop', 'flag', 'trip', 'drum'], distractors: 'bce', requireOrder: true, hintDelay: 4, soundsDiscovered: [] }
		]
	},
	{
		id: 'ocean',
		name: 'Deep Ocean',
		subtitle: 'Treasure Dive',
		emoji: '🐠',
		color: 0x1a6b8a,
		mechanic: 'Find treasure chests and complete word puzzles',
		mascot: '🐙',
		worldStory: "Ollie the Octopus found treasure chests at the bottom of the sea! But they're locked with word puzzles. Help Ollie open them!",
		levels: [
			{ id: '3-1', words: ['ship', 'shop', 'fish', 'wish'], distractors: 'bmt', requireOrder: true, hintDelay: 5, soundsDiscovered: ['sh'] },
			{ id: '3-2', words: ['chip', 'chop', 'rich', 'much'], distractors: 'bst', requireOrder: true, hintDelay: 5, soundsDiscovered: ['ch'] },
			{ id: '3-3', words: ['thin', 'this', 'bath', 'math'], distractors: 'fpg', requireOrder: true, hintDelay: 5, soundsDiscovered: ['th'] },
			{ id: '3-4', words: ['duck', 'rock', 'sock', 'back'], distractors: 'pmn', requireOrder: true, hintDelay: 5, soundsDiscovered: ['ck'] },
			{ id: '3-5', words: ['ring', 'sing', 'long', 'king'], distractors: 'bpt', requireOrder: true, hintDelay: 5, soundsDiscovered: ['ng'] },
			{ id: '3-6', words: ['when', 'what', 'whip'], distractors: 'bcfm', requireOrder: true, hintDelay: 5, soundsDiscovered: ['wh'] },
			{ id: '3-7', words: ['ship', 'chip', 'thin', 'ring', 'duck'], distractors: 'bpm', requireOrder: true, hintDelay: 4, soundsDiscovered: [] },
			{ id: '3-8', words: ['fish', 'much', 'bath', 'sock', 'king', 'whip'], distractors: 'dlr', requireOrder: true, hintDelay: 3, soundsDiscovered: [] }
		]
	},
	{
		id: 'castle',
		name: 'Magic Castle',
		subtitle: 'Spell Caster',
		emoji: '🏰',
		color: 0x8b5cf6,
		mechanic: 'Cast spells to transform words with magic-e and vowel teams',
		mascot: '🦉',
		worldStory: "Owlbert the Wizard discovered that adding a magic 'e' transforms words! Wave the wand and watch the magic happen!",
		levels: [
			{ id: '4-1', words: ['cape', 'tape', 'mate'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: [] },
			{ id: '4-2', words: ['pine', 'bite', 'kite'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: [] },
			{ id: '4-3', words: ['hope', 'note', 'robe'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: [] },
			{ id: '4-4', words: ['cube', 'cute', 'tube'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: [] },
			{ id: '4-5', words: ['rain', 'tail', 'play', 'day'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: ['ai', 'ay'] },
			{ id: '4-6', words: ['tree', 'bee', 'sea', 'eat'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: ['ee', 'ea'] },
			{ id: '4-7', words: ['boat', 'coat', 'snow', 'grow'], distractors: '', requireOrder: false, hintDelay: 5, soundsDiscovered: ['oa', 'ow'] },
			{ id: '4-8', words: ['cape', 'kite', 'hope', 'rain', 'tree', 'boat'], distractors: '', requireOrder: false, hintDelay: 4, soundsDiscovered: [] }
		]
	},
	{
		id: 'jungle',
		name: 'Jungle Ruins',
		subtitle: 'Word Explorer',
		emoji: '🌴',
		color: 0x2d8b4e,
		mechanic: 'Decode stone tablets with blends and r-controlled vowels',
		mascot: '🐒',
		worldStory: "Miko the Monkey found ancient stone tablets in the jungle ruins! The words on them are split apart. Help Miko put them back together!",
		levels: [
			{ id: '5-1', words: ['blue', 'clap', 'flag', 'flat'], distractors: 'mst', requireOrder: true, hintDelay: 5, soundsDiscovered: ['bl', 'cl', 'fl'] },
			{ id: '5-2', words: ['crab', 'drop', 'drum', 'bring'], distractors: 'fst', requireOrder: true, hintDelay: 5, soundsDiscovered: ['br', 'cr', 'dr'] },
			{ id: '5-3', words: ['stop', 'spot', 'swim', 'step'], distractors: 'bcf', requireOrder: true, hintDelay: 5, soundsDiscovered: ['st', 'sp', 'sw'] },
			{ id: '5-4', words: ['trip', 'grab', 'frog', 'from'], distractors: 'bns', requireOrder: true, hintDelay: 5, soundsDiscovered: ['tr', 'gr', 'fr'] },
			{ id: '5-5', words: ['car', 'star', 'farm', 'park'], distractors: 'bdn', requireOrder: true, hintDelay: 5, soundsDiscovered: ['ar'] },
			{ id: '5-6', words: ['fork', 'corn', 'her', 'fern'], distractors: 'bps', requireOrder: true, hintDelay: 5, soundsDiscovered: ['or', 'er'] },
			{ id: '5-7', words: ['bird', 'girl', 'burn', 'turn'], distractors: 'cps', requireOrder: true, hintDelay: 5, soundsDiscovered: ['ir', 'ur'] },
			{ id: '5-8', words: ['star', 'fork', 'bird', 'frog', 'clap'], distractors: 'mnw', requireOrder: true, hintDelay: 3, soundsDiscovered: [] }
		]
	},
	{
		id: 'sky',
		name: 'Sky Kingdom',
		subtitle: 'Story Flight',
		emoji: '☁️',
		color: 0xe8b4f8,
		mechanic: 'Fly between islands and read decodable stories',
		mascot: '🦜',
		worldStory: "Polly the Parrot is flying her airship between floating islands! Each island has a story to read. Can you help Polly read them all?",
		levels: [
			{ id: '6-1', words: ['the', 'cat', 'sat', 'on', 'mat'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-2', words: ['the', 'ship', 'went', 'to', 'shop'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-3', words: ['the', 'frog', 'swam', 'in', 'stream'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-4', words: ['the', 'kite', 'flew', 'over', 'lake'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-5', words: ['sam', 'and', 'the', 'big', 'fish'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-6', words: ['the', 'magic', 'cape'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-7', words: ['trip', 'to', 'the', 'farm'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] },
			{ id: '6-8', words: ['the', 'sky', 'kingdom'], distractors: '', requireOrder: false, hintDelay: 999, soundsDiscovered: [] }
		]
	}
];

export function getWorld(worldId: string): WorldData | undefined {
	return worlds.find((w) => w.id === worldId);
}

export function getLevel(worldId: string, levelId: string): LevelData | undefined {
	return getWorld(worldId)?.levels.find((l) => l.id === levelId);
}
