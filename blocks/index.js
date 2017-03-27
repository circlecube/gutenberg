/* eslint-disable no-console */

/**
 * External dependencies
 */
import * as query from 'hpq';

export { query };
export { default as Editable } from './components/editable';
export { parse } from './post.pegjs';

/**
 * Block settings keyed by block slug.
 *
 * @var {Object} blocks
 */
const blocks = {};

/**
 * Registers a new block provided a unique slug and an object defining its
 * behavior. Once registered, the block is made available as an option to any
 * editor interface where blocks are implemented.
 *
 * @param  {string}   slug     Block slug
 * @param  {Object}   settings Block settings
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
export function registerBlock( slug, settings ) {
	if ( typeof slug !== 'string' ) {
		console.error(
			'Block slugs must be strings.'
		);
		return;
	}
	if ( ! /^[a-z0-9-]+\/[a-z0-9-]+$/.test( slug ) ) {
		console.error(
			'Block slugs must contain a namespace prefix. Example: my-plugin/my-custom-block'
		);
		return;
	}
	if ( blocks[ slug ] ) {
		console.error(
			'Block "' + slug + '" is already registered.'
		);
		return;
	}
	const block = Object.assign( { slug }, settings );
	blocks[ slug ] = block;
	return block;
}

/**
 * Unregisters a block.
 *
 * @param  {string}   slug Block slug
 * @return {?WPBlock}      The previous block value, if it has been
 *                         successfully unregistered; otherwise `undefined`.
 */
export function unregisterBlock( slug ) {
	if ( ! blocks[ slug ] ) {
		console.error(
			'Block "' + slug + '" is not registered.'
		);
		return;
	}
	const oldBlock = blocks[ slug ];
	delete blocks[ slug ];
	return oldBlock;
}

/**
 * Returns settings associated with a registered block.
 *
 * @param  {string}  slug Block slug
 * @return {?Object}      Block settings
 */
export function getBlockSettings( slug ) {
	return blocks[ slug ];
}

/**
 * Returns the block attributes of a registered block node given its settings.
 *
 * @param  {Object} blockNode     Parsed block node
 * @param  {Object} blockSettings Block settings
 * @return {Object}               Block state, or undefined if type unknown
 */
export function getBlockAttributes( blockNode, blockSettings ) {
	const { rawContent } = blockNode;

	// Merge attributes from parse with block implementation
	let { attrs } = blockNode;

	// Block attributes by function
	if ( 'function' === typeof blockSettings.attributes ) {
		return { ...attrs, ...blockSettings.attributes( rawContent ) };
	}

	// Block attributes by hpq
	if ( blockSettings.attributes ) {
		return { ...attrs, ...query.parse( rawContent, blockSettings.attributes ) };
	}
}

/**
 * Returns all registered blocks.
 *
 * @return {Array} Block settings
 */
export function getBlocks() {
	return Object.values( blocks );
}

/**
 * Returns all public registered blocks.
 *
 * @return {Array} Block settings
 */
export function getVisibleBlocks() {
	return getBlocks().filter( ( block ) => false !== block.isVisible );
}
