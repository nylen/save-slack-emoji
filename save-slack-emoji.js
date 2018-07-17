/**
 * This is a JavaScript snippet to download all of the custom emoji for a Slack
 * instance to a folder.  Here's how to use it (on OS X or Linux):
 *
 * 1. Visit https://yourslackteam.slack.com/customize/emoji and log in.
 * 2. Paste this script into your browser console and run it.  Chrome works,
 *    and Firefox is untested but may possibly work.  The code will prompt you
 *    to save the emoji list to a file like `download.sh`.
 * 3. If the emoji list spans multiple pages, run the script once for each page
 *    and save each resulting script to a separate file (`download-1.sh` etc).
 * 4. Run `chmod +x download.sh` and `./download.sh`.  If there are scripts for
 *    multiple pages, run them all **in sequential order**.
 * 5. Recommended:  Keep the emoji scripts and files in a git repository.  You
 *    can make a new commit with the new emoji now.
 */
( () => {
	// Prompt to save arbitrary data as a file
	// https://stackoverflow.com/a/19818659
	// http://bgrins.github.io/devtools-snippets/#console-save
	const saveAsFile = ( data, filename ) => {
		const mimeType = 'text/plain';

		const blob = new Blob(
			[ new TextEncoder().encode( data ) ],
			{ type: mimeType }
		);
		const e = document.createEvent( 'MouseEvents' );
		const a = document.createElement( 'a' );

		a.download = filename;
		a.href = window.URL.createObjectURL( blob );
		a.dataset.downloadurl = [ mimeType, a.download, a.href ].join( ':' );
		e.initMouseEvent(
			'click',
			true,
			false,
			window,
			0,
			0, 0, 0, 0,
			false, false, false, false,
			0,
			null
		);
		a.dispatchEvent( e );
	}

	const emojis = [];
	const aliases = {};

	$$( '#custom_emoji tr.emoji_row' ).forEach( tr => {
		const name = tr.querySelector( 'td[headers=custom_emoji_name]' )
			.innerText
			.replace( /:/g, '' );
		const tdType = tr.querySelector( 'td[headers=custom_emoji_type]' );
		// Possible state: "This custom emoji was disabled: In the latest emoji
		// set, there’s a standard emoji using this name. To continue using
		// your custom emoji, you’ll need to rename it." When this happens, the
		// `custom_emoji_type` cell does not exist.
		const type = tdType ? tdType.innerText : '_custom_disabled_';
		const aliasMatch = type.match( /^Alias for :([^:]+):$/ );
		if ( type === 'Image' || type === '_custom_disabled_' ) {
			const emojiUrl = tr.querySelector( '.emoji-wrapper' )
				.getAttribute( 'data-original' );
			const extension = emojiUrl.replace( /^.*(\.\w+)$/, '$1' );
			emojis.push( {
				url: emojiUrl,
				name,
				filename: name + extension,
				disabled: ( type === '_custom_disabled_' ),
			} );
		} else if ( aliasMatch ) {
			const aliasFor = aliasMatch[ 1 ];
			aliases[ aliasFor ] = ( aliases[ aliasFor ] || [] ).concat( name );
		} else {
			console.log(
				'Unknown emoji type "%s" for emoji "%s"',
				type,
				name
			);
		}
	} );

	const pageMarkers = $$( '.pagination li' ).map( el => +el.innerText || 0 );
	const pageMax = Math.max( ...( [ 1 ].concat( pageMarkers ) ) );
	let pageCurrent = $$( '.pagination li.active' )[ 0 ];
	pageCurrent = pageCurrent ? +pageCurrent.innerText : 1;

	let script = [ '#!/bin/bash', 'set -x' ];
	if ( pageCurrent === 1 ) {
		script = script.concat( [
			'',
			'# CLEANUP',
			'rm *.png *.gif *.jpg',
			'> aliases.txt',
			'',
		] );
	}
	script = script.concat( emojis.map( emoji => {
		let command = 'wget "' + emoji.url + '" -O ' + emoji.filename;
		if ( emoji.disabled ) {
			command = '# Disabled custom emoji: '
				+ emoji.name + '\n' + command;
		}
		return command;
	} ) ).concat( Object.keys( aliases ).map( name => {
		return 'echo "' + name + ':' + aliases[ name ].join( ',' ) + '" >> aliases.txt';
	} ) );
	script = script.join( '\n' ) + '\n';

	console.log( 'Prompting to save bash script...' );

	let filename = 'download.sh';
	if ( pageMax > 1 ) {
		console.log(
			'This is page %d of %d!  Save each page to a separate script!',
			pageCurrent,
			pageMax
		);
		filename = 'download-' + pageCurrent + '.sh';
	}

	saveAsFile( script, filename );

	if (
		pageCurrent < pageMax &&
		confirm( 'Navigate to next page?' )
	) {
		document.location.href = $$( '.pagination li:last-child a' )[0].href;
	}
} )();
