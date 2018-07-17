/**
 * This is a JavaScript snippet to download all of the custom emoji for a Slack
 * instance to a folder.  Here's how to use it:
 *
 *  - Visit https://yourslackteam.slack.com/customize/emoji and log in
 *  - Paste this script into your browser console and run it.  Chrome works,
 *    and Firefox should as well.  A list of shell commands to download the
 *    emoji will be copied to your clipboard.
 *  - Save these shell commands to a file (for example `download.sh`)
 *  - Run `chmod +x download.sh` and `./download.sh` (on OS X or Linux)
 */
( () => {
	const emojis = [];
	const aliases = {};

	$$( '#custom_emoji tr.emoji_row' ).forEach( tr => {
		const name = tr.querySelector( 'td[headers=custom_emoji_name]' )
			.innerText
			.replace( /:/g, '' );
		const type = tr.querySelector( 'td[headers=custom_emoji_type]' )
			.innerText;
		const aliasMatch = type.match( /^Alias for :([^:]+):$/ );
		if ( type === 'Image' ) {
			const emojiUrl = tr.querySelector( '.emoji-wrapper' )
				.getAttribute( 'data-original' );
			const extension = emojiUrl.replace( /^.*(\.\w+)$/, '$1' );
			emojis.push( {
				url: emojiUrl,
				filename: name + extension,
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

	let script = [ '#!/bin/bash', 'set -e', 'set -x', 'rm *.gif *.jpg *.png' ]
		.concat( emojis.map( emoji => {
			return 'wget "' + emoji.url + '" -O ' + emoji.filename;
		} ) )
		.concat( [ '> aliases.txt' ] )
		.concat( Object.keys( aliases ).map( name => {
			return 'echo "' + name + ':' + aliases[ name ].join( ',' ) + '" >> aliases.txt';
		} ) )
		.join( '\n' ) + '\n';

	copy( script );
	console.log( script );
	console.log( 'Above bash script copied to clipboard' );
	console.log( 'Paste it to a file and run it using bash!' );
} )();
