/**
 * Games Hub Tile Definitions
 * The landing page shows a grid of game tiles.
 * Only "Phonics Adventure" is active; the rest are Coming Soon placeholders.
 */

export interface HubGame {
	id: string;
	title: string;
	emoji: string;
	description: string;
	color: string;
	gradient: string;
	route: string;
	status: 'active' | 'coming-soon';
	ribbon?: string;
}

export const hubGames: HubGame[] = [
	{
		id: 'phonics-adventure',
		title: 'Phonics Adventure',
		emoji: '📖',
		description: 'Learn to read with letter sounds, word building, and stories!',
		color: '#FF8C42',
		gradient: 'linear-gradient(135deg, #FF8C42 0%, #FFD166 50%, #06D6A0 100%)',
		route: '/phonics',
		status: 'active',
	},
	{
		id: 'number-jungle',
		title: 'Number Jungle',
		emoji: '🔢',
		description: 'Count, add, and explore the world of numbers!',
		color: '#7B2FF7',
		gradient: 'linear-gradient(135deg, #7B2FF7 0%, #C77DFF 100%)',
		route: '',
		status: 'coming-soon',
		ribbon: 'Coming Soon!',
	},
	{
		id: 'spelling-bee',
		title: 'Spelling Bee',
		emoji: '🐝',
		description: 'Buzz your way to becoming a spelling champion!',
		color: '#FFD166',
		gradient: 'linear-gradient(135deg, #FFD166 0%, #FF8C42 100%)',
		route: '',
		status: 'coming-soon',
		ribbon: 'Coming Soon!',
	},
	{
		id: 'story-time',
		title: 'Story Time',
		emoji: '📚',
		description: 'Read-along interactive stories with fun characters!',
		color: '#06D6A0',
		gradient: 'linear-gradient(135deg, #06D6A0 0%, #1B9AAA 100%)',
		route: '',
		status: 'coming-soon',
		ribbon: 'Coming Soon!',
	},
];
