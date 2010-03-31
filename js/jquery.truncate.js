// jquery.truncate.js
// 
// 0.5
// Stephen Band
// 
// Truncates the html of a node so that the node is no higher than content in options.match
// Options:
// marker					- character or jQuery object placed at end of truncation.
// match 					- content to match in height, typically smething like '<br /><br />'.
// truncateByWord - causes truncation only to happen on word boundaries.
//
// TODO:
// Support html tags
// Support file extensions by truncating the middle a la OS X: 'xxxxxx...xxx'

(function(undefined){
	
	var options = {
				marker: '\u2026',
				truncateByWord: false,
				minlength: 1
			},
			// Uses a zero width space for testing
			testNode = jQuery('<span/>').html('\u200B');
	
	function fillNode(node, html, testNode){
		node
		.html(
			jQuery( document.createTextNode( html ) )
			.add( testNode )
		);
	}
	
	jQuery.fn.truncate = function(text, opt){
		if (typeof text !== 'string') {
			opt = text;
			text = undefined;
		}
		
		var o = jQuery.extend({}, options, opt);
		
		return this.each(function(){
			var node = jQuery(this),
					data = node.data('truncate'),
					html = text || data && data.html || node.html(),
					match = o.match || data && data.match || '&nbsp;',
					newHtml = html,
					length = html.length,
					targetOffset, normalOffset, currentOffset, x, y;
			
			if ( !data ) {
				node.data('truncate', {
					html: html,
					match: match
				});
				
				jQuery(window)
				.bind('resize', function(){
					// Iterative, yes, cool, questionable
					node.truncate();
				});
			}
			
			// If it's not visible we can't do anything with it
			if ( !node.is(":visible") ) {
			 return;
			}
			
			// Offset of the node when it has target content.
			node
			.html( match )
			.append( testNode );
			targetOffset = testNode.offset();
			
			// Offset of the node when it's full.
			node
			.html( html )
			.append( testNode );
			currentOffset = testNode.offset();
			
			// Why carry on if everything's already hunkydory?
			if ( currentOffset.top <= targetOffset.top ) {
				testNode.remove();
				return;
			};
			
			// x keeps track of the amount we're adding or subtracting from the
			// length, while y stops us crashing the browser in an infinite loop
			// by turning false when x has had a value of 1 for two turns.
			x = length;
			y = true;
			
			// Home in.
			while ( x > 1 || y && currentOffset.top > targetOffset.top ) {
				y = ( x !== 1 );
				x = Math.ceil(x/2);
				
				length = ( currentOffset.top > targetOffset.top ?
					length - x :
					length + x ) ;
				
				newHtml = html.slice(0, length) + o.marker;
				fillNode(node, newHtml, testNode);
				currentOffset = testNode.offset();
			}
			
			// If truncating by words, lop off letters until we find a space.
			if ( o.truncateByWord ) {
				while ( length-- ) {
					if ( /\s/.test( html[length+1] ) ) {
						newHtml = html.slice(0, length+1) + o.marker;
				  		fillNode(node, newHtml, testNode);
						break;
					}
				}
			}
			
			testNode.remove();
			return;
		});
	};
})();